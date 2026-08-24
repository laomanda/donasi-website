<?php

namespace App\Services;

use App\Models\Donation;
use App\Models\Program;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DonationService
{
    public function storeManualDonation(array $data): Donation
    {
        $data['payment_source'] = 'manual';
        $data['status'] = 'paid';
        $data['paid_at'] = now();
        $data['donation_code'] = $this->generateDonationCode();

        return DB::transaction(function () use ($data) {
            $created = Donation::query()->create($data);
            $this->syncProgramAmount($created, null, 'paid');

            return $created->load('program');
        });
    }

    public function createMidtransDonation(array $data): Donation
    {
        $orderId = $this->generateMidtransOrderId();
        $programId = $data['program_id'] ?? null;
        $userId = Auth::guard('sanctum')->id();

        return DB::transaction(function () use ($data, $orderId, $programId, $userId) {
            return Donation::query()->create([
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
                'user_id'               => $userId,
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
            return Donation::query()->create([
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
        $programId = $donation->program_id;
        $amount = (float) $donation->amount;

        Donation::destroy($donation->id);

        if ($previousStatus === 'paid' && $programId) {
            /** @var Program|null $program */
            $program = Program::query()->find($programId);
            if ($program) {
                $program->collected_amount = max(0, (float) $program->collected_amount - $amount);
                $program->save();
            }
        }
    }

    public function markWhatsappSent(Donation $donation): void
    {
        $donation->update(['whatsapp_sent_at' => now()]);
    }

    private function generateDonationCode(): string
    {
        $prefix = 'DPF-' . now()->format('Ymd');
        
        $lastCode = Donation::query()
            ->where('donation_code', 'like', "{$prefix}%")
            ->orderByDesc('donation_code')
            ->value('donation_code');

        $sequence = 0;
        if (! empty($lastCode)) {
            $parts = explode('-', (string) $lastCode);
            $sequence = (int) end($parts);
        }
        $sequence++;

        $sequencePadded = str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
        return "{$prefix}-{$sequencePadded}";
    }

    private function generateMidtransOrderId(): string
    {
        return 'DPF-' . now()->format('YmdHis') . '-' . Str::random(5);
    }

    public function syncProgramAmount(Donation $donation, ?string $oldStatus, string $newStatus): void
    {
        if (! $donation->program_id) {
            return;
        }

        /** @var Program|null $program */
        $program = Program::query()->find($donation->program_id);

        if (! $program) {
            return;
        }

        if ($oldStatus !== 'paid' && $newStatus === 'paid') {
            $program->collected_amount = (float) $program->collected_amount + (float) $donation->amount;
            $program->save();
        } elseif ($oldStatus === 'paid' && $newStatus !== 'paid') {
            $program->collected_amount = max(0, (float) $program->collected_amount - (float) $donation->amount);
            $program->save();
        }
    }
}
