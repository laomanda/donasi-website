<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Allocation;
use App\Models\Donation;
use App\Models\JournalEntryLine;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

/**
 * PublicFinanceReadService
 *
 * Presentation and read-only aggregation layer between the internal YWDP Finance Engine
 * and public-facing endpoints (Landing Page, Transparansi Page, Public APIs).
 *
 * CRITICAL ACCOUNTING CONSTRAINTS:
 * 1. READ ONLY - Never creates, modifies, posts, or reverses any journal or accounting data.
 * 2. POSTED JOURNALS ONLY - All official financial figures derive strictly from double-entry
 *    journal lines with status 'posted'. Drafts, voids, and pending entries are excluded.
 * 3. NO SYNTHETIC VALUES - No arbitrary 7% multipliers, no fake balances, and no assumed ratios.
 * 4. CLEAR ACCOUNTABILITY - Distinguishes between Wakaf revenues and total institutional revenues,
 *    and keeps nazhir expenses separate from general operational overhead.
 */
class PublicFinanceReadService
{
    public function __construct(
        protected ?WaqfAssetReportService $waqfAssetReportService = null
    ) {
        $this->waqfAssetReportService = $waqfAssetReportService ?? app(WaqfAssetReportService::class);
    }

    /**
     * Get base query for posted journal entry lines joined with journal entries and accounts.
     * Guarantees that each posted line is joined to exactly one account, preventing double counting.
     */
    protected function baseJournalLineQuery(?int $year = null, ?int $accountingPeriodId = null): Builder
    {
        $query = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->join('accounts', 'journal_entry_lines.account_id', '=', 'accounts.id')
            ->where('journal_entries.status', '=', 'posted');

        if ($year !== null) {
            $query->whereYear('journal_entries.transaction_date', $year);
        }

        if ($accountingPeriodId !== null) {
            $query->where('journal_entries.accounting_period_id', $accountingPeriodId);
        }

        return $query;
    }

    /**
     * Get base query for cumulative posted journal entry lines up to a specified cutoff date.
     */
    protected function baseCumulativeJournalLineQuery(string $cutoffDate): Builder
    {
        return JournalEntryLine::query()
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->join('accounts', 'journal_entry_lines.account_id', '=', 'accounts.id')
            ->where('journal_entries.status', '=', 'posted')
            ->whereDate('journal_entries.transaction_date', '<=', $cutoffDate);
    }

    /**
     * 1. Total Wakaf Terhimpun
     *
     * Official financial figure for waqf-specific collections (Penerimaan Wakaf: 4100 series).
     * Anchor: Laporan Aktivitas (LA) & CLK Catatan 14.
     * Calculation: Net credit (credit - debit) on accounts with report_category = 'Penerimaan Wakaf'.
     */
    public function getTotalWaqfCollected(?int $year = null, ?int $accountingPeriodId = null): float
    {
        $total = $this->baseJournalLineQuery($year, $accountingPeriodId)
            ->where('accounts.account_type', '=', 'revenue')
            ->where('accounts.report_category', '=', 'Penerimaan Wakaf')
            ->selectRaw('COALESCE(SUM(journal_entry_lines.credit - journal_entry_lines.debit), 0) as total')
            ->value('total');

        return round((float) $total, 2);
    }

    /**
     * 2. Dana Dihimpun (Total Institusional Revenue)
     *
     * Total recognized institutional collections including waqf revenues, productive business share,
     * and designated infaq/sedekah.
     * Calculation: Net credit (credit - debit) across all revenue accounts (account_type = 'revenue').
     */
    public function getTotalCollected(?int $year = null, ?int $accountingPeriodId = null): float
    {
        $total = $this->baseJournalLineQuery($year, $accountingPeriodId)
            ->where('accounts.account_type', '=', 'revenue')
            ->selectRaw('COALESCE(SUM(journal_entry_lines.credit - journal_entry_lines.debit), 0) as total')
            ->value('total');

        return round((float) $total, 2);
    }

