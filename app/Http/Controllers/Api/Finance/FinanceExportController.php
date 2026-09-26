<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Services\FinanceExportService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class FinanceExportController extends Controller
{
    public function __construct(
        protected FinanceExportService $exportService
    ) {}

    /**
     * 1. Export Chart of Accounts (AD)
     * GET /api/v1/finance/export/accounts
     */
    public function accounts(Request $request): BinaryFileResponse
    {
        $request->validate([
            'is_active'    => ['nullable', 'boolean'],
            'account_type' => ['nullable', 'string', 'in:asset,liability,net_asset,revenue,expense'],
        ]);

        return $this->exportService->exportAccounts($request->all());
    }

    /**
     * 2. Export Jurnal Umum (JU)
     * GET /api/v1/finance/export/journals
     */
    public function journals(Request $request): BinaryFileResponse
    {
        $request->validate([
            'period_id'            => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'accounting_period_id' => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'start_date'           => ['nullable', 'date'],
            'end_date'             => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        return $this->exportService->exportJournalEntries($request->all());
    }

    /**
     * 3. Export Buku Besar (BB)
     * GET /api/v1/finance/export/general-ledger
     */
    public function generalLedger(Request $request): BinaryFileResponse
    {
        $request->validate([
            'account_id'           => ['nullable', 'integer', 'exists:accounts,id'],
            'period_id'            => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'accounting_period_id' => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'start_date'           => ['nullable', 'date'],
            'end_date'             => ['nullable', 'date', 'after_or_equal:start_date'],
            'include_zero_balance' => ['nullable', 'boolean'],
        ]);

        return $this->exportService->exportGeneralLedger($request->all());
    }

    /**
     * 4. Export Neraca Saldo (NS-TB)
     * GET /api/v1/finance/export/trial-balance
     */
    public function trialBalance(Request $request): BinaryFileResponse
    {
        $request->validate([
            'period_id'            => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'accounting_period_id' => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'start_date'           => ['nullable', 'date'],
            'end_date'             => ['nullable', 'date', 'after_or_equal:start_date'],
            'include_zero_balance' => ['nullable', 'boolean'],
        ]);

        return $this->exportService->exportTrialBalance($request->all());
    }

    /**
     * 5. Export Laporan Posisi Keuangan (LP)
     * GET /api/v1/finance/export/balance-sheet
     */
    public function balanceSheet(Request $request): BinaryFileResponse
    {
        $request->validate([
            'period_id'            => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'accounting_period_id' => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'start_date'           => ['nullable', 'date'],
            'end_date'             => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        return $this->exportService->exportBalanceSheet($request->all());
    }

    /**
     * 6. Export Laporan Aktivitas (LA)
     * GET /api/v1/finance/export/activity-statement
     */
    public function activityStatement(Request $request): BinaryFileResponse
    {
        $request->validate([
            'period_id'            => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'accounting_period_id' => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'start_date'           => ['nullable', 'date'],
            'end_date'             => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        return $this->exportService->exportActivityStatement($request->all());
    }

    /**
     * 7. Export LRAW (Laporan Rincian Aset Wakaf)
     * GET /api/v1/finance/export/waqf-assets
     */
    public function waqfAssets(Request $request): BinaryFileResponse
    {
        $request->validate([
            'category_id'          => ['nullable', 'integer', 'exists:waqf_asset_categories,id'],
            'period_id'            => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'accounting_period_id' => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'status'               => ['nullable', 'string', 'in:active,under_repair,damaged,disposed'],
        ]);

        return $this->exportService->exportWaqfAssets($request->all());
    }

    /**
     * 8. Export Catatan Atas Laporan Keuangan (CLK)
     * GET /api/v1/finance/export/financial-notes
     */
    public function financialNotes(Request $request): BinaryFileResponse
    {
        $request->validate([
            'period_id'            => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'accounting_period_id' => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'category'             => ['nullable', 'string'],
            'status'               => ['nullable', 'string', 'in:draft,published,archived'],
        ]);

        return $this->exportService->exportFinancialNotes($request->all());
    }

    /**
     * 9. Export Annual Package (Multi-Sheet: AD, JU, BB, NS-TB, LP, LA, LRAW, CLK)
     * GET /api/v1/finance/export/annual-package
     */
    public function annualPackage(Request $request): BinaryFileResponse
    {
        // Support either period_id or accounting_period_id
        if (!$request->filled('period_id') && $request->filled('accounting_period_id')) {
            $request->merge(['period_id' => $request->input('accounting_period_id')]);
        }

        $request->validate([
            'period_id' => ['required', 'integer', 'exists:accounting_periods,id'],
        ]);

        $periodId = (int) $request->input('period_id');

        return $this->exportService->exportAnnualPackage($periodId);
    }
}
