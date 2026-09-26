<?php

namespace App\Services;

use App\Models\AccountingPeriod;

class FinancialStatementService
{
    public function __construct(
        protected TrialBalanceService $trialBalanceService,
        protected FinancialNoteService $financialNoteService
    ) {}

    /**
     * Generate Balance Sheet (Laporan Posisi Keuangan - LP).
     *
     * @param int|array|null $accountingPeriodId
     * @param string|null $startDate
     * @param string|null $endDate
     * @return array
     */
    public function getBalanceSheet(
        int|array|null $accountingPeriodId = null,
        ?string $startDate = null,
        ?string $endDate = null
    ): array {
        if (is_array($accountingPeriodId)) {
            $filters = $accountingPeriodId;
            $accountingPeriodId = $filters['accounting_period_id'] ?? $filters['period_id'] ?? null;
            $startDate = $filters['start_date'] ?? null;
            $endDate = $filters['end_date'] ?? null;
        }

        // Get trial balance with all accounts included
        $tb = $this->trialBalanceService->getTrialBalance(
            $accountingPeriodId,
            $startDate,
            $endDate,
            true
        );

        $accounts = collect($tb['accounts']);

        // 1. Assets
        $assetItems = $accounts
            ->where('account_type', 'asset')
            ->filter(fn ($item) => abs($item['ending_balance']) > 0.001)
            ->map(fn ($item) => [
                'account_id'      => $item['account_id'],
                'code'            => $item['code'],
                'name'            => $item['name'],
                'account_type'    => $item['account_type'],
                'report_category' => $item['report_category'] ?? 'Aset',
                'balance'         => (float) $item['ending_balance'],
            ])
            ->values();

        $totalAssets = (float) $assetItems->sum('balance');

        // 2. Liabilities
        $liabilityItems = $accounts
            ->where('account_type', 'liability')
            ->filter(fn ($item) => abs($item['ending_balance']) > 0.001)
            ->map(fn ($item) => [
                'account_id'      => $item['account_id'],
                'code'            => $item['code'],
                'name'            => $item['name'],
                'account_type'    => $item['account_type'],
                'report_category' => $item['report_category'] ?? 'Liabilitas',
                'balance'         => (float) $item['ending_balance'],
            ])
            ->values();

        $totalLiabilities = (float) $liabilityItems->sum('balance');

        // 3. Activity statement numbers (to roll current period surplus/deficit into net assets)
        $totalRevenues = (float) $accounts->where('account_type', 'revenue')->sum('ending_balance');
        $totalExpenses = (float) $accounts->where('account_type', 'expense')->sum('ending_balance');
        $currentPeriodSurplus = $totalRevenues - $totalExpenses;

        // 4. Net Assets (Aset Neto Wakaf)
        $netAssetItems = $accounts
            ->where('account_type', 'net_asset')
            ->filter(fn ($item) => abs($item['ending_balance']) > 0.001)
            ->map(fn ($item) => [
                'account_id'      => $item['account_id'],
                'code'            => $item['code'],
                'name'            => $item['name'],
                'account_type'    => $item['account_type'],
                'report_category' => $item['report_category'] ?? 'Aset Neto',
                'balance'         => (float) $item['ending_balance'],
            ])
            ->values();

        // If there is operational surplus/deficit in current period, append to net assets
        if (abs($currentPeriodSurplus) > 0.001) {
            $netAssetItems->push([
                'account_id'      => null,
                'code'            => 'SURPLUS-BERJALAN',
                'name'            => 'Surplus / (Defisit) Periode Berjalan',
                'account_type'    => 'net_asset',
                'report_category' => 'Aset Neto Berjalan',
                'balance'         => $currentPeriodSurplus,
            ]);
        }

        $totalNetAssets = (float) $netAssetItems->sum('balance');

        // Balance check: Total Assets == Total Liabilities + Total Net Assets
        $isBalanced = abs($totalAssets - ($totalLiabilities + $totalNetAssets)) < 0.001;

        // Notes / CLK for the period
        $resolvedPeriodId = $accountingPeriodId ?? ($tb['period']['id'] ?? null);
        $notes = $resolvedPeriodId ? $this->financialNoteService->getNotes($resolvedPeriodId, null, 'published') : [];

        return [
            'period'                 => $tb['period'],
            'start_date'             => $tb['start_date'],
            'end_date'               => $tb['end_date'],
            'assets'                 => $assetItems->all(),
            'total_assets'           => $totalAssets,
            'total_asset'            => $totalAssets,
            'liabilities'            => $liabilityItems->all(),
            'total_liabilities'      => $totalLiabilities,
            'total_liability'        => $totalLiabilities,
            'net_assets'             => $netAssetItems->all(),
            'total_net_assets'       => $totalNetAssets,
            'total_net_asset'        => $totalNetAssets,
            'current_period_surplus' => $currentPeriodSurplus,
            'is_balanced'            => $isBalanced,
            'notes'                  => $notes,
            'financial_notes'        => $notes,
        ];
    }