    /**
     * 3. Dana Disalurkan
     *
     * Official distribution to beneficiaries (Mauquf Alaih).
     * Anchor: Laporan Aktivitas (LA) Penyaluran Manfaat Wakaf (5100 series).
     * Calculation: Net debit (debit - credit) on accounts with report_category = 'Penyaluran Manfaat'.
     */
    public function getTotalDistributed(?int $year = null, ?int $accountingPeriodId = null): float
    {
        $total = $this->baseJournalLineQuery($year, $accountingPeriodId)
            ->where('accounts.account_type', '=', 'expense')
            ->where('accounts.report_category', '=', 'Penyaluran Manfaat')
            ->selectRaw('COALESCE(SUM(journal_entry_lines.debit - journal_entry_lines.credit), 0) as total')
            ->value('total');

        return round((float) $total, 2);
    }

    /**
     * 4. Beban Nazhir (Hak Nazhir & Pemeliharaan Aset)
     *
     * Actual expenses incurred for nazhir management rights and waqf asset maintenance (5200 series).
     * Calculation: Net debit (debit - credit) on accounts with report_category = 'Beban Nazhir'.
     */
    public function getNazhirExpense(?int $year = null, ?int $accountingPeriodId = null): float
    {
        $total = $this->baseJournalLineQuery($year, $accountingPeriodId)
            ->where('accounts.account_type', '=', 'expense')
            ->where('accounts.report_category', '=', 'Beban Nazhir')
            ->selectRaw('COALESCE(SUM(journal_entry_lines.debit - journal_entry_lines.credit), 0) as total')
            ->value('total');

        return round((float) $total, 2);
    }

    /**
     * 5. Beban Operasional Umum
     *
     * General overhead and institutional administrative expenses (5300 series).
     * Calculation: Net debit (debit - credit) on accounts with report_category = 'Beban Operasional'.
     */
    public function getOperationalExpense(?int $year = null, ?int $accountingPeriodId = null): float
    {
        $total = $this->baseJournalLineQuery($year, $accountingPeriodId)
            ->where('accounts.account_type', '=', 'expense')
            ->where('accounts.report_category', '=', 'Beban Operasional')
            ->selectRaw('COALESCE(SUM(journal_entry_lines.debit - journal_entry_lines.credit), 0) as total')
            ->value('total');

        return round((float) $total, 2);
    }

    /**
     * 6. Total Beban (Nazhir + Operasional)
     *
     * Internal aggregate of all organizational expenses outside direct mauquf alaih distributions.
     * Note: Kept separate internally to support policy-dependent presentation.
     */
    public function getTotalExpense(?int $year = null, ?int $accountingPeriodId = null): float
    {
        $nazhir = $this->getNazhirExpense($year, $accountingPeriodId);
        $operational = $this->getOperationalExpense($year, $accountingPeriodId);

        return round($nazhir + $operational, 2);
    }

