<?php

namespace App\Services;

use App\Models\AccountingPeriod;
use App\Models\AuditLog;
use App\Models\JournalEntry;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AccountingPeriodService
{
    /**
     * Resolve accounting period based on transaction date.
     *
     * @throws ValidationException
     */
    public function resolvePeriodByDate(string|CarbonInterface $date): AccountingPeriod
    {
        $dateString = $date instanceof CarbonInterface ? $date->toDateString() : Carbon::parse($date)->toDateString();

        $period = AccountingPeriod::whereDate('start_date', '<=', $dateString)
            ->whereDate('end_date', '>=', $dateString)
            ->first();

        if (! $period) {
            throw ValidationException::withMessages([
                'accounting_period' => ['Accounting period not found for transaction date'],
            ]);
        }

        return $period;
    }

    /**
     * Ensure accounting period exists by ID.
     *
     * @throws ValidationException
     */
    public function ensurePeriodExists(?int $periodId): AccountingPeriod
    {
        if (! $periodId) {
            throw ValidationException::withMessages([
                'accounting_period_id' => ['Accounting period ID is required'],
            ]);
        }

        $period = AccountingPeriod::find($periodId);

        if (! $period) {
            throw ValidationException::withMessages([
                'accounting_period_id' => ['Accounting period not found'],
            ]);
        }

        return $period;
    }

    /**
     * Ensure accounting period is open.
     *
     * @throws ValidationException
     */
    public function ensurePeriodOpen(AccountingPeriod $period): void
    {
        if ($period->isClosed()) {
            throw ValidationException::withMessages([
                'accounting_period' => ['Accounting period is closed'],
            ]);
        }
    }

    /**
     * Validate that transaction date falls within the period range.
     *
     * @throws ValidationException
     */
    public function validateDateWithinPeriod(AccountingPeriod $period, string|CarbonInterface $date): void
    {
        $dateString = $date instanceof CarbonInterface ? $date->toDateString() : Carbon::parse($date)->toDateString();
        $startDate = $period->start_date ? $period->start_date->toDateString() : null;
        $endDate = $period->end_date ? $period->end_date->toDateString() : null;

        if ($startDate && $endDate && ($dateString < $startDate || $dateString > $endDate)) {
            throw ValidationException::withMessages([
                'transaction_date' => ["Transaction date {$dateString} is outside accounting period range ({$startDate} to {$endDate})"],
            ]);
        }
    }

    /**
     * Get period status string ('open' or 'closed').
     */
    public function getPeriodStatus(AccountingPeriod $period): string
    {
        return $period->isClosed() ? 'closed' : 'open';
    }

    /**
     * List all accounting periods with formatted structure.
     */
    public function listPeriods(): Collection
    {
        return AccountingPeriod::orderBy('start_date', 'desc')->get()->map(function (AccountingPeriod $period) {
            return [
                'id' => $period->id,
                'period_name' => $period->name,
                'period_type' => $period->period_type,
                'start_date' => $period->start_date ? $period->start_date->toDateString() : null,
                'end_date' => $period->end_date ? $period->end_date->toDateString() : null,
                'is_closed' => (bool) $period->isClosed(),
                'closed_at' => $period->closed_at ? $period->closed_at->toIso8601String() : null,
                'closed_by' => $period->closed_by,
                'status' => $this->getPeriodStatus($period),
            ];
        });
    }

    /**
     * Get detailed accounting period statistics.
     *
     * @throws ValidationException
     */
    public function getPeriodDetail(AccountingPeriod|int $period): array
    {
        $periodModel = $period instanceof AccountingPeriod ? $period : $this->ensurePeriodExists($period);

        $journalsQuery = JournalEntry::where('accounting_period_id', $periodModel->id);
        $journalCount = (clone $journalsQuery)->count();
        $postedCount = (clone $journalsQuery)->where('status', 'posted')->count();
        $draftCount = (clone $journalsQuery)->where('status', 'draft')->count();

        $totals = DB::table('journal_entry_lines')
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->where('journal_entries.accounting_period_id', $periodModel->id)
            ->where('journal_entries.status', 'posted')
            ->selectRaw('COALESCE(SUM(journal_entry_lines.debit), 0) as total_debit, COALESCE(SUM(journal_entry_lines.credit), 0) as total_credit')
            ->first();

        $totalDebit = (float) ($totals->total_debit ?? 0);
        $totalCredit = (float) ($totals->total_credit ?? 0);
        $isBalanced = abs($totalDebit - $totalCredit) < 0.001;

        return [
            'id' => $periodModel->id,
            'period_name' => $periodModel->name,
            'start_date' => $periodModel->start_date ? $periodModel->start_date->toDateString() : null,
            'end_date' => $periodModel->end_date ? $periodModel->end_date->toDateString() : null,
            'status' => $this->getPeriodStatus($periodModel),
            'is_closed' => (bool) $periodModel->isClosed(),
            'journal_count' => $journalCount,
            'posted_journal_count' => $postedCount,
            'draft_journal_count' => $draftCount,
            'total_debit' => $totalDebit,
            'total_credit' => $totalCredit,
            'is_balanced' => $isBalanced,
            'closed_at' => $periodModel->closed_at ? $periodModel->closed_at->toIso8601String() : null,
            'closed_by' => $periodModel->closed_by,
        ];
    }

    /**
     * Close an accounting period.
     *
     * @throws ValidationException
     */
    public function closePeriod(AccountingPeriod|int $period, ?User $user = null): AccountingPeriod
    {
        $periodId = $period instanceof AccountingPeriod ? $period->id : (int) $period;

        return DB::transaction(function () use ($periodId, $user) {
            /** @var AccountingPeriod|null $lockedPeriod */
            $lockedPeriod = AccountingPeriod::where('id', $periodId)->lockForUpdate()->first();

            if (! $lockedPeriod) {
                throw ValidationException::withMessages([
                    'period' => ['Accounting period not found'],
                ]);
            }

            // 1. Period already closed check
            if ($lockedPeriod->isClosed()) {
                throw ValidationException::withMessages([
                    'period' => ['Accounting period is already closed'],
                ]);
            }

            // 2. Draft journal check (cannot close period with unresolved draft journals)
            $draftCount = JournalEntry::where('accounting_period_id', $lockedPeriod->id)
                ->where('status', 'draft')
                ->count();

            if ($draftCount > 0) {
                throw ValidationException::withMessages([
                    'journals' => ['There are unresolved draft journals'],
                ]);
            }

            // 3. Unbalanced journal check (each individual posted journal must be balanced)
            $postedJournals = JournalEntry::with('lines')
                ->where('accounting_period_id', $lockedPeriod->id)
                ->where('status', 'posted')
                ->get();

            foreach ($postedJournals as $pj) {
                if (! $pj->is_balanced) {
                    throw ValidationException::withMessages([
                        'journals' => ["Journal {$pj->journal_number} is unbalanced"],
                    ]);
                }
            }

            // Total debit vs total credit across all posted journals in period
            $totals = DB::table('journal_entry_lines')
                ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
                ->where('journal_entries.accounting_period_id', $lockedPeriod->id)
                ->where('journal_entries.status', 'posted')
                ->selectRaw('COALESCE(SUM(journal_entry_lines.debit), 0) as total_debit, COALESCE(SUM(journal_entry_lines.credit), 0) as total_credit')
                ->first();

            $totalDebit = (float) ($totals->total_debit ?? 0);
            $totalCredit = (float) ($totals->total_credit ?? 0);

            if (abs($totalDebit - $totalCredit) > 0.001) {
                throw ValidationException::withMessages([
                    'journals' => ['Total debit and total credit for the period are not balanced'],
                ]);
            }

            // 4. Dates check: all journals must fall within period start_date and end_date
            $hasOutOfRange = JournalEntry::where('accounting_period_id', $lockedPeriod->id)
                ->where(function ($q) use ($lockedPeriod) {
                    $q->whereDate('transaction_date', '<', $lockedPeriod->start_date)
                        ->orWhereDate('transaction_date', '>', $lockedPeriod->end_date);
                })
                ->exists();

            if ($hasOutOfRange) {
                throw ValidationException::withMessages([
                    'journals' => ['Transactions exist outside period range'],
                ]);
            }

            // 5. Update period to closed
            $userId = $user?->id ?? auth()->id() ?? User::query()->first()?->id ?? 1;
            $previousStatus = $lockedPeriod->status;

            $lockedPeriod->update([
                'is_closed' => true,
                'status' => 'closed',
                'closed_at' => now(),
                'closed_by' => $userId,
            ]);

            // 6. Record AuditLog
            AuditLog::create([
                'user_id' => $userId,
                'module' => 'finance_period',
                'action' => 'close_period',
                'reference_id' => $lockedPeriod->id,
                'old_data' => [
                    'status' => $previousStatus,
                    'is_closed' => false,
                ],
                'new_data' => [
                    'period_id' => $lockedPeriod->id,
                    'period_name' => $lockedPeriod->name,
                    'start_date' => $lockedPeriod->start_date ? $lockedPeriod->start_date->toDateString() : null,
                    'end_date' => $lockedPeriod->end_date ? $lockedPeriod->end_date->toDateString() : null,
                    'closed_at' => $lockedPeriod->closed_at ? $lockedPeriod->closed_at->toDateTimeString() : null,
                    'closed_by' => $userId,
                    'previous_status' => $previousStatus,
                    'new_status' => 'closed',
                ],
            ]);

            return $lockedPeriod->fresh();
        });
    }

    /**
     * Reopen an accounting period (isolated method if authorized).
     *
     * @throws ValidationException
     */
    public function reopenPeriod(AccountingPeriod|int $period, ?User $user = null): AccountingPeriod
    {
        $periodId = $period instanceof AccountingPeriod ? $period->id : (int) $period;

        return DB::transaction(function () use ($periodId, $user) {
            /** @var AccountingPeriod|null $lockedPeriod */
            $lockedPeriod = AccountingPeriod::where('id', $periodId)->lockForUpdate()->first();

            if (! $lockedPeriod) {
                throw ValidationException::withMessages([
                    'period' => ['Accounting period not found'],
                ]);
            }

            if (! $lockedPeriod->isClosed()) {
                throw ValidationException::withMessages([
                    'period' => ['Accounting period is already open'],
                ]);
            }

            $userId = $user?->id ?? auth()->id() ?? User::query()->first()?->id ?? 1;
            $previousClosedAt = $lockedPeriod->closed_at;

            $lockedPeriod->update([
                'is_closed' => false,
                'status' => 'open',
                'closed_at' => null,
                'closed_by' => null,
            ]);

            AuditLog::create([
                'user_id' => $userId,
                'module' => 'finance_period',
                'action' => 'reopen_period',
                'reference_id' => $lockedPeriod->id,
                'old_data' => [
                    'status' => 'closed',
                    'is_closed' => true,
                    'closed_at' => $previousClosedAt ? ($previousClosedAt instanceof CarbonInterface ? $previousClosedAt->toDateTimeString() : (string) $previousClosedAt) : null,
                ],
                'new_data' => [
                    'period_id' => $lockedPeriod->id,
                    'period_name' => $lockedPeriod->name,
                    'start_date' => $lockedPeriod->start_date ? $lockedPeriod->start_date->toDateString() : null,
                    'end_date' => $lockedPeriod->end_date ? $lockedPeriod->end_date->toDateString() : null,
                    'previous_status' => 'closed',
                    'new_status' => 'open',
                ],
            ]);

            return $lockedPeriod->fresh();
        });
    }
}
