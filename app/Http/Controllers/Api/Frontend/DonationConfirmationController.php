<?php

namespace App\Http\Controllers\Api\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DonationConfirmationController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'program_id'          => ['nullable', 'exists:programs,id'],
            'donor_name'          => ['required', 'string', 'max:255'],
            'donor_phone'         => ['required', 'string', 'max:30'],
            'donor_email'         => ['nullable', 'email'],
            'amount'              => ['required', 'numeric', 'min:1000'],
            'bank_destination'    => ['required', 'string', 'max:255'],
            'purpose'             => ['required', 'string', 'max:255'], // contoh: nama program / donasi umum
            'notes'               => ['nullable', 'string'],
            'proof'               => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:10240'],
        ]);

        $proofPath = null;
        if ($request->hasFile('proof')) {
            $proofPath = $request->file('proof')->store('donation-proofs', 'public');
        }

        $combinedNotes = $data['notes'] ?? null;
        $purposeNote = $data['purpose'] ? 'Tujuan: ' . $data['purpose'] : null;
        if ($purposeNote) {
            $combinedNotes = $combinedNotes ? $purposeNote . ' | ' . $combinedNotes : $purposeNote;
        }

        $donation = DB::transaction(function () use ($data, $combinedNotes, $proofPath) {
            return Donation::create([
                'program_id'            => $data['program_id'] ?? null,
                'donation_code'         => $this->generateDonationCode(),
                'donor_name'            => $data['donor_name'],
                'donor_email'           => $data['donor_email'] ?? null,
                'donor_phone'           => $data['donor_phone'],
                'amount'                => $data['amount'],
                'is_anonymous'          => false,
                'payment_source'        => 'manual',
                'payment_method'        => 'transfer',
                'payment_channel'       => $data['bank_destination'] ?? null,
                'status'                => 'pending',
                'notes'                 => $combinedNotes,
                'manual_proof_path'     => $proofPath,
                'midtrans_order_id'     => null,
                'midtrans_transaction_id' => null,
                'midtrans_raw_response' => null,
            ]);
        });

        return response()->json([
            'message'  => 'Konfirmasi donasi diterima. Tim akan memverifikasi.',
            'donation' => $donation,
        ], 201);
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
}
