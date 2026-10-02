<?php

namespace App\Services;

use App\Models\AccountingPeriod;
use App\Models\Allocation;
use App\Models\AuditLog;
use App\Models\Donation;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class FinanceReconciliationService
{
    public function __construct(
        protected GeneralLedgerService $glService,
        protected TrialBalanceService $tbService,
        protected FinancialStatementService $fsService,
        protected AccountingPeriodService $periodService,
        protected AllocationJournalService $allocationJournalService
    ) {}

    /**
     * Run all 14 reconciliation controls for the given scope.
     * READ-ONLY: Never alters accounting data.
     */
    public function reconcile(
        ?int $accountingPeriodId = null,
        ?string $startDate = null,
        ?string $endDate = null,
        bool $recordAudit = true
    ): array {
        // 1. Resolve Accounting Period & Dates
        $period = null;
        if ($accountingPeriodId) {
            $period = AccountingPeriod::find($accountingPeriodId);
            if ($period) {
                $startDate = $startDate ?: ($period->start_date ? Carbon::parse($period->start_date)->toDateString() : null);
                $endDate = $endDate ?: ($period->end_date ? Carbon::parse($period->end_date)->toDateString() : null);
            }
        }

        $scope = [
            'accounting_period_id' => $accountingPeriodId,
            'start_date' => $startDate,
            'end_date' => $endDate,
        ];

        // 2. Execute 14 Controls
        $checks = [
            $this->checkJournalBalance($accountingPeriodId, $startDate, $endDate),
            $this->checkOrphanJournalLines(),
            $this->checkInvalidAccountReference($accountingPeriodId, $startDate, $endDate),
            $this->checkDuplicateJournalNumber(),
            $this->checkPeriodConsistency($accountingPeriodId, $startDate, $endDate),
            $this->checkClosedPeriodControl($accountingPeriodId, $startDate, $endDate),
            $this->checkDonationReconciliation($accountingPeriodId, $startDate, $endDate),
            $this->checkAllocationReconciliation($accountingPeriodId, $startDate, $endDate),
            $this->checkDuplicateTransactionJournal($accountingPeriodId, $startDate, $endDate),
            $this->checkGeneralLedgerReconciliation($accountingPeriodId, $startDate, $endDate),
            $this->checkTrialBalanceReconciliation($accountingPeriodId, $startDate, $endDate),
            $this->checkFinancialStatementReconciliation($accountingPeriodId, $startDate, $endDate),
            $this->checkPostedJournalImmutability($accountingPeriodId, $startDate, $endDate),
            $this->checkAccountingEquation($accountingPeriodId, $startDate, $endDate),
        ];

        // 3. Compute Metrics & Overall Status
        $passedChecks = 0;
        $failedChecks = 0;
        $criticalErrors = 0;
        $highErrors = 0;
        $warnings = 0;

        foreach ($checks as $check) {
            if ($check['status'] === 'passed') {
                $passedChecks++;
            } else {
                $failedChecks++;
                if ($check['severity'] === 'critical') {
                    $criticalErrors++;
                } elseif ($check['severity'] === 'high') {
                    $highErrors++;
                } elseif ($check['severity'] === 'warning') {
                    $warnings++;
                }
            }
        }

        if ($criticalErrors > 0) {
            $overallStatus = 'critical';
        } elseif ($highErrors > 0) {
            $overallStatus = 'needs_review';
        } elseif ($warnings > 0) {
            $overallStatus = 'reconciled_with_warnings';
        } else {
            $overallStatus = 'reconciled';
        }

        // 4. Audit Log
        if ($recordAudit) {
            AuditLog::create([
                'user_id' => auth()->id(),
                'module' => 'finance_reconciliation',
                'action' => 'reconcile_finance',
                'reference_id' => $accountingPeriodId,
                'old_data' => null,
                'new_data' => [
                    'overall_status' => $overallStatus,
                    'total_checks' => count($checks),
                    'passed_checks' => $passedChecks,
                    'failed_checks' => $failedChecks,
                    'critical_errors' => $criticalErrors,
                    'high_errors' => $highErrors,
                    'warnings' => $warnings,
                    'scope' => $scope,
                ],
            ]);
        }

        return [
            'status' => 'success',
            'data' => [
                'period' => $period ? [
                    'id' => $period->id,
                    'name' => $period->name,
                    'start_date' => $period->start_date ? Carbon::parse($period->start_date)->toDateString() : null,
                    'end_date' => $period->end_date ? Carbon::parse($period->end_date)->toDateString() : null,
                    'status' => $period->status,
                    'is_closed' => (bool) $period->is_closed,
                ] : null,
                'scope' => $scope,
                'overall_status' => $overallStatus,
                'total_checks' => count($checks),
                'passed_checks' => $passedChecks,
                'failed_checks' => $failedChecks,
                'critical_errors' => $criticalErrors,
                'high_errors' => $highErrors,
                'warnings' => $warnings,
                'checks' => $checks,
            ],
        ];
    }

    /**
     * Get a lightweight summary of reconciliation controls.
     */
    public function summary(?int $accountingPeriodId = null, ?string $startDate = null, ?string $endDate = null): array
    {
        $reconciliation = $this->reconcile($accountingPeriodId, $startDate, $endDate, false);
        $data = $reconciliation['data'];

        return [
            'status' => 'success',
            'data' => [
                'overall_status' => $data['overall_status'],
                'critical_errors' => $data['critical_errors'],
                'high_errors' => $data['high_errors'],
                'warnings' => $data['warnings'],
                'failed_checks' => $data['failed_checks'],
                'total_checks' => $data['total_checks'],
                'last_checked_at' => Carbon::now()->toIso8601String(),
            ],
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | CONTROL 1: JOURNAL BALANCE CHECK
    |--------------------------------------------------------------------------
    */
    protected function checkJournalBalance(?int $accountingPeriodId, ?string $startDate, ?string $endDate): array
    {
        $journalsQuery = JournalEntry::where('status', 'posted');
        if ($accountingPeriodId) {
            $journalsQuery->where('accounting_period_id', $accountingPeriodId);
        }
        if ($startDate) {
            $journalsQuery->where('transaction_date', '>=', $startDate);
        }
        if ($endDate) {
            $journalsQuery->where('transaction_date', '<=', $endDate);
        }

        $totalChecked = (clone $journalsQuery)->count();

        // 1. Unbalanced journals (sum debit != sum credit)
        $unbalanced = JournalEntryLine::join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->where('journal_entries.status', 'posted');

        if ($accountingPeriodId) {
            $unbalanced->where('journal_entries.accounting_period_id', $accountingPeriodId);
        }
        if ($startDate) {
            $unbalanced->where('journal_entries.transaction_date', '>=', $startDate);
        }
        if ($endDate) {
            $unbalanced->where('journal_entries.transaction_date', '<=', $endDate);
        }

        $unbalancedResults = $unbalanced->groupBy('journal_entries.id', 'journal_entries.journal_number')
            ->selectRaw('
                journal_entries.id as journal_id,
                journal_entries.journal_number,
                ROUND(SUM(journal_entry_lines.debit), 2) as total_debit,
                ROUND(SUM(journal_entry_lines.credit), 2) as total_credit,
                ROUND(ABS(SUM(journal_entry_lines.debit) - SUM(journal_entry_lines.credit)), 2) as difference
            ')
            ->havingRaw('ROUND(ABS(SUM(journal_entry_lines.debit) - SUM(journal_entry_lines.credit)), 2) > 0.001')
            ->get();

        // 2. Empty posted journals (no lines at all)
        $emptyJournals = (clone $journalsQuery)->whereDoesntHave('lines')->get(['id', 'journal_number']);

        $errors = [];
        foreach ($unbalancedResults as $ub) {
            $errors[] = [
                'journal_id' => $ub->journal_id,
                'journal_number' => $ub->journal_number,
                'total_debit' => (float) $ub->total_debit,
                'total_credit' => (float) $ub->total_credit,
                'difference' => (float) $ub->difference,
            ];
        }
        foreach ($emptyJournals as $ej) {
            $errors[] = [
                'journal_id' => $ej->id,
                'journal_number' => $ej->journal_number,
                'total_debit' => 0.0,
                'total_credit' => 0.0,
                'difference' => 0.0,
                'reason' => 'Journal has no lines',
            ];
        }

        $totalFailed = count($errors);

        return [
            'check_code' => 'JOURNAL_BALANCE',
            'name' => 'Journal Balance',
            'status' => $totalFailed === 0 ? 'passed' : 'failed',
            'severity' => $totalFailed === 0 ? null : 'critical',
            'message' => $totalFailed === 0 ? 'All posted journals are balanced' : 'Journal is not balanced',
            'total_checked' => $totalChecked,
            'total_failed' => $totalFailed,
            'errors' => $errors,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | CONTROL 2: ORPHAN JOURNAL LINES
    |--------------------------------------------------------------------------
    */
    protected function checkOrphanJournalLines(): array
    {
        $totalChecked = JournalEntryLine::count();

        $orphanLines = JournalEntryLine::whereNotExists(function ($query) {
            $query->select(DB::raw(1))
                ->from('journal_entries')
                ->whereColumn('journal_entries.id', 'journal_entry_lines.journal_entry_id');
        })->get(['id', 'journal_entry_id', 'account_id', 'debit', 'credit']);

        $totalFailed = $orphanLines->count();
        $errors = $orphanLines->map(fn($line) => [
            'line_id' => $line->id,
            'journal_entry_id' => $line->journal_entry_id,
            'account_id' => $line->account_id,
            'debit' => (float) $line->debit,
            'credit' => (float) $line->credit,
        ])->values()->all();

        return [
            'check_code' => 'ORPHAN_JOURNAL_LINES',
            'name' => 'Orphan Journal Lines',
            'status' => $totalFailed === 0 ? 'passed' : 'failed',
            'severity' => $totalFailed === 0 ? null : 'critical',
            'message' => $totalFailed === 0 ? 'No orphan journal lines found' : 'Orphan journal lines detected without valid journal entry',
            'total_checked' => $totalChecked,
            'total_failed' => $totalFailed,
            'errors' => $errors,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | CONTROL 3: INVALID ACCOUNT REFERENCE
    |--------------------------------------------------------------------------
    */
    protected function checkInvalidAccountReference(?int $accountingPeriodId, ?string $startDate, ?string $endDate): array
    {
        $linesQuery = JournalEntryLine::join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->where('journal_entries.status', 'posted');

        if ($accountingPeriodId) {
            $linesQuery->where('journal_entries.accounting_period_id', $accountingPeriodId);
        }
        if ($startDate) {
            $linesQuery->where('journal_entries.transaction_date', '>=', $startDate);
        }
        if ($endDate) {
            $linesQuery->where('journal_entries.transaction_date', '<=', $endDate);
        }

        $totalChecked = (clone $linesQuery)->count();

        $invalidLines = (clone $linesQuery)
            ->whereNotExists(function ($q) {
                $q->select(DB::raw(1))
                    ->from('accounts')
                    ->whereColumn('accounts.id', 'journal_entry_lines.account_id');
            })
            ->select('journal_entry_lines.id as line_id', 'journal_entry_lines.journal_entry_id', 'journal_entry_lines.account_id')
            ->get();

        $totalFailed = $invalidLines->count();
        $errors = $invalidLines->map(fn($line) => [
            'line_id' => $line->line_id,
            'journal_entry_id' => $line->journal_entry_id,
            'account_id' => $line->account_id,
        ])->values()->all();

        return [
            'check_code' => 'INVALID_ACCOUNT_REFERENCE',
            'name' => 'Invalid Account Reference',
            'status' => $totalFailed === 0 ? 'passed' : 'failed',
            'severity' => $totalFailed === 0 ? null : 'critical',
            'message' => $totalFailed === 0 ? 'All journal lines reference valid accounts' : 'Journal line references an invalid account',
            'total_checked' => $totalChecked,
            'total_failed' => $totalFailed,
            'errors' => $errors,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | CONTROL 4: DUPLICATE JOURNAL NUMBER
    |--------------------------------------------------------------------------
    */
    protected function checkDuplicateJournalNumber(): array
    {
        $totalChecked = JournalEntry::count();

        $duplicates = JournalEntry::select('journal_number', DB::raw('count(*) as count'), DB::raw('GROUP_CONCAT(id) as journal_ids'))
            ->groupBy('journal_number')
            ->havingRaw('count(*) > 1')
            ->get();

        $totalFailed = $duplicates->count();
        $errors = $duplicates->map(fn($row) => [
            'journal_number' => $row->journal_number,
            'journal_ids' => array_map('intval', explode(',', (string) $row->journal_ids)),
            'count' => (int) $row->count,
        ])->values()->all();

        return [
            'check_code' => 'DUPLICATE_JOURNAL_NUMBER',
            'name' => 'Duplicate Journal Number',
            'status' => $totalFailed === 0 ? 'passed' : 'failed',
            'severity' => $totalFailed === 0 ? null : 'critical',
            'message' => $totalFailed === 0 ? 'All journal numbers are unique' : 'Duplicate journal number detected',
            'total_checked' => $totalChecked,
            'total_failed' => $totalFailed,
            'errors' => $errors,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | CONTROL 5: PERIOD CONSISTENCY
    |--------------------------------------------------------------------------
    */
    protected function checkPeriodConsistency(?int $accountingPeriodId, ?string $startDate, ?string $endDate): array
    {
        $journalsQuery = JournalEntry::where('journal_entries.status', 'posted');
        if ($accountingPeriodId) {
            $journalsQuery->where('journal_entries.accounting_period_id', $accountingPeriodId);
        } else {
            if ($startDate) {
                $journalsQuery->where('journal_entries.transaction_date', '>=', $startDate);
            }
            if ($endDate) {
                $journalsQuery->where('journal_entries.transaction_date', '<=', $endDate);
            }
        }

        $totalChecked = (clone $journalsQuery)->count();

        $inconsistentJournals = (clone $journalsQuery)
            ->leftJoin('accounting_periods', 'journal_entries.accounting_period_id', '=', 'accounting_periods.id')
            ->where(function ($q) {
                $q->whereNull('journal_entries.accounting_period_id')
                    ->orWhereNull('accounting_periods.id')
                    ->orWhereColumn('journal_entries.transaction_date', '<', 'accounting_periods.start_date')
                    ->orWhereColumn('journal_entries.transaction_date', '>', 'accounting_periods.end_date');
            })
            ->select([
                'journal_entries.id as journal_id',
                'journal_entries.journal_number',
                'journal_entries.transaction_date',
                'journal_entries.accounting_period_id as period_id',
                'accounting_periods.start_date as period_start',
                'accounting_periods.end_date as period_end',
            ])
            ->get();

        $totalFailed = $inconsistentJournals->count();
        $errors = $inconsistentJournals->map(fn($j) => [
            'journal_id' => $j->journal_id,
            'journal_number' => $j->journal_number,
            'transaction_date' => $j->transaction_date ? Carbon::parse($j->transaction_date)->toDateString() : null,
            'period_id' => $j->period_id,
            'period_start' => $j->period_start ? Carbon::parse($j->period_start)->toDateString() : null,
            'period_end' => $j->period_end ? Carbon::parse($j->period_end)->toDateString() : null,
            'reason' => empty($j->period_id)
                ? 'Journal has no accounting period assigned'
                : 'Journal transaction date is outside accounting period',
        ])->values()->all();

        return [
            'check_code' => 'PERIOD_CONSISTENCY',
            'name' => 'Period Consistency',
            'status' => $totalFailed === 0 ? 'passed' : 'failed',
            'severity' => $totalFailed === 0 ? null : 'critical',
            'message' => $totalFailed === 0 ? 'All journal transaction dates match their accounting period' : 'Journal transaction date is outside accounting period',
            'total_checked' => $totalChecked,
            'total_failed' => $totalFailed,
            'errors' => $errors,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | CONTROL 6: CLOSED PERIOD CONTROL
    |--------------------------------------------------------------------------
    */
    protected function checkClosedPeriodControl(?int $accountingPeriodId, ?string $startDate, ?string $endDate): array
    {
        $closedJournalsQuery = JournalEntry::join('accounting_periods', 'journal_entries.accounting_period_id', '=', 'accounting_periods.id')
            ->where('journal_entries.status', 'posted')
            ->where(function ($q) {
                $q->where('accounting_periods.status', 'closed')
                    ->orWhere('accounting_periods.is_closed', true);
            });

        if ($accountingPeriodId) {
            $closedJournalsQuery->where('journal_entries.accounting_period_id', $accountingPeriodId);
        } else {
            if ($startDate) {
                $closedJournalsQuery->where('journal_entries.transaction_date', '>=', $startDate);
            }
            if ($endDate) {
                $closedJournalsQuery->where('journal_entries.transaction_date', '<=', $endDate);
            }
        }

        $totalChecked = (clone $closedJournalsQuery)->count();

        // Detect any journal created while the period was closed:
        // 1. Created after current closed_at, OR
        // 2. Created after an earlier close_period audit log
        $candidateJournals = (clone $closedJournalsQuery)
            ->whereNotNull('accounting_periods.closed_at')
            ->where(function ($q) {
                $q->whereColumn('journal_entries.created_at', '>', 'accounting_periods.closed_at')
                    ->orWhereExists(function ($sub) {
                        $sub->select(DB::raw(1))
                            ->from('audit_logs')
                            ->where('module', 'finance_period')
                            ->whereColumn('reference_id', 'accounting_periods.id')
                            ->where('action', 'close_period')
                            ->whereColumn('created_at', '<', 'journal_entries.created_at');
                    });
            })
            ->select([
                'journal_entries.id as journal_id',
                'journal_entries.journal_number',
                'journal_entries.transaction_date',
                'journal_entries.created_at as journal_created_at',
                'accounting_periods.id as period_id',
                'accounting_periods.status as period_status',
                'accounting_periods.closed_at as period_closed_at',
            ])
            ->get();

        $illegalJournals = $candidateJournals->filter(function ($j) {
            // If journal was created within an authorized canonical reopen window, it is legitimate
            if ($this->isWithinAuthorizedReopenWindow((int) $j->period_id, $j->journal_created_at)) {
                return false;
            }

            $jCreated = Carbon::parse($j->journal_created_at);
            $pClosed = Carbon::parse($j->period_closed_at);

            // Flag if created strictly after current closed_at
            if ($jCreated->greaterThan($pClosed)) {
                return true;
            }

            // Flag if created after a historical close_period without an authorized reopen window covering it
            return DB::table('audit_logs')
                ->where('module', 'finance_period')
                ->where('reference_id', $j->period_id)
                ->where('action', 'close_period')
                ->where('created_at', '<', $jCreated)
                ->exists();
        })->values();

        $totalFailed = $illegalJournals->count();
        $errors = $illegalJournals->map(fn($j) => [
            'journal_id' => $j->journal_id,
            'journal_number' => $j->journal_number,
            'transaction_date' => $j->transaction_date ? Carbon::parse($j->transaction_date)->toDateString() : null,
            'period_id' => $j->period_id,
            'period_status' => $j->period_status,
            'created_at' => (string) $j->journal_created_at,
            'closed_at' => (string) $j->period_closed_at,
            'severity' => 'critical',
            'reason' => 'Journal entry was created after accounting period was closed',
        ])->values()->all();

        return [
            'check_code' => 'CLOSED_PERIOD_CONTROL',
            'name' => 'Closed Period Control',
            'status' => $totalFailed === 0 ? 'passed' : 'failed',
            'severity' => $totalFailed === 0 ? null : 'critical',
            'message' => $totalFailed === 0 ? 'Closed period control verified and compliant' : 'Journal entry detected created after accounting period closed',
            'total_checked' => $totalChecked,
            'total_failed' => $totalFailed,
            'errors' => $errors,
        ];
    }

    /**
     * Determine whether a journal created_at timestamp falls within an authorized reopen window.
     */
    protected function isWithinAuthorizedReopenWindow(int $periodId, mixed $journalCreatedAt): bool
    {
        $jTime = Carbon::parse($journalCreatedAt);

        $reopenLogs = DB::table('audit_logs')
            ->where('module', 'finance_period')
            ->where('reference_id', $periodId)
            ->where('action', 'reopen_period')
            ->orderBy('created_at', 'asc')
            ->get();

        if ($reopenLogs->isEmpty()) {
            return false;
        }

        foreach ($reopenLogs as $reopenLog) {
            $reopenTime = Carbon::parse($reopenLog->created_at);

            // Find matching close_period after this reopen
            $closeLog = DB::table('audit_logs')
                ->where('module', 'finance_period')
                ->where('reference_id', $periodId)
                ->where('action', 'close_period')
                ->where('created_at', '>=', $reopenTime)
                ->orderBy('created_at', 'asc')
                ->first();

            // Window end is either the close_period timestamp, or current time
            $windowEnd = $closeLog ? Carbon::parse($closeLog->created_at) : Carbon::now();

            // Strict condition: reopened_at <= journal.created_at <= reclosed_at
            if (
                $jTime->greaterThanOrEqualTo($reopenTime) &&
                $jTime->lessThanOrEqualTo($windowEnd)
            ) {
                return true;
            }
        }

        return false;
    }

    /*
    |--------------------------------------------------------------------------
    | CONTROL 7: DONATION RECONCILIATION
    |--------------------------------------------------------------------------
    */
    protected function checkDonationReconciliation(?int $accountingPeriodId, ?string $startDate, ?string $endDate): array
    {
        $donationsQuery = Donation::where('status', 'paid');

        if ($startDate) {
            $donationsQuery->where(function ($q) use ($startDate) {
                $q->whereDate('paid_at', '>=', $startDate)
                    ->orWhere(function ($q2) use ($startDate) {
                        $q2->whereNull('paid_at')->whereDate('created_at', '>=', $startDate);
                    });
            });
        }
        if ($endDate) {
            $donationsQuery->where(function ($q) use ($endDate) {
                $q->whereDate('paid_at', '<=', $endDate)
                    ->orWhere(function ($q2) use ($endDate) {
                        $q2->whereNull('paid_at')->whereDate('created_at', '<=', $endDate);
                    });
            });
        }

        $totalChecked = (clone $donationsQuery)->count();

        $unjournaled = (clone $donationsQuery)
            ->whereNotExists(function ($q) {
                $q->select(DB::raw(1))
                    ->from('journal_entries')
                    ->where('reference_type', 'donation')
                    ->whereColumn('reference_id', 'donations.id')
                    ->where('status', 'posted');
            })
            ->get(['id', 'amount', 'paid_at', 'created_at', 'donor_name']);

        $totalFailed = $unjournaled->count();
        $errors = $unjournaled->map(fn($d) => [
            'reference_type' => 'donation',
            'reference_id' => $d->id,
            'donor_name' => $d->donor_name,
            'amount' => (float) $d->amount,
            'transaction_date' => $d->paid_at ? $d->paid_at->toDateString() : ($d->created_at ? $d->created_at->toDateString() : null),
        ])->values()->all();

        return [
            'check_code' => 'DONATION_RECONCILIATION',
            'name' => 'Donation Journal Reconciliation',
            'status' => $totalFailed === 0 ? 'passed' : 'failed',
            'severity' => $totalFailed === 0 ? null : 'critical',
            'message' => $totalFailed === 0 ? 'All paid donations have corresponding journal entries' : 'Paid donation has no journal entry',
            'total_checked' => $totalChecked,
            'total_failed' => $totalFailed,
            'errors' => $errors,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | CONTROL 8: ALLOCATION RECONCILIATION
    |--------------------------------------------------------------------------
    */
    protected function checkAllocationReconciliation(?int $accountingPeriodId, ?string $startDate, ?string $endDate): array
    {
        $allocationsQuery = Allocation::where('amount', '>', 0);
        if (Schema::hasColumn('allocations', 'status')) {
            $allocationsQuery->whereNotIn('status', ['draft', 'pending', 'rejected', 'cancelled', 'invalid']);
        }

        if ($startDate) {
            $allocationsQuery->where(function ($q) use ($startDate) {
                $q->whereDate('allocated_at', '>=', $startDate)
                    ->orWhere(function ($q2) use ($startDate) {
                        $q2->whereNull('allocated_at')->whereDate('created_at', '>=', $startDate);
                    });
            });
        }
        if ($endDate) {
            $allocationsQuery->where(function ($q) use ($endDate) {
                $q->whereDate('allocated_at', '<=', $endDate)
                    ->orWhere(function ($q2) use ($endDate) {
                        $q2->whereNull('allocated_at')->whereDate('created_at', '<=', $endDate);
                    });
            });
        }

        $totalChecked = (clone $allocationsQuery)->count();

        $unjournaled = (clone $allocationsQuery)
            ->whereNotExists(function ($q) {
                $q->select(DB::raw(1))
                    ->from('journal_entries')
                    ->where('reference_type', 'allocation')
                    ->whereColumn('reference_id', 'allocations.id')
                    ->where('status', 'posted');
            })
            ->get(['id', 'amount', 'allocated_at', 'created_at']);

        $totalFailed = $unjournaled->count();
        $errors = $unjournaled->map(fn($a) => [
            'reference_type' => 'allocation',
            'reference_id' => $a->id,
            'amount' => (float) $a->amount,
            'transaction_date' => $a->allocated_at ? Carbon::parse($a->allocated_at)->toDateString() : ($a->created_at ? Carbon::parse($a->created_at)->toDateString() : null),
        ])->values()->all();

        return [
            'check_code' => 'ALLOCATION_RECONCILIATION',
            'name' => 'Allocation Journal Reconciliation',
            'status' => $totalFailed === 0 ? 'passed' : 'failed',
            'severity' => $totalFailed === 0 ? null : 'critical',
            'message' => $totalFailed === 0 ? 'All allocations have corresponding journal entries' : 'Valid allocation has no journal entry',
            'total_checked' => $totalChecked,
            'total_failed' => $totalFailed,
            'errors' => $errors,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | CONTROL 9: DUPLICATE TRANSACTION JOURNAL
    |--------------------------------------------------------------------------
    */
    protected function checkDuplicateTransactionJournal(?int $accountingPeriodId, ?string $startDate, ?string $endDate): array
    {
        $query = JournalEntry::where('status', 'posted')
            ->whereIn('reference_type', ['donation', 'allocation'])
            ->whereNotNull('reference_id');

        $totalChecked = (clone $query)->count();

        $duplicates = (clone $query)
            ->select('reference_type', 'reference_id', DB::raw('count(*) as count'), DB::raw('GROUP_CONCAT(id) as journal_ids'))
            ->groupBy('reference_type', 'reference_id')
            ->havingRaw('count(*) > 1')
            ->get();

        $totalFailed = $duplicates->count();
        $errors = $duplicates->map(fn($row) => [
            'reference_type' => $row->reference_type,
            'reference_id' => (int) $row->reference_id,
            'journal_count' => (int) $row->count,
            'journal_ids' => array_map('intval', explode(',', (string) $row->journal_ids)),
        ])->values()->all();

        return [
            'check_code' => 'DUPLICATE_TRANSACTION_JOURNAL',
            'name' => 'Duplicate Transaction Journal',
            'status' => $totalFailed === 0 ? 'passed' : 'failed',
            'severity' => $totalFailed === 0 ? null : 'critical',
            'message' => $totalFailed === 0 ? 'No duplicate accounting journals detected for transactions' : 'Duplicate accounting journal detected for transaction',
            'total_checked' => $totalChecked,
            'total_failed' => $totalFailed,
            'errors' => $errors,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | CONTROL 10: GENERAL LEDGER RECONCILIATION
    |--------------------------------------------------------------------------
    */
    protected function checkGeneralLedgerReconciliation(?int $accountingPeriodId, ?string $startDate, ?string $endDate): array
    {
        $glData = $this->glService->getLedger(null, $accountingPeriodId, $startDate, $endDate, true);

        $linesQuery = JournalEntryLine::join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->where('journal_entries.status', 'posted');

        if ($accountingPeriodId) {
            $linesQuery->where('journal_entries.accounting_period_id', $accountingPeriodId);
        }
        if ($startDate) {
            $linesQuery->where('journal_entries.transaction_date', '>=', $startDate);
        }
        if ($endDate) {
            $linesQuery->where('journal_entries.transaction_date', '<=', $endDate);
        }

        $linesTotal = $linesQuery->selectRaw('COALESCE(SUM(debit), 0) as total_debit, COALESCE(SUM(credit), 0) as total_credit')->first();

        $expectedDebit = (float) ($linesTotal->total_debit ?? 0);
        $expectedCredit = (float) ($linesTotal->total_credit ?? 0);
        $glDebit = (float) ($glData['grand_total_debit'] ?? 0);
        $glCredit = (float) ($glData['grand_total_credit'] ?? 0);

        $debitDiff = abs($glDebit - $expectedDebit);
        $creditDiff = abs($glCredit - $expectedCredit);
        $isReconciled = $debitDiff < 0.001 && $creditDiff < 0.001;

        $totalChecked = $glData['total_accounts'] ?? 0;
        $totalFailed = $isReconciled ? 0 : 1;
        $errors = [];
        if (! $isReconciled) {
            $errors[] = [
                'gl_total_debit' => $glDebit,
                'journal_total_debit' => $expectedDebit,
                'difference_debit' => $debitDiff,
                'gl_total_credit' => $glCredit,
                'journal_total_credit' => $expectedCredit,
                'difference_credit' => $creditDiff,
            ];
        }

        return [
            'check_code' => 'GENERAL_LEDGER_RECONCILIATION',
            'name' => 'General Ledger Reconciliation',
            'status' => $totalFailed === 0 ? 'passed' : 'failed',
            'severity' => $totalFailed === 0 ? null : 'critical',
            'message' => $totalFailed === 0 ? 'General Ledger reconciles with posted journal entries' : 'General Ledger does not reconcile with posted journal entries',
            'total_checked' => $totalChecked,
            'total_failed' => $totalFailed,
            'errors' => $errors,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | CONTROL 11: TRIAL BALANCE RECONCILIATION
    |--------------------------------------------------------------------------
    */
    protected function checkTrialBalanceReconciliation(?int $accountingPeriodId, ?string $startDate, ?string $endDate): array
    {
        $tb = $this->tbService->getTrialBalance($accountingPeriodId, $startDate, $endDate, true);
        $isBalanced = ($tb['is_balanced'] ?? false) && abs((float) ($tb['total_debit_balance'] ?? 0) - (float) ($tb['total_credit_balance'] ?? 0)) < 0.001;

        $totalChecked = $tb['total_accounts'] ?? 0;
        $totalFailed = $isBalanced ? 0 : 1;
        $errors = [];
        if (! $isBalanced) {
            $errors[] = [
                'total_debit_balance' => (float) ($tb['total_debit_balance'] ?? 0),
                'total_credit_balance' => (float) ($tb['total_credit_balance'] ?? 0),
                'difference' => abs((float) ($tb['total_debit_balance'] ?? 0) - (float) ($tb['total_credit_balance'] ?? 0)),
            ];
        }

        return [
            'check_code' => 'TRIAL_BALANCE_RECONCILIATION',
            'name' => 'Trial Balance Reconciliation',
            'status' => $totalFailed === 0 ? 'passed' : 'failed',
            'severity' => $totalFailed === 0 ? null : 'critical',
            'message' => $totalFailed === 0 ? 'Trial balance is strictly balanced' : 'Trial balance is not balanced',
            'total_checked' => $totalChecked,
            'total_failed' => $totalFailed,
            'errors' => $errors,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | CONTROL 12: FINANCIAL STATEMENT RECONCILIATION
    |--------------------------------------------------------------------------
    */
    protected function checkFinancialStatementReconciliation(?int $accountingPeriodId, ?string $startDate, ?string $endDate): array
    {
        $bs = $this->fsService->getBalanceSheet($accountingPeriodId, $startDate, $endDate);
        $la = $this->fsService->getActivityStatement($accountingPeriodId, $startDate, $endDate);

        $bsBalanced = ($bs['is_balanced'] ?? false) && abs((float) $bs['total_assets'] - ((float) $bs['total_liabilities'] + (float) $bs['total_net_assets'])) < 0.001;
        $activityConsistent = abs(((float) $la['total_revenues'] - (float) $la['total_expenses']) - (float) $la['surplus_deficit']) < 0.001;

        $allPassed = $bsBalanced && $activityConsistent;
        $errors = [];
        if (! $bsBalanced) {
            $errors[] = [
                'statement' => 'Balance Sheet',
                'total_assets' => (float) $bs['total_assets'],
                'total_liabilities' => (float) $bs['total_liabilities'],
                'total_net_assets' => (float) $bs['total_net_assets'],
                'difference' => abs((float) $bs['total_assets'] - ((float) $bs['total_liabilities'] + (float) $bs['total_net_assets'])),
            ];
        }
        if (! $activityConsistent) {
            $errors[] = [
                'statement' => 'Activity Statement',
                'total_revenues' => (float) $la['total_revenues'],
                'total_expenses' => (float) $la['total_expenses'],
                'calculated_surplus' => (float) $la['total_revenues'] - (float) $la['total_expenses'],
                'reported_surplus' => (float) $la['surplus_deficit'],
            ];
        }

        return [
            'check_code' => 'FINANCIAL_STATEMENT_RECONCILIATION',
            'name' => 'Financial Statement Reconciliation',
            'status' => $allPassed ? 'passed' : 'failed',
            'severity' => $allPassed ? null : 'critical',
            'message' => $allPassed ? 'Financial statements reconcile successfully (Balance Sheet and Activity Statement balanced)' : 'Financial statement reconciliation failed',
            'total_checked' => 2,
            'total_failed' => count($errors),
            'errors' => $errors,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | CONTROL 13: POSTED JOURNAL IMMUTABILITY
    |--------------------------------------------------------------------------
    */
    protected function checkPostedJournalImmutability(?int $accountingPeriodId, ?string $startDate, ?string $endDate): array
    {
        $suspiciousAuditLogs = AuditLog::where('module', 'journal')
            ->whereIn('action', ['update_posted_journal', 'delete_posted_journal', 'posted_journal_mutation', 'illegal_mutation'])
            ->get(['id', 'user_id', 'action', 'reference_id', 'created_at']);

        $negativeLines = JournalEntryLine::join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->where('journal_entries.status', 'posted')
            ->where(function ($q) {
                $q->where('journal_entry_lines.debit', '<', 0)
                    ->orWhere('journal_entry_lines.credit', '<', 0);
            })
            ->select('journal_entry_lines.id as line_id', 'journal_entries.journal_number', 'journal_entry_lines.debit', 'journal_entry_lines.credit')
            ->get();

        $totalFailed = $suspiciousAuditLogs->count() + $negativeLines->count();
        $errors = [];
        foreach ($suspiciousAuditLogs as $log) {
            $errors[] = [
                'type' => 'audit_log_alert',
                'audit_log_id' => $log->id,
                'action' => $log->action,
                'reference_id' => $log->reference_id,
                'created_at' => (string) $log->created_at,
            ];
        }
        foreach ($negativeLines as $line) {
            $errors[] = [
                'type' => 'negative_line_value',
                'line_id' => $line->line_id,
                'journal_number' => $line->journal_number,
                'debit' => (float) $line->debit,
                'credit' => (float) $line->credit,
            ];
        }

        $totalChecked = JournalEntry::where('status', 'posted')->count();

        return [
            'check_code' => 'POSTED_JOURNAL_IMMUTABILITY',
            'name' => 'Posted Journal Immutability',
            'status' => $totalFailed === 0 ? 'passed' : 'failed',
            'severity' => $totalFailed === 0 ? null : 'critical',
            'message' => $totalFailed === 0 ? 'Posted journal immutability preserved' : 'Posted journal mutation requires audit review',
            'total_checked' => $totalChecked,
            'total_failed' => $totalFailed,
            'errors' => $errors,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | CONTROL 14: ACCOUNTING EQUATION
    |--------------------------------------------------------------------------
    */
    protected function checkAccountingEquation(?int $accountingPeriodId, ?string $startDate, ?string $endDate): array
    {
        $linesQuery = JournalEntryLine::join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->where('journal_entries.status', 'posted');

        if ($accountingPeriodId) {
            $linesQuery->where('journal_entries.accounting_period_id', $accountingPeriodId);
        }
        if ($startDate) {
            $linesQuery->where('journal_entries.transaction_date', '>=', $startDate);
        }
        if ($endDate) {
            $linesQuery->where('journal_entries.transaction_date', '<=', $endDate);
        }

        $totals = $linesQuery->selectRaw('COALESCE(SUM(debit), 0) as total_debit, COALESCE(SUM(credit), 0) as total_credit')->first();

        $totalDebit = (float) ($totals->total_debit ?? 0);
        $totalCredit = (float) ($totals->total_credit ?? 0);
        $diff = abs($totalDebit - $totalCredit);
        $isBalanced = $diff < 0.001;

        $totalChecked = (clone $linesQuery)->count();
        $totalFailed = $isBalanced ? 0 : 1;
        $errors = [];
        if (! $isBalanced) {
            $errors[] = [
                'total_debit' => $totalDebit,
                'total_credit' => $totalCredit,
                'difference' => $diff,
            ];
        }

        return [
            'check_code' => 'ACCOUNTING_EQUATION',
            'name' => 'Accounting Equation',
            'status' => $totalFailed === 0 ? 'passed' : 'failed',
            'severity' => $totalFailed === 0 ? null : 'critical',
            'message' => $totalFailed === 0 ? 'Accounting equation balanced (Total Debit equals Total Credit)' : 'Total debit does not equal total credit across posted journals',
            'total_checked' => $totalChecked,
            'total_failed' => $totalFailed,
            'errors' => $errors,
        ];
    }
}
