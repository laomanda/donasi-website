<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Allocation;
use App\Models\AuditLog;
use App\Models\JournalEntry;
use Illuminate\Support\Facades\Log;

class AllocationJournalService
{
    public function __construct(
        protected JournalService $journalService
    ) {}

    /**
     * Check if allocation is in a valid condition to be recorded in journal.
     *
     * @param Allocation $allocation
     * @return bool
     */
    public function isAllocationValid(Allocation $allocation): bool
    {
        // 1. Amount must be positive
        if ((float) $allocation->amount <= 0) {
            return false;
        }

        // 2. If status attribute or column exists, ensure it is not draft/pending/rejected
        if (isset($allocation->status) && in_array(strtolower((string) $allocation->status), ['draft', 'pending', 'rejected', 'cancelled', 'invalid'], true)) {
            return false;
        }

        return true;
    }

    /**
     * Generate journal entry for an allocation (penyaluran dana).
     * Protected against duplicates.
     *
     * @param Allocation $allocation
     * @return JournalEntry|null
     */
    public function recordAllocationJournal(Allocation $allocation): ?JournalEntry
    {
        // 1. Duplicate Protection
        $existing = JournalEntry::where('reference_type', 'allocation')
            ->where('reference_id', $allocation->id)
            ->first();

        if ($existing) {
            return $existing;
        }

        // 2. Validity check
        if (!$this->isAllocationValid($allocation)) {
            return null;
        }

        // 3. Resolve accounts
        $debitAccount = $this->resolveDebitAccount($allocation);
        $creditAccount = $this->resolveCreditAccount($allocation);

        $program = $allocation->program;
        $programTitle = $program ? $program->title : 'Umum / Kemanusiaan';
        $transactionDate = $allocation->allocated_at
            ? $allocation->allocated_at->toDateString()
            : ($allocation->created_at ? $allocation->created_at->toDateString() : now()->toDateString());

        $description = $allocation->description
            ? "Penyaluran: {$allocation->description} ({$programTitle})"
            : "Penyaluran Dana Program {$programTitle}";

        $journalData = [
            'transaction_date' => $transactionDate,
            'reference_type'   => 'allocation',
            'reference_id'     => $allocation->id,
            'program_id'       => $allocation->program_id,
            'description'      => $description,
            'status'           => 'posted',
            'journal_lines'    => [
                [
                    'account_id'  => $debitAccount->id,
                    'debit'       => (float) $allocation->amount,
                    'credit'      => 0.00,
                    'description' => "Penyaluran Dana - {$debitAccount->name} ({$programTitle})",
                ],
                [
                    'account_id'  => $creditAccount->id,
                    'debit'       => 0.00,
                    'credit'      => (float) $allocation->amount,
                    'description' => "Pengeluaran Kas/Bank via {$creditAccount->name}",
                ],
            ],
        ];

        try {
            $journal = $this->journalService->createJournal($journalData, $allocation->user);

            // Audit Log
            AuditLog::create([
                'user_id'      => $allocation->user_id ?? auth()->id(),
                'module'       => 'allocation',
                'action'       => 'create_journal',
                'reference_id' => $allocation->id,
                'old_data'     => null,
                'new_data'     => [
                    'journal_entry_id' => $journal->id,
                    'journal_number'   => $journal->journal_number,
                    'amount'           => (float) $allocation->amount,
                    'program_id'       => $allocation->program_id,
                    'debit_account'    => $debitAccount->code . ' - ' . $debitAccount->name,
                    'credit_account'   => $creditAccount->code . ' - ' . $creditAccount->name,
                ],
            ]);

            return $journal;
        } catch (\Throwable $e) {
            Log::error("Failed to auto-generate journal for allocation {$allocation->id}: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Resolve debit account (Beban Penyaluran) based on program category.
     *
     * Mapping:
     * - Pendidikan: 5110 Penyaluran Program Pendidikan & Beasiswa
     * - Sosial / Kemanusiaan: 5120 Penyaluran Program Sosial & Kemanusiaan
     * - Dakwah / Keagamaan: 5130 Penyaluran Program Dakwah & Keagamaan
     * - Kesehatan: 5140 Penyaluran Program Layanan Kesehatan
     * - Ekonomi / UMKM / Produktif: 5150 Penyaluran Program Pemberdayaan Ekonomi
     *
     * @param Allocation $allocation
     * @return Account
     */
    public function resolveDebitAccount(Allocation $allocation): Account
    {
        $program = $allocation->program;
        $category = strtolower((string) ($program?->category ?? ''));
        $title = strtolower((string) ($program?->title ?? ''));
        $desc = strtolower((string) ($allocation->description ?? ''));

        $searchString = "{$category} {$title} {$desc}";

        if (
            str_contains($searchString, 'didik') ||
            str_contains($searchString, 'beasiswa') ||
            str_contains($searchString, 'pendidikan') ||
            str_contains($searchString, 'education') ||
            str_contains($searchString, 'sekolah')
        ) {
            $account = Account::where('code', '5110')->first();
        } elseif (
            str_contains($searchString, 'dakwah') ||
            str_contains($searchString, 'agama') ||
            str_contains($searchString, 'keagamaan') ||
            str_contains($searchString, 'masjid') ||
            str_contains($searchString, 'musholla') ||
            str_contains($searchString, 'quran')
        ) {
            $account = Account::where('code', '5130')->first();
        } elseif (
            str_contains($searchString, 'sehat') ||
            str_contains($searchString, 'kesehatan') ||
            str_contains($searchString, 'medis') ||
            str_contains($searchString, 'klinik') ||
            str_contains($searchString, 'rumah sakit') ||
            str_contains($searchString, 'health')
        ) {
            $account = Account::where('code', '5140')->first();
        } elseif (
            str_contains($searchString, 'ekonomi') ||
            str_contains($searchString, 'umkm') ||
            str_contains($searchString, 'usaha') ||
            str_contains($searchString, 'pemberdayaan') ||
            str_contains($searchString, 'produktif') ||
            str_contains($searchString, 'modal')
        ) {
            $account = Account::where('code', '5150')->first();
        } elseif (
            str_contains($searchString, 'sosial') ||
            str_contains($searchString, 'kemanusiaan') ||
            str_contains($searchString, 'bencana') ||
            str_contains($searchString, 'santunan') ||
            str_contains($searchString, 'sembako') ||
            str_contains($searchString, 'yatim')
        ) {
            $account = Account::where('code', '5120')->first();
        } else {
            // Default fallback: 5120 Penyaluran Program Sosial & Kemanusiaan
            $account = Account::where('code', '5120')->first() ?? Account::where('code', '5100')->first();
        }

        return $account ?? Account::where('account_type', 'expense')->where('code', 'like', '51%')->firstOrFail();
    }

    /**
     * Resolve credit account (Kas / Bank sumber dana) for allocation.
     *
     * @param Allocation $allocation
     * @return Account
     */
    public function resolveCreditAccount(Allocation $allocation): Account
    {
        $donation = $allocation->donation;
        $channel = strtolower((string) ($donation?->payment_channel ?? ''));
        $desc = strtolower((string) ($allocation->description ?? ''));

        if (str_contains($channel, 'mandiri') || str_contains($desc, 'mandiri')) {
            $account = Account::where('code', '1113')->first(); // Bank Mandiri Rekening Donasi
        } elseif (str_contains($channel, 'bca') || str_contains($desc, 'bca')) {
            $account = Account::where('code', '1114')->first(); // Bank BCA
        } elseif (
            str_contains($channel, 'kas') ||
            str_contains($desc, 'kas tunai') ||
            str_contains($desc, 'kas kecil') ||
            str_contains($desc, 'tunai')
        ) {
            $account = Account::where('code', '1111')->first(); // Kas Kecil Operasional
        } elseif (str_contains($channel, 'bsi') || str_contains($desc, 'bsi')) {
            $account = Account::where('code', '1112')->first(); // Bank BSI Rekening Wakaf
        } else {
            // Default Bank BSI Rekening Wakaf (1112)
            $account = Account::where('code', '1112')->first();
        }

        return $account ?? Account::where('account_type', 'asset')->where('code', 'like', '111%')->firstOrFail();
    }
}
