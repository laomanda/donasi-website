<?php

namespace App\Services;

use App\Models\Account;
use App\Models\AuditLog;
use App\Models\Donation;
use App\Models\JournalEntry;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class DonationJournalService
{
    public function __construct(
        protected JournalService $journalService,
        protected AccountingPeriodService $periodService
    ) {}

    /**
     * Generate journal entry for a paid donation.
     * Guaranteed duplicate protection.
     */
    public function recordDonationJournal(Donation $donation): ?JournalEntry
    {
        // 1. Duplicate Protection
        $existing = JournalEntry::where('reference_type', 'donation')
            ->where('reference_id', $donation->id)
            ->first();

        if ($existing) {
            return $existing;
        }

        // 2. Only record for paid donations with amount > 0
        if ($donation->status !== 'paid' || (float) $donation->amount <= 0) {
            return null;
        }

        // 3. Resolve accounts
        $debitAccount = $this->resolveDebitAccount($donation);
        $creditAccount = $this->resolveCreditAccount($donation);

        $programTitle = $donation->program ? $donation->program->title : 'Dana Umum';
        $donorName = $donation->is_anonymous ? 'Hamba Allah' : ($donation->donor_name ?: 'Donatur');
        $date = $donation->paid_at ? $donation->paid_at->toDateString() : now()->toDateString();

        // 3. Resolve & ensure accounting period is open
        $period = null;
        try {
            $period = $this->periodService->resolvePeriodByDate($date);
            $this->periodService->ensurePeriodOpen($period);
        } catch (\Throwable $e) {
            Log::error("Cannot create donation journal in closed accounting period: donation {$donation->id} date {$date} - ".$e->getMessage());

            AuditLog::create([
                'user_id' => $donation->user_id ?? auth()->id() ?? User::query()->first()?->id ?? 1,
                'module' => 'donation',
                'action' => 'journal_rejected_closed_period',
                'reference_id' => $donation->id,
                'old_data' => null,
                'new_data' => [
                    'donation_id' => $donation->id,
                    'donation_code' => $donation->donation_code,
                    'amount' => (float) $donation->amount,
                    'transaction_date' => $date,
                    'accounting_period_id' => $period?->id ?? null,
                    'reason' => 'Accounting period is closed',
                    'error_message' => $e->getMessage(),
                ],
            ]);

            return null;
        }

        $journalData = [
            'transaction_date' => $date,
            'accounting_period_id' => $period->id,
            'reference_type' => 'donation',
            'reference_id' => $donation->id,
            'program_id' => $donation->program_id,
            'description' => "Penerimaan Donasi #{$donation->donation_code} - {$donorName} ({$programTitle})",
            'status' => 'posted',
            'journal_lines' => [
                [
                    'account_id' => $debitAccount->id,
                    'debit' => (float) $donation->amount,
                    'credit' => 0.00,
                    'description' => 'Penerimaan Kas/Bank via '.($donation->payment_channel ?: $donation->payment_source ?: 'Bank'),
                ],
                [
                    'account_id' => $creditAccount->id,
                    'debit' => 0.00,
                    'credit' => (float) $donation->amount,
                    'description' => "Penerimaan Wakaf/Donasi Program {$programTitle}",
                ],
            ],
        ];

        try {
            return $this->journalService->createJournal($journalData, $donation->user);
        } catch (\Throwable $e) {
            Log::error("Failed to auto-generate journal for donation {$donation->id}: ".$e->getMessage());

            return null;
        }
    }

    /**
     * Resolve debit account (Kas / Bank) based on payment source & channel.
     */
    public function resolveDebitAccount(Donation $donation): Account
    {
        $channel = strtolower((string) ($donation->payment_channel ?? ''));
        $source = strtolower((string) ($donation->payment_source ?? ''));

        if (str_contains($channel, 'bsi')) {
            $account = Account::where('code', '1112')->first(); // Bank BSI
        } elseif (str_contains($channel, 'mandiri')) {
            $account = Account::where('code', '1113')->first(); // Bank Mandiri
        } elseif (str_contains($channel, 'bca')) {
            $account = Account::where('code', '1114')->first(); // Bank BCA
        } elseif ($source === 'midtrans' || str_contains($channel, 'midtrans') || str_contains($channel, 'qris') || str_contains($channel, 'gopay')) {
            $account = Account::where('code', '1115')->first(); // Kas di Payment Gateway (Midtrans)
        } else {
            $account = Account::where('code', '1112')->first(); // Default Bank BSI
        }

        return $account ?? Account::where('account_type', 'asset')->where('code', 'like', '111%')->firstOrFail();
    }

    /**
     * Resolve credit account (Penerimaan) based on program category.
     */
    public function resolveCreditAccount(Donation $donation): Account
    {
        $program = $donation->program;
        $category = strtolower((string) ($program?->category ?? ''));
        $title = strtolower((string) ($program?->title ?? ''));

        if (str_contains($category, 'infaq') || str_contains($category, 'sedekah') || str_contains($title, 'infaq') || str_contains($title, 'sedekah')) {
            $account = Account::where('code', '4310')->first(); // Penerimaan Infaq & Sedekah Terikat
        } elseif (str_contains($category, 'temporer') || str_contains($title, 'temporer') || str_contains($title, 'berjangka')) {
            $account = Account::where('code', '4120')->first(); // Penerimaan Wakaf Uang - Temporer
        } elseif ($program !== null) {
            $account = Account::where('code', '4130')->first(); // Penerimaan Wakaf Melalui Uang
        } else {
            $account = Account::where('code', '4110')->first(); // Penerimaan Wakaf Uang - Abadi
        }

        return $account ?? Account::where('account_type', 'revenue')->where('code', 'like', '41%')->firstOrFail();
    }
}
