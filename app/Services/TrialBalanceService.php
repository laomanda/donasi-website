<?php

namespace App\Services;

use App\Models\Account;
use App\Models\AccountingPeriod;
use App\Models\JournalEntryLine;
use Carbon\Carbon;

class TrialBalanceService
{
    /**
     * Generate Trial Balance / Neraca Saldo (NS-TB).
     *
     * @param int|array|null $accountingPeriodId
     * @param string|null $startDate
     * @param string|null $endDate
     * @param bool $includeZeroBalance
     * @return array
     */
    public function getTrialBalance(
        int|array|null $accountingPeriodId = null,
        ?string $startDate = null,
        ?string $endDate = null,
        bool $includeZeroBalance = false
    ): array {
        // Support associative array parameter
        if (is_array($accountingPeriodId)) {
            $filters = $accountingPeriodId;
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

        // Aggregate posted journal lines per account
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

        $totals = $linesQuery->groupBy('journal_entry_lines.account_id')
            ->selectRaw('
                journal_entry_lines.account_id,
                COALESCE(SUM(journal_entry_lines.debit), 0) as total_debit,
                COALESCE(SUM(journal_entry_lines.credit), 0) as total_credit
            ')
            ->get()
            ->keyBy('account_id');

        // Fetch accounts
        $accounts = Account::where('is_active', true)->orderBy('code', 'asc')->get();

        $accountsData = [];
        $totalDebitBalance = 0.0;
        $totalCreditBalance = 0.0;
        $totalDebitTurnover = 0.0;
        $totalCreditTurnover = 0.0;

        foreach ($accounts as $account) {
            $lineTotal = $totals->get($account->id);

            $totalDebit = $lineTotal ? (float) $lineTotal->total_debit : 0.0;
            $totalCredit = $lineTotal ? (float) $lineTotal->total_credit : 0.0;

            // Skip accounts without activity if includeZeroBalance is false
            if (!$includeZeroBalance && $totalDebit == 0.0 && $totalCredit == 0.0) {
                continue;
            }

            $totalDebitTurnover += $totalDebit;
            $totalCreditTurnover += $totalCredit;

            $normal = strtolower(trim($account->normal_balance));

            if ($normal === 'credit') {
                // Liability, Net Asset, Revenue
                $endingBalance = $totalCredit - $totalDebit;
                if ($endingBalance >= 0) {
                    $debitBalance = 0.0;
                    $creditBalance = $endingBalance;
                } else {
                    $debitBalance = abs($endingBalance);
                    $creditBalance = 0.0;
                }
            } else {
                // Asset, Expense (normal debit)
                $endingBalance = $totalDebit - $totalCredit;
                if ($endingBalance >= 0) {
                    $debitBalance = $endingBalance;
                    $creditBalance = 0.0;
                } else {
                    $debitBalance = 0.0;
                    $creditBalance = abs($endingBalance);
                }
            }

            $totalDebitBalance += $debitBalance;
            $totalCreditBalance += $creditBalance;

            $accountsData[] = [
                'account_id'      => $account->id,
                'code'            => $account->code,
                'name'            => $account->name,
                'account_type'    => $account->account_type,
                'normal_balance'  => $account->normal_balance,
                'total_debit'     => $totalDebit,
                'total_credit'    => $totalCredit,
                'ending_balance'  => $endingBalance,
                'debit_balance'   => $debitBalance,
                'credit_balance'  => $creditBalance,
            ];
        }

        $isBalanced = abs($totalDebitBalance - $totalCreditBalance) < 0.001;

        return [
            'period'               => $period ? [
                'id'         => $period->id,
                'name'       => $period->name,
                'start_date' => $period->start_date ? Carbon::parse($period->start_date)->toDateString() : null,
                'end_date'   => $period->end_date ? Carbon::parse($period->end_date)->toDateString() : null,
                'status'     => $period->status,
            ] : null,
            'start_date'           => $startDate,
            'end_date'             => $endDate,
            'total_accounts'       => count($accountsData),
            'total_debit'          => $totalDebitTurnover,
            'total_credit'         => $totalCreditTurnover,
            'total_debit_balance'  => $totalDebitBalance,
            'total_credit_balance' => $totalCreditBalance,
            'is_balanced'          => $isBalanced,
            'accounts'             => $accountsData,
        ];
    }
}
