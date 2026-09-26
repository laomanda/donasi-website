<?php

namespace App\Services;

use App\Models\AccountingPeriod;
use App\Models\AuditLog;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class JournalService
{
    /**
     * Create a new journal entry with lines.
     *
     * @param array $data
     * @param User|null $user
     * @return JournalEntry
     * @throws ValidationException
     */
    public function createJournal(array $data, ?User $user = null): JournalEntry
    {
        $lines = $data['journal_lines'] ?? [];
        $this->validateJournal($lines);

        $userId = $user?->id ?? auth()->id() ?? User::first()?->id ?? 1;
        $transactionDate = Carbon::parse($data['transaction_date']);

        // Auto-assign open accounting period if not provided
        $periodId = $data['accounting_period_id'] ?? null;
        if (!$periodId) {
            $period = AccountingPeriod::where('status', 'open')
                ->where('start_date', '<=', $transactionDate->toDateString())
                ->where('end_date', '>=', $transactionDate->toDateString())
                ->first();

            $periodId = $period?->id ?? AccountingPeriod::where('status', 'open')->first()?->id;
        }

        if (!$periodId) {
            throw ValidationException::withMessages([
                'accounting_period_id' => ['Tidak ada periode akuntansi aktif (open) untuk tanggal transaksi ini.'],
            ]);
        }

        $journalNumber = $data['journal_number'] ?? $this->generateJournalNumber($transactionDate);

        return DB::transaction(function () use ($data, $lines, $userId, $periodId, $transactionDate, $journalNumber) {
            $journal = JournalEntry::create([
                'accounting_period_id' => $periodId,
                'journal_number'       => $journalNumber,
                'transaction_date'     => $transactionDate->toDateString(),
                'reference_type'       => $data['reference_type'] ?? 'manual',
                'reference_id'         => $data['reference_id'] ?? null,
                'program_id'           => $data['program_id'] ?? null,
                'description'          => $data['description'],
                'status'               => $data['status'] ?? 'draft',
                'created_by'           => $userId,
            ]);

            foreach ($lines as $line) {
                JournalEntryLine::create([
                    'journal_entry_id' => $journal->id,
                    'account_id'       => $line['account_id'],
                    'debit'            => (float) ($line['debit'] ?? 0),
                    'credit'           => (float) ($line['credit'] ?? 0),
                    'description'      => $line['description'] ?? null,
                ]);
            }

            // Audit log
            AuditLog::create([
                'user_id'      => $userId,
                'module'       => 'journal',
                'action'       => 'create_journal',
                'reference_id' => $journal->id,
                'old_data'     => null,
                'new_data'     => [
                    'journal_number'   => $journal->journal_number,
                    'transaction_date' => $journal->transaction_date->toDateString(),
                    'total_debit'      => $journal->total_debit,
                    'total_credit'     => $journal->total_credit,
                    'status'           => $journal->status,
                ],
            ]);

            return $journal->load(['lines.account', 'program', 'accountingPeriod', 'creator']);
        });
    }

    /**
     * Validate double-entry rules.
     *
     * @param array $lines
     * @throws ValidationException
     */
    public function validateJournal(array $lines): void
    {
        if (count($lines) < 2) {
            throw ValidationException::withMessages([
                'journal_lines' => ['Jurnal minimal harus memiliki 2 baris (Debit & Kredit).'],
            ]);
        }

        $totalDebit = 0.0;
        $totalCredit = 0.0;

        foreach ($lines as $index => $line) {
            if (empty($line['account_id'])) {
                throw ValidationException::withMessages([
                    "journal_lines.{$index}.account_id" => ["Baris ke-" . ($index + 1) . " wajib memilih akun (account_id)."],
                ]);
            }

            $debit = (float) ($line['debit'] ?? 0);
            $credit = (float) ($line['credit'] ?? 0);

            if ($debit < 0) {
                throw ValidationException::withMessages([
                    "journal_lines.{$index}.debit" => ["Nilai debit pada baris ke-" . ($index + 1) . " tidak boleh negatif."],
                ]);
            }

            if ($credit < 0) {
                throw ValidationException::withMessages([
                    "journal_lines.{$index}.credit" => ["Nilai kredit pada baris ke-" . ($index + 1) . " tidak boleh negatif."],
                ]);
            }

            if ($debit > 0 && $credit > 0) {
                throw ValidationException::withMessages([
                    "journal_lines.{$index}" => ["Baris ke-" . ($index + 1) . " hanya boleh memiliki nilai Debit ATAU Kredit, tidak boleh keduanya."],
                ]);
            }

            if ($debit == 0 && $credit == 0) {
                throw ValidationException::withMessages([
                    "journal_lines.{$index}" => ["Baris ke-" . ($index + 1) . " harus memiliki nilai Debit atau Kredit yang lebih besar dari 0."],
                ]);
            }

            $totalDebit += $debit;
            $totalCredit += $credit;
        }

        // Check balance (tolerance for float precision: 0.001)
        if (abs($totalDebit - $totalCredit) > 0.001) {
            $formattedDebit = number_format($totalDebit, 2, ',', '.');
            $formattedCredit = number_format($totalCredit, 2, ',', '.');
            throw ValidationException::withMessages([
                'journal_lines' => [
                    "Total Debit (Rp {$formattedDebit}) tidak seimbang dengan Total Kredit (Rp {$formattedCredit}). Selisih: Rp " . number_format(abs($totalDebit - $totalCredit), 2, ',', '.')
                ],
            ]);
        }
    }

    /**
     * Post a draft journal to posted status.
     *
     * @param JournalEntry|int $journal
     * @param User|null $user
     * @return JournalEntry
     * @throws ValidationException
     */
    public function postJournal(JournalEntry|int $journal, ?User $user = null): JournalEntry
    {
        $entry = $journal instanceof JournalEntry ? $journal : JournalEntry::with('lines')->findOrFail($journal);

        if ($entry->status === 'posted') {
            throw ValidationException::withMessages([
                'status' => ['Jurnal ini sudah berstatus posted sebelumnya.'],
            ]);
        }

        if ($entry->status === 'void') {
            throw ValidationException::withMessages([
                'status' => ['Jurnal yang sudah dibatalkan (void) tidak dapat di-posting.'],
            ]);
        }

        // Verify period is open
        if ($entry->accountingPeriod && $entry->accountingPeriod->status === 'closed') {
            throw ValidationException::withMessages([
                'accounting_period' => ['Periode akuntansi untuk jurnal ini sudah ditutup (closed). Transaksi tidak dapat di-posting.'],
            ]);
        }

        // Re-validate lines before posting
        $linesArray = $entry->lines->map(fn ($l) => [
            'account_id' => $l->account_id,
            'debit'      => (float) $l->debit,
            'credit'     => (float) $l->credit,
        ])->toArray();

        $this->validateJournal($linesArray);

        $userId = $user?->id ?? auth()->id() ?? User::first()?->id ?? 1;
        $oldData = $entry->toArray();

        $entry->update([
            'status' => 'posted',
        ]);

        AuditLog::create([
            'user_id'      => $userId,
            'module'       => 'journal',
            'action'       => 'post_journal',
            'reference_id' => $entry->id,
            'old_data'     => ['status' => 'draft'],
            'new_data'     => ['status' => 'posted', 'posted_at' => now()->toDateTimeString()],
        ]);

        return $entry->fresh(['lines.account', 'program', 'accountingPeriod', 'creator']);
    }

    /**
     * Void a journal entry.
     *
     * @param JournalEntry|int $journal
     * @param string $reason
     * @param User|null $user
     * @return JournalEntry
     * @throws ValidationException
     */
    public function voidJournal(JournalEntry|int $journal, string $reason = '', ?User $user = null): JournalEntry
    {
        $entry = $journal instanceof JournalEntry ? $journal : JournalEntry::findOrFail($journal);

        if ($entry->status === 'void') {
            throw ValidationException::withMessages([
                'status' => ['Jurnal ini sudah berstatus void sebelumnya.'],
            ]);
        }

        if ($entry->accountingPeriod && $entry->accountingPeriod->status === 'closed') {
            throw ValidationException::withMessages([
                'accounting_period' => ['Periode akuntansi untuk jurnal ini sudah ditutup. Tidak dapat diubah statusnya.'],
            ]);
        }

        $userId = $user?->id ?? auth()->id() ?? User::first()?->id ?? 1;
        $oldStatus = $entry->status;

        $entry->update([
            'status'      => 'void',
            'description' => $reason ? $entry->description . " [VOID: {$reason}]" : $entry->description . " [VOID]",
        ]);

        AuditLog::create([
            'user_id'      => $userId,
            'module'       => 'journal',
            'action'       => 'void_journal',
            'reference_id' => $entry->id,
            'old_data'     => ['status' => $oldStatus],
            'new_data'     => ['status' => 'void', 'reason' => $reason],
        ]);

        return $entry->fresh(['lines.account', 'program', 'accountingPeriod', 'creator']);
    }

    /**
     * Create a reversing / adjustment journal for an existing posted journal.
     *
     * @param JournalEntry|int $journal
     * @param string $description
     * @param User|null $user
     * @return JournalEntry
     * @throws ValidationException
     */
    public function reverseJournal(JournalEntry|int $journal, string $description = '', ?User $user = null): JournalEntry
    {
        $original = $journal instanceof JournalEntry ? $journal : JournalEntry::with('lines')->findOrFail($journal);

        if ($original->status !== 'posted') {
            throw ValidationException::withMessages([
                'status' => ['Hanya jurnal berstatus posted yang dapat dibuatkan jurnal pembalik (reversal).'],
            ]);
        }

        $userId = $user?->id ?? auth()->id() ?? User::first()?->id ?? 1;
        $reversalLines = [];

        // Swap debit and credit
        foreach ($original->lines as $line) {
            $reversalLines[] = [
                'account_id'  => $line->account_id,
                'debit'       => (float) $line->credit,
                'credit'      => (float) $line->debit,
                'description' => 'Pembalik: ' . ($line->description ?: $original->journal_number),
            ];
        }

        $reversalData = [
            'transaction_date'     => now()->toDateString(),
            'accounting_period_id' => $original->accounting_period_id,
            'journal_number'       => 'REV-' . $original->journal_number,
            'reference_type'       => 'reversal',
            'reference_id'         => $original->id,
            'program_id'           => $original->program_id,
            'description'          => $description ?: "Jurnal Pembalik untuk {$original->journal_number}",
            'status'               => 'draft',
            'journal_lines'        => $reversalLines,
        ];

        return $this->createJournal($reversalData, $user);
    }

    /**
     * Generate unique journal voucher number.
     *
     * @param Carbon $date
     * @return string
     */
    protected function generateJournalNumber(Carbon $date): string
    {
        $prefix = 'JU-' . $date->format('Ym') . '-';
        $latest = JournalEntry::where('journal_number', 'like', $prefix . '%')
            ->orderByDesc('id')
            ->value('journal_number');

        if ($latest && preg_match('/' . preg_quote($prefix, '/') . '(\d+)/', $latest, $matches)) {
            $next = (int) $matches[1] + 1;
        } else {
            $next = 1;
        }

        return $prefix . str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }
}
