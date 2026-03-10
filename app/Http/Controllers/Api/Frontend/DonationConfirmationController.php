<?php

namespace App\Http\Controllers\Api\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use Illuminate\Http\Request;
use App\Http\Requests\Frontend\StoreDonationConfirmationRequest;
use App\Services\DonationService;

class DonationConfirmationController extends Controller
{
    public function __construct(private DonationService $donationService)
    {
    }

    public function store(StoreDonationConfirmationRequest $request)
    {
        $proofPath = null;
        if ($request->hasFile('proof')) {
            $proofPath = $request->file('proof')->store('donation-proofs', 'public');
        }

        $donation = $this->donationService->confirmManualDonation($request->validated(), $proofPath);

        return response()->json([
            'message'  => 'Konfirmasi donasi diterima. Tim akan memverifikasi.',
            'donation' => $donation,
        ], 201);
    }
}
