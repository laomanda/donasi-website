<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\StoreManualDonationRequest;
use App\Http\Requests\Admin\UpdateDonationStatusRequest;
use App\Services\DonationService;

class DonationController extends Controller
{
    public function __construct(private DonationService $donationService)
    {
    }

    /**
     * List donations with filters.
     */
    public function index(Request $request)
    {
        $query = Donation::with('program');

        $status = $request->string('status')->trim()->toString();
        if ($status !== '') {
            $query->where('status', $status);
        }

        if ($programId = $request->integer('program_id')) {
            $query->where('program_id', $programId);
        }

        $source = $request->string('payment_source')->trim()->toString();
        if ($source !== '') {
            $query->where('payment_source', $source);
        }

        if ($dateFrom = $request->date('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->date('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $search = $request->string('q')->trim()->toString();
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('donation_code', 'like', "%{$search}%")
                    ->orWhere('donor_name', 'like', "%{$search}%");
            });
        }

        $donations = $query->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20));

        return response()->json($donations);
    }

    /**
     * Store manual donation (offline).
     */
    public function storeManual(StoreManualDonationRequest $request)
    {
        $donation = $this->donationService->storeManualDonation($request->validated());
        return response()->json($donation, 201);
    }

    public function show(Donation $donation)
    {
        return response()->json($donation->load('program'));
    }

    /**
     * Update donation status (manual verification, etc).
     */
    public function updateStatus(UpdateDonationStatusRequest $request, Donation $donation)
    {
        $updatedDonation = $this->donationService->updateStatus($donation, $request->validated());
        return response()->json($updatedDonation->load('program'));
    }

    /**
     * Delete donation (rare). Adjust totals if needed.
     */
    public function destroy(Donation $donation)
    {
        $this->donationService->deleteDonation($donation);
        return response()->json(['message' => 'Donation deleted.']);
    }

    /**
     * Terminate donation (kirim WA manual dari admin).
     */
    public function sendWhatsapp(Request $request, Donation $donation)
    {
        $request->validate([
            'phone'   => ['required', 'string', 'max:20'],
            'message' => ['required', 'string'],
        ]);

        $this->donationService->markWhatsappSent($donation);

        return response()->json(['message' => 'WhatsApp status updated successfully.']);
    }

    public function export(Donation $donation)
    {
        $donation->load('program');

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.donation_invoice', [
            'donation' => $donation,
        ])->setPaper('a5', 'portrait');

        return $pdf->download("invoice-{$donation->donation_code}.pdf");
    }
}
