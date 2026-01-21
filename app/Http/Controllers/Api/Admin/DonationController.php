<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DonationController extends Controller
{
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
    public function storeManual(Request $request)
    {
        $data = $request->validate([
            'program_id'      => ['nullable', 'exists:programs,id'],
            'donor_name'      => ['required', 'string', 'max:255'],
            'donor_email'     => ['nullable', 'email'],
            'donor_phone'     => ['nullable', 'string', 'max:50'],
            'amount'          => ['required', 'numeric', 'min:1'],
            'is_anonymous'    => ['required', 'boolean'],
            'payment_method'  => ['required', 'string', 'max:100'],
            'payment_channel' => ['nullable', 'string', 'max:255'],
            'notes'           => ['nullable', 'string'],
            'manual_proof_path' => ['nullable', 'string', 'max:255'],
        ]);

        $data['payment_source'] = 'manual';
        $data['status'] = 'paid';
        $data['paid_at'] = now();
        $data['donation_code'] = $this->generateDonationCode();

        $donation = DB::transaction(function () use ($data) {
            $created = Donation::create($data);
            $this->syncProgramAmount($created, null, 'paid');

            return $created->load('program');
        });

        return response()->json($donation, 201);
    }

    public function show(int $donationId)
    {
        $donation = $this->findDonation($donationId);

        if (! $donation) {
            return response()->json(['message' => 'Donation not found.'], 404);
        }

        return response()->json($donation->load('program'));
    }

    /**
     * Update donation status (manual verification, etc).
     */
    public function updateStatus(Request $request, int $donationId)
    {
        $donation = $this->findDonation($donationId);

        if (! $donation) {
            return response()->json(['message' => 'Donation not found.'], 404);
        }

        $data = $request->validate([
            'status' => ['required', 'in:pending,paid,failed,expired,cancelled'],
            'paid_at' => ['nullable', 'date'],
            'notes'   => ['nullable', 'string'],
        ]);

        $previousStatus = $donation->status;

        $donation->update($data);

        $this->syncProgramAmount($donation, $previousStatus, $donation->status);

        return response()->json($donation->refresh()->load('program'));
    }

    /**
     * Delete donation (rare). Adjust totals if needed.
     */
    public function destroy(int $donationId)
    {
        $donation = $this->findDonation($donationId);

        if (! $donation) {
            return response()->json(['message' => 'Donation not found.'], 404);
        }

        $previousStatus = $donation->status;

        $donation->delete();

        if ($previousStatus === 'paid' && $donation->program_id) {
            $donation->program()->decrement('collected_amount', $donation->amount);
        }

        return response()->json(['message' => 'Donation deleted.']);
    }

    private function generateDonationCode(): string
    {
        $prefix = 'DPF-' . now()->format('Ymd');

        $lastCode = Donation::where('donation_code', 'like', "{$prefix}%")
            ->orderByDesc('donation_code')
            ->value('donation_code');

        $sequence = $lastCode ? (int) substr($lastCode, -4) : 0;
        $sequence++;

        return sprintf('%s-%04d', $prefix, $sequence);
    }

    private function syncProgramAmount(Donation $donation, ?string $oldStatus, string $newStatus): void
    {
        if (! $donation->program_id) {
            return;
        }

        $program = Program::find($donation->program_id);

        if (! $program) {
            return;
        }

        if ($oldStatus !== 'paid' && $newStatus === 'paid') {
            $program->increment('collected_amount', $donation->amount);
        } elseif ($oldStatus === 'paid' && $newStatus !== 'paid') {
            $program->decrement('collected_amount', $donation->amount);
        }
    }

    private function findDonation(int $donationId): ?Donation
    {
        return Donation::find($donationId);
    }
}
