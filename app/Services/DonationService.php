<?php

namespace App\Services;

use App\Models\Donation;
use App\Models\Program;
use Illuminate\Support\Facades\DB;

class DonationService
{
    public function storeManualDonation(array $data): Donation
    {
        $data['payment_source'] = 'manual';
        $data['status'] = 'paid';
        $data['paid_at'] = now();
        $data['donation_code'] = $this->generateDonationCode();

        return DB::transaction(function () use ($data) {
            $created = Donation::create($data);
            $this->syncProgramAmount($created, null, 'paid');

            return $created->load('program');
        });
    }

    public function createMidtransDonation(array $data): Donation
    {
        $orderId = $this->generateMidtransOrderId();
        $programId = $data['program_id'] ?? null;

        return DB::transaction(function () use ($data, $orderId, $programId) {
            return Donation::create([
                'program_id'            => $programId,
                'donation_code'         => $this->generateDonationCode(),
                'donor_name'            => $data['donor_name'],
                'donor_email'           => $data['donor_email'] ?? null,
                'donor_phone'           => $data['donor_phone'] ?? null,
                'amount'                => $data['amount'],
                'is_anonymous'          => $data['is_anonymous'],
                'payment_source'        => 'midtrans',
                'payment_method'        => 'snap',
                'status'                => 'pending', 
                'paid_at'               => null,
                'notes'                 => $data['notes'] ?? null,
                'midtrans_order_id'     => $orderId,
                'user_id'               => auth('sanctum')->id(),
            ]);
        });
    }

    public function confirmManualDonation(array $data, ?string $proofPath): Donation
    {
        $combinedNotes = $data['notes'] ?? null;
        $purposeNote = !empty($data['purpose']) ? 'Tujuan: ' . $data['purpose'] : null;
        if ($purposeNote) {
            $combinedNotes = $combinedNotes ? $purposeNote . ' | ' . $combinedNotes : $purposeNote;
        }

        return DB::transaction(function () use ($data, $combinedNotes, $proofPath) {
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
            ]);
        });
    }

    public function updateStatus(Donation $donation, array $data): Donation
    {
        $previousStatus = $donation->status;
        $donation->update($data);
        
        $this->syncProgramAmount($donation, $previousStatus, $donation->status);
        
        return $donation->refresh();
    }

    public function deleteDonation(Donation $donation): void
    {
        $previousStatus = $donation->status;
        $donation->delete();

        if ($previousStatus === 'paid' && $donation->program_id) {
            $donation->program()->decrement('collected_amount', $donation->amount);
        }
    }

    public function markWhatsappSent(Donation $donation): void
    {
        $donation->update(['whatsapp_sent_at' => now()]);
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

    private function generateMidtransOrderId(): string
    {
        return 'DPF-' . now()->format('YmdHis') . '-' . \Illuminate\Support\Str::random(5);
    }

    public function syncProgramAmount(Donation $donation, ?string $oldStatus, string $newStatus): void
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
}