    /**
     * Generate Activity Statement (Laporan Aktivitas - LA).
     *
     * @param int|array|null $accountingPeriodId
     * @param string|null $startDate
     * @param string|null $endDate
     * @return array
     */
    public function getActivityStatement(
        int|array|null $accountingPeriodId = null,
        ?string $startDate = null,
        ?string $endDate = null
    ): array {
        if (is_array($accountingPeriodId)) {
            $filters = $accountingPeriodId;
            $accountingPeriodId = $filters['accounting_period_id'] ?? $filters['period_id'] ?? null;
            $startDate = $filters['start_date'] ?? null;
            $endDate = $filters['end_date'] ?? null;
        }

        // Get trial balance with all accounts included
        $tb = $this->trialBalanceService->getTrialBalance(
            $accountingPeriodId,
            $startDate,
            $endDate,
            true
        );

        $accounts = collect($tb['accounts']);

        // 1. Penerimaan / Pendapatan (Revenues)
        $revenueItems = $accounts
            ->where('account_type', 'revenue')
            ->filter(fn ($item) => abs($item['ending_balance']) > 0.001)
            ->map(fn ($item) => [
                'account_id'      => $item['account_id'],
                'code'            => $item['code'],
                'name'            => $item['name'],
                'account_type'    => $item['account_type'],
                'report_category' => $item['report_category'] ?? 'Penerimaan',
                'amount'          => (float) $item['ending_balance'],
            ])
            ->values();

        $totalRevenues = (float) $revenueItems->sum('amount');

        // 2. Beban dan Penyaluran (Expenses)
        $expenseItems = $accounts
            ->where('account_type', 'expense')
            ->filter(fn ($item) => abs($item['ending_balance']) > 0.001)
            ->map(fn ($item) => [
                'account_id'      => $item['account_id'],
                'code'            => $item['code'],
                'name'            => $item['name'],
                'account_type'    => $item['account_type'],
                'report_category' => $item['report_category'] ?? 'Penyaluran dan Beban',
                'amount'          => (float) $item['ending_balance'],
            ])
            ->values();

        $totalExpenses = (float) $expenseItems->sum('amount');

        // 3. Surplus / Defisit
        $surplusDeficit = $totalRevenues - $totalExpenses;

        // Notes / CLK for the period
        $resolvedPeriodId = $accountingPeriodId ?? ($tb['period']['id'] ?? null);
        $notes = $resolvedPeriodId ? $this->financialNoteService->getNotes($resolvedPeriodId, null, 'published') : [];

        return [
            'period'           => $tb['period'],
            'start_date'       => $tb['start_date'],
            'end_date'         => $tb['end_date'],
            'revenues'         => $revenueItems->all(),
            'total_revenues'   => $totalRevenues,
            'total_penerimaan' => $totalRevenues,
            'expenses'         => $expenseItems->all(),
            'total_expenses'   => $totalExpenses,
            'total_beban'      => $totalExpenses,
            'surplus_deficit'  => $surplusDeficit,
            'is_surplus'       => $surplusDeficit >= 0,
            'notes'            => $notes,
            'financial_notes'  => $notes,
        ];
    }

    /**
     * Generate Comprehensive Annual Financial Report Package:
     * LP (Balance Sheet) + LA (Activity Statement) + LRAW (Waqf Assets) + CLK (Notes).
     *
     * @param int $accountingPeriodId
     * @return array
     */
    public function getComprehensivePackage(int $accountingPeriodId): array
    {
        $period = AccountingPeriod::find($accountingPeriodId);
        $balanceSheet = $this->getBalanceSheet($accountingPeriodId);
        $activityStatement = $this->getActivityStatement($accountingPeriodId);
        $waqfAssetReport = app(WaqfAssetReportService::class)->getReport(null, $accountingPeriodId);
        $notes = $this->financialNoteService->getNotes($accountingPeriodId, null, 'published');

        return [
            'period'             => $period,
            'balance_sheet'      => $balanceSheet,
            'activity_statement' => $activityStatement,
            'waqf_asset_report'  => $waqfAssetReport,
            'financial_notes'    => $notes,
        ];
    }
}
