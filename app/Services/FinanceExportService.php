<?php

namespace App\Services;

use App\Exports\Finance\AccountsExport;
use App\Exports\Finance\ActivityStatementExport;
use App\Exports\Finance\AnnualPackageExport;
use App\Exports\Finance\BalanceSheetExport;
use App\Exports\Finance\FinancialNotesExport;
use App\Exports\Finance\GeneralLedgerExport;
use App\Exports\Finance\JournalEntriesExport;
use App\Exports\Finance\TrialBalanceExport;
use App\Exports\Finance\WaqfAssetsExport;
use App\Models\AccountingPeriod;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class FinanceExportService
{
    /**
     * 1. Export Chart of Accounts (AD)
     */
    public function exportAccounts(?array $filters = null, ?string $filename = null): BinaryFileResponse
    {
        $filters = $filters ?? [];
        $filename = $filename ?: 'chart-of-accounts-' . now()->format('Ymd_His') . '.xlsx';

        return Excel::download(new AccountsExport($filters, 'Daftar Akun'), $filename);
    }

    /**
     * 2. Export Jurnal Umum (JU)
     */
    public function exportJournalEntries(?array $filters = null, ?string $filename = null): BinaryFileResponse
    {
        $filters = $filters ?? [];
        $filename = $filename ?: 'jurnal-umum-' . now()->format('Ymd_His') . '.xlsx';

        return Excel::download(new JournalEntriesExport($filters, 'Jurnal Umum'), $filename);
    }

    /**
     * 3. Export Buku Besar (BB)
     */
    public function exportGeneralLedger(?array $filters = null, ?string $filename = null): BinaryFileResponse
    {
        $filters = $filters ?? [];
        $filename = $filename ?: 'buku-besar-' . now()->format('Ymd_His') . '.xlsx';

        return Excel::download(new GeneralLedgerExport($filters, 'Buku Besar'), $filename);
    }

    /**
     * 4. Export Neraca Saldo (NS-TB)
     */
    public function exportTrialBalance(?array $filters = null, ?string $filename = null): BinaryFileResponse
    {
        $filters = $filters ?? [];
        $filename = $filename ?: 'neraca-saldo-tb-' . now()->format('Ymd_His') . '.xlsx';

        return Excel::download(new TrialBalanceExport($filters, 'NS-TB'), $filename);
    }

    /**
     * 5. Export Laporan Posisi Keuangan (LP)
     */
    public function exportBalanceSheet(?array $filters = null, ?string $filename = null): BinaryFileResponse
    {
        $filters = $filters ?? [];
        $filename = $filename ?: 'laporan-posisi-keuangan-' . now()->format('Ymd_His') . '.xlsx';

        return Excel::download(new BalanceSheetExport($filters, 'LP'), $filename);
    }

    /**
     * 6. Export Laporan Aktivitas (LA)
     */
    public function exportActivityStatement(?array $filters = null, ?string $filename = null): BinaryFileResponse
    {
        $filters = $filters ?? [];
        $filename = $filename ?: 'laporan-aktivitas-' . now()->format('Ymd_His') . '.xlsx';

        return Excel::download(new ActivityStatementExport($filters, 'LA'), $filename);
    }

    /**
     * 7. Export Laporan Rincian Aset Wakaf (LRAW)
     */
    public function exportWaqfAssets(?array $filters = null, ?string $filename = null): BinaryFileResponse
    {
        $filters = $filters ?? [];
        $filename = $filename ?: 'laporan-rincian-aset-wakaf-' . now()->format('Ymd_His') . '.xlsx';

        return Excel::download(new WaqfAssetsExport($filters, 'LRAW'), $filename);
    }

    /**
     * 8. Export Catatan Atas Laporan Keuangan (CLK)
     */
    public function exportFinancialNotes(?array $filters = null, ?string $filename = null): BinaryFileResponse
    {
        $filters = $filters ?? [];
        $filename = $filename ?: 'catatan-atas-laporan-keuangan-' . now()->format('Ymd_His') . '.xlsx';

        return Excel::download(new FinancialNotesExport($filters, 'CLK'), $filename);
    }

    /**
     * 9. Export Annual Package (Multi-Sheet: AD, JU, BB, NS-TB, LP, LA, LRAW, CLK)
     */
    public function exportAnnualPackage(int|array|null $periodId = null, ?string $filename = null): BinaryFileResponse
    {
        $filters = is_array($periodId) ? $periodId : ['period_id' => $periodId, 'accounting_period_id' => $periodId];
        $resolvedPeriodId = $filters['period_id'] ?? $filters['accounting_period_id'] ?? null;

        $periodName = 'laporan-tahunan';
        if ($resolvedPeriodId) {
            $period = AccountingPeriod::find($resolvedPeriodId);
            if ($period) {
                $periodName = str_replace(' ', '-', strtolower($period->name));
            }
        }

        $filename = $filename ?: "paket-keuangan-{$periodName}-" . now()->format('Ymd_His') . '.xlsx';

        return Excel::download(new AnnualPackageExport($filters), $filename);
    }

    // Export instance factory helpers
    public function getAccountsExport(array $filters = [], string $title = 'Daftar Akun'): AccountsExport
    {
        return new AccountsExport($filters, $title);
    }

    public function getJournalEntriesExport(array $filters = [], string $title = 'Jurnal Umum'): JournalEntriesExport
    {
        return new JournalEntriesExport($filters, $title);
    }

    public function getGeneralLedgerExport(array $filters = [], string $title = 'Buku Besar'): GeneralLedgerExport
    {
        return new GeneralLedgerExport($filters, $title);
    }

    public function getTrialBalanceExport(array $filters = [], string $title = 'NS-TB'): TrialBalanceExport
    {
        return new TrialBalanceExport($filters, $title);
    }

    public function getBalanceSheetExport(array $filters = [], string $title = 'LP'): BalanceSheetExport
    {
        return new BalanceSheetExport($filters, $title);
    }

    public function getActivityStatementExport(array $filters = [], string $title = 'LA'): ActivityStatementExport
    {
        return new ActivityStatementExport($filters, $title);
    }

    public function getWaqfAssetsExport(array $filters = [], string $title = 'LRAW'): WaqfAssetsExport
    {
        return new WaqfAssetsExport($filters, $title);
    }

    public function getFinancialNotesExport(array $filters = [], string $title = 'CLK'): FinancialNotesExport
    {
        return new FinancialNotesExport($filters, $title);
    }

    public function getAnnualPackageExport(array $filters = []): AnnualPackageExport
    {
        return new AnnualPackageExport($filters);
    }
}