    /**
     * 7. Realisasi Bulanan (Monthly Realization)
     *
     * Monthly inflows, outflows, and verified expenses grouped by calendar month.
     * strictly uses transaction_date from posted journal entries.
     * RoWA is explicitly returned as null (formula not established).
     */
    public function getMonthlyRealization(int $year): array
    {
        $monthlyRows = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entry_lines.journal_entry_id', '=', 'journal_entries.id')
            ->join('accounts', 'journal_entry_lines.account_id', '=', 'accounts.id')
            ->where('journal_entries.status', '=', 'posted')
            ->whereYear('journal_entries.transaction_date', $year)
            ->selectRaw('
                MONTH(journal_entries.transaction_date) as month_num,
                COALESCE(SUM(CASE WHEN accounts.account_type = "revenue" THEN (journal_entry_lines.credit - journal_entry_lines.debit) ELSE 0 END), 0) as collected,
                COALESCE(SUM(CASE WHEN accounts.account_type = "revenue" AND accounts.report_category = "Penerimaan Wakaf" THEN (journal_entry_lines.credit - journal_entry_lines.debit) ELSE 0 END), 0) as waqf_collected,
                COALESCE(SUM(CASE WHEN accounts.account_type = "expense" AND accounts.report_category = "Penyaluran Manfaat" THEN (journal_entry_lines.debit - journal_entry_lines.credit) ELSE 0 END), 0) as distributed,
                COALESCE(SUM(CASE WHEN accounts.account_type = "expense" AND accounts.report_category = "Beban Nazhir" THEN (journal_entry_lines.debit - journal_entry_lines.credit) ELSE 0 END), 0) as nazhir_expense,
                COALESCE(SUM(CASE WHEN accounts.account_type = "expense" AND accounts.report_category = "Beban Operasional" THEN (journal_entry_lines.debit - journal_entry_lines.credit) ELSE 0 END), 0) as operational_expense
            ')
            ->groupBy(DB::raw('MONTH(journal_entries.transaction_date)'))
            ->get()
            ->keyBy('month_num');

        $result = [];
        for ($m = 1; $m <= 12; $m++) {
            $row = $monthlyRows->get($m);

            $collected = $row ? round((float) $row->collected, 2) : 0.0;
            $waqfCollected = $row ? round((float) $row->waqf_collected, 2) : 0.0;
            $distributed = $row ? round((float) $row->distributed, 2) : 0.0;
            $nazhirExpense = $row ? round((float) $row->nazhir_expense, 2) : 0.0;
            $operationalExpense = $row ? round((float) $row->operational_expense, 2) : 0.0;
            $totalExpense = round($nazhirExpense + $operationalExpense, 2);

            // Monthly YWDP Ratio: (monthly waqf collected / monthly total expense) * 100%
            if ($totalExpense > 0.0) {
                $monthlyYwdpRatio = round(($waqfCollected / $totalExpense) * 100.0, 2);
                $monthlyYwdpRatioStatus = 'available';
            } else {
                $monthlyYwdpRatio = null;
                $monthlyYwdpRatioStatus = 'expense_base_unavailable';
            }

            // Monthly RoWA: monthly_total_waqf_collected / monthly_total_distributed
            if ($distributed > 0.0) {
                $monthlyRowa = round($waqfCollected / $distributed, 4);
                $monthlyRowaStatus = 'available';
            } else {
                $monthlyRowa = null;
                $monthlyRowaStatus = 'distribution_base_unavailable';
            }

            $result[] = [
                'month'                => $m,
                'month_key'            => sprintf('%04d-%02d', $year, $m),
                'collected'            => $collected,
                'waqf_collected'       => $waqfCollected,
                'total_waqf_collected' => $waqfCollected,
                'distributed'          => $distributed,
                'nazhir_expense'       => $nazhirExpense,
                'operational_expense'  => $operationalExpense,
                'expense'              => $totalExpense,
                'total_expense'        => $totalExpense,
                'ywdp_ratio'           => $monthlyYwdpRatio,
                'ywdp_ratio_status'    => $monthlyYwdpRatioStatus,
                'rowa'                 => $monthlyRowa,
                'rowa_status'          => $monthlyRowaStatus,
            ];
        }

        return $result;
    }

    /**
     * 8. Donasi Terverifikasi (Verified Donations Count)
     *
     * Operational transaction count of donations with status 'paid'.
     */
    public function getVerifiedDonationsCount(?int $year = null): int
    {
        $query = Donation::query()->where('status', '=', 'paid');

        if ($year !== null) {
            $query->whereYear(DB::raw('COALESCE(paid_at, created_at)'), $year);
        }

        return (int) $query->count();
    }

    /**
     * 9. Penyaluran Program (Verified Program Distributions Count)
     *
     * Operational count of allocation records backed by an officially posted journal entry.
     */
    public function getProgramDistributionsCount(?int $year = null, ?int $accountingPeriodId = null): int
    {
        $query = Allocation::query()->whereHas('journalEntry', function (Builder $q) use ($year, $accountingPeriodId) {
            $q->where('status', '=', 'posted');

            if ($year !== null) {
                $q->whereYear('transaction_date', $year);
            }

            if ($accountingPeriodId !== null) {
                $q->where('accounting_period_id', $accountingPeriodId);
            }
        });

        return (int) $query->count();
    }

    /**
     * 10. Saldo Siap Disalurkan (Available Distributable Balance)
     *
     * Point-in-time cumulative balance from genesis up to selected cutoff date:
     * Inflows (4200 Hasil Pengelolaan + 4310 Infaq Terikat + 4130 Wakaf Melalui Uang)
     * - Realized Distributions (5100 series / report_category Penyaluran Manfaat)
     * - Committed Distribution Liabilities (2120 Hutang Penyaluran Manfaat Wakaf)
     *
     * Invariant: Does NOT reset on January 1st. Does NOT apply Math.max(0, ...).
     */
    public function getAvailableBalance(?int $year = null, ?int $accountingPeriodId = null): array
    {
        if ($year !== null) {
            $cutoff = ($year === (int) date('Y'))
                ? min(now()->toDateString(), "{$year}-12-31")
                : "{$year}-12-31";
        } else {
            $cutoff = now()->toDateString();
        }

        // 1. Distributable Recognized Inflows (Credit - Debit):
        // 4200 series (Hasil Pengelolaan), 4310 (Infaq Terikat), 4130 (Wakaf Melalui Uang)
        $inflows = (float) $this->baseCumulativeJournalLineQuery($cutoff)
            ->where('accounts.account_type', '=', 'revenue')
            ->where(function (Builder $q) {
                $q->where('accounts.report_category', '=', 'Hasil Pengelolaan')
                  ->orWhere('accounts.code', '=', '4310')
                  ->orWhere('accounts.code', '=', '4130');
            })
            ->selectRaw('COALESCE(SUM(journal_entry_lines.credit - journal_entry_lines.debit), 0) as total')
            ->value('total');

        // 2. Realized Distributions (Debit - Credit):
        // 5100 series (report_category = 'Penyaluran Manfaat')
        $distributions = (float) $this->baseCumulativeJournalLineQuery($cutoff)
            ->where('accounts.account_type', '=', 'expense')
            ->where('accounts.report_category', '=', 'Penyaluran Manfaat')
            ->selectRaw('COALESCE(SUM(journal_entry_lines.debit - journal_entry_lines.credit), 0) as total')
            ->value('total');

        // 3. Outstanding Committed Distribution Liabilities (Credit - Debit):
        // Account 2120 (Hutang Penyaluran Manfaat Wakaf)
        $liability2120 = (float) $this->baseCumulativeJournalLineQuery($cutoff)
            ->where('accounts.account_type', '=', 'liability')
            ->where(function (Builder $q) {
                $q->where('accounts.code', '=', '2120')
                  ->orWhere('accounts.code', 'like', '2120%');
            })
            ->selectRaw('COALESCE(SUM(journal_entry_lines.credit - journal_entry_lines.debit), 0) as total')
            ->value('total');

        $balance = round($inflows - $distributions - $liability2120, 2);

        return [
            'available_balance'        => $balance,
            'available_balance_status' => 'available',
            'distributable_inflows'    => round($inflows, 2),
            'realized_distributions'   => round($distributions, 2),
            'distribution_liabilities' => round($liability2120, 2),
            'cutoff_date'              => $cutoff,
        ];
    }

    /**
     * 11. Rasio RoWA
     *
     * Canonical Public Metric:
     * Rasio RoWA = Total Wakaf Terhimpun / Total Penyaluran
     *
     * Invariants:
     * - Multiplier ratio (e.g. 1.91, 2.0). NOT multiplied by 100.
     * - Returns null and 'distribution_base_unavailable' if total_distributed <= 0.
     * - Both numerator and denominator use the exact same period (year or all-time).
     * - Biaya Pengeluaran is NOT part of RoWA formula.
     */
    public function getRoWA(?int $year = null, ?int $accountingPeriodId = null): array
    {
        $waqf = $this->getTotalWaqfCollected($year, $accountingPeriodId);
        $distributed = $this->getTotalDistributed($year, $accountingPeriodId);

        if ($distributed <= 0.0) {
            return [
                'rowa'                        => null,
                'rowa_status'                 => 'distribution_base_unavailable',
                'productive_asset_book_value' => null,
            ];
        }

        $rowa = round($waqf / $distributed, 4);

        return [
            'rowa'                        => $rowa,
            'rowa_status'                 => 'available',
            'productive_asset_book_value' => null,
        ];
    }

    /**
     * 12. Rasio Internal YWDP (YWDP Ratio)
     *
     * Internal operational/fundraising ratio defined by YWDP management:
     * (Total Wakaf Terhimpun / Biaya Pengeluaran) * 100%
     *
     * NOTE: This is NOT an industry-standard Return on Waqf Assets (RoWA = Hasil Pengelolaan / Nilai Buku Aset Produktif).
     * It is YWDP's internal ratio measuring fundraising performance against organizational overhead.
     *
     * Invariants:
     * - Numerator and denominator use the exact same period (year or all-time).
     * - Returns null and 'expense_base_unavailable' if total_expense <= 0.
     * - Returned value is in percentage points (e.g., 250.75 means 250.75%).
     */
    public function getYwdpRatio(?int $year = null, ?int $accountingPeriodId = null): array
    {
        $waqf = $this->getTotalWaqfCollected($year, $accountingPeriodId);
        $expense = $this->getTotalExpense($year, $accountingPeriodId);

        if ($expense <= 0.0) {
            return [
                'ywdp_ratio'        => null,
                'ywdp_ratio_status' => 'expense_base_unavailable',
            ];
        }

        $ratio = round(($waqf / $expense) * 100.0, 2);

        return [
            'ywdp_ratio'        => $ratio,
            'ywdp_ratio_status' => 'available',
        ];
    }

    /**
     * 13. Public Presentation Summary DTO
     *
     * Provides aggregated verified metrics strictly from double-entry posted journals
     * and verified asset classifications.
     */
    public function getPublicSummary(?int $year = null, ?int $accountingPeriodId = null): array
    {
        $availableData = $this->getAvailableBalance($year, $accountingPeriodId);
        $rowaData = $this->getRoWA($year, $accountingPeriodId);
        $ywdpData = $this->getYwdpRatio($year, $accountingPeriodId);

        return [
            'summary' => [
                'total_collected'             => $this->getTotalCollected($year, $accountingPeriodId),
                'total_waqf_collected'        => $this->getTotalWaqfCollected($year, $accountingPeriodId),
                'total_distributed'           => $this->getTotalDistributed($year, $accountingPeriodId),
                'verified_donations'          => $this->getVerifiedDonationsCount($year),
                'program_distributions'       => $this->getProgramDistributionsCount($year, $accountingPeriodId),
                'nazhir_expense'              => $this->getNazhirExpense($year, $accountingPeriodId),
                'operational_expense'         => $this->getOperationalExpense($year, $accountingPeriodId),
                'total_expense'               => $this->getTotalExpense($year, $accountingPeriodId),
                'available_balance'           => $availableData['available_balance'],
                'available_balance_status'    => $availableData['available_balance_status'],
                'ywdp_ratio'                  => $ywdpData['ywdp_ratio'],
                'ywdp_ratio_status'           => $ywdpData['ywdp_ratio_status'],
                'rowa'                        => $rowaData['rowa'],
                'rowa_status'                 => $rowaData['rowa_status'],
                'productive_asset_book_value' => $rowaData['productive_asset_book_value'],
            ],
            'monthly' => $year !== null ? $this->getMonthlyRealization($year) : [],
        ];
    }
}
