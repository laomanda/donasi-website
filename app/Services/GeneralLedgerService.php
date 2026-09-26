<?php

namespace App\Services;

use App\Models\Account;
use App\Models\AccountingPeriod;
use App\Models\JournalEntryLine;
use Carbon\Carbon;

class GeneralLedgerService
{
    /**
     * Generate General Ledger data.
     */
    public function getLedger(
        int|array|null $accountId = null,
        ?int $accountingPeriodId = null,
        ?string $startDate = null,
        ?string $endDate = null,
        bool $includeZeroBalance = false
    ): array {
        // Support associative array parameter
        if (is_array($accountId)) {
            $filters = $accountId;
            $accountId = $filters['account_id'] ?? null;
            $accountingPeriodId = $filters['accounting_period_id'] ?? $filters['period_id'] ?? null;
            $startDate = $filters['start_date'] ?? null;
            $endDate = $filters['end_date'] ?? null;
            $includeZeroBalance = (bool) ($filters['include_zero_balance'] ?? false);
        }

        // Resolve accounting period details if provided
        $period = null;
        if ($accountingPeriodId) {
            $period = AccountingPeriod::find($accountingPeriodId);
            if ($period) {
                $startDate = $startDate ?: ($period->start_date ? Carbon::parse($period->start_date)->toDateString() : null);
                $endDate = $endDate ?: ($period->end_date ? Carbon::parse($period->end_date)->toDateString() : null);
            }
        }

        // Determine accounts to process
        $accountsQuery = Account::where('is_active', true)->orderBy('code', 'asc');

        if ($accountId) {
            $accountsQuery->where('id', $accountId);
        }

        $accounts = $accountsQuery->get();

        $accountsData = [];
        $grandTotalDebit = 0.0;
        $grandTotalCredit = 0.0;

        foreach ($accounts as $account) {
            $ledgerData = $this->buildAccountLedger($account, $accountingPeriodId, $startDate, $endDate);

            // If specific account requested, always include it.
            // If viewing all accounts, include only if there is activity or non-zero balance (unless includeZeroBalance is true).
            $hasActivity = count($ledgerData['transactions']) > 0 || abs($ledgerData['opening_balance']) > 0.001;

            if ($accountId || $includeZeroBalance || $hasActivity) {
                $accountsData[] = $ledgerData;
                $grandTotalDebit += $ledgerData['total_debit'];
                $grandTotalCredit += $ledgerData['total_credit'];
            }
        }

        return [
            'period' => $period ? [
                'id' => $period->id,
                'name' => $period->name,
                'start_date' => $period->start_date ? Carbon::parse($period->start_date)->toDateString() : null,
                'end_date' => $period->end_date ? Carbon::parse($period->end_date)->toDateString() : null,
                'status' => $period->status,
            ] : null,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'total_accounts' => count($accountsData),
            'grand_total_debit' => $grandTotalDebit,
            'grand_total_credit' => $grandTotalCredit,
            'accounts' => $accountsData,
            'account' => count($accountsData) === 1 ? $accountsData[0] : null,
        ];
    }

    /**
     * Build ledger data for a single account.
     */
    protected function buildAccountLedger(
        Account $account,
        ?int $accountingPeriodId = null,
        ?string $startDate = null,
        ?string $endDate = null
    ): array {
        // 1. Calculate opening balance (all posted entries before $startDate)
        $openingBalance = $this->calculateOpeningBalance($account, $startDate);

        // 2. Query transactions in the requested range
        $linesQuery = JournalEntryLine::with(['journalEntry'])
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->where('journal_entry_lines.account_id', $account->id)
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

        $lines = $linesQuery->orderBy('journal_entries.transaction_date', 'asc')
            ->orderBy('journal_entries.journal_number', 'asc')
            ->orderBy('journal_entry_lines.id', 'asc')
            ->select('journal_entry_lines.*')
            ->get();

        // 3. Compute running balance and totals
        $runningBalance = $openingBalance;
        $totalDebit = 0.0;
        $totalCredit = 0.0;
        $transactions = [];

        foreach ($lines as $line) {
            $debit = (float) $line->debit;
            $credit = (float) $line->credit;
            $totalDebit += $debit;
            $totalCredit += $credit;

            $runningBalance = $this->computeBalance($account->normal_balance, $runningBalance, $debit, $credit);
            $entry = $line->journalEntry;

            $transactions[] = [
                'journal_entry_id' => $entry?->id,
                'line_id' => $line->id,
                'transaction_date' => $entry?->transaction_date ? Carbon::parse($entry->transaction_date)->toDateString() : null,
                'journal_number' => $entry?->journal_number,
                'reference_type' => $entry?->reference_type,
                'reference_id' => $entry?->reference_id,
                'description' => $line->description ?: $entry?->description,
                'debit' => $debit,
                'credit' => $credit,
                'running_balance' => $runningBalance,
            ];
        }

        $closingBalance = $runningBalance;

        return [
            'account_id' => $account->id,
            'code' => $account->code,
            'name' => $account->name,
            'account_type' => $account->account_type,
            'normal_balance' => $account->normal_balance,
            'report_category' => $account->report_category,
            'opening_balance' => $openingBalance,
            'total_debit' => $totalDebit,
            'total_credit' => $totalCredit,
            'closing_balance' => $closingBalance,
            'transactions' => $transactions,
        ];
    }

    /**
     * Calculate opening balance for an account prior to a given start date.
     */
    protected function calculateOpeningBalance(Account $account, ?string $startDate): float
    {
        if (! $startDate) {
            return 0.00;
        }

        $lines = JournalEntryLine::where('account_id', $account->id)
            ->whereHas('journalEntry', function ($query) use ($startDate) {
                $query->where('status', 'posted')
                    ->where('transaction_date', '<', $startDate);
            })
            ->selectRaw('COALESCE(SUM(debit), 0) as total_debit, COALESCE(SUM(credit), 0) as total_credit')
            ->toBase()
            ->first();

        $totalDebit = (float) ($lines?->total_debit ?? 0);
        $totalCredit = (float) ($lines?->total_credit ?? 0);

        return $this->computeBalance($account->normal_balance, 0.0, $totalDebit, $totalCredit);
    }

    /**
     * Compute balance based on account normal balance rule:
     * - Debit normal (Asset, Expense): Opening + Debit - Credit
     * - Credit normal (Liability, Net Asset / Equity, Revenue): Opening + Credit - Debit
     */
    public function computeBalance(string $normalBalance, float $openingBalance, float $debit, float $credit): float
    {
        $normal = strtolower(trim($normalBalance));

        if ($normal === 'credit') {
            return $openingBalance + $credit - $debit;
        }

        // Default to debit normal
        return $openingBalance + $debit - $credit;
    }
}
