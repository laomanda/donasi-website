<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Allocation;
use App\Models\Donation;
use App\Models\JournalEntryLine;
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

            $result[] = [
                'month'               => $m,
                'month_key'           => sprintf('%04d-%02d', $year, $m),
                'collected'           => $collected,
                'waqf_collected'      => $waqfCollected,
                'distributed'         => $distributed,
                'nazhir_expense'      => $nazhirExpense,
                'operational_expense' => $operationalExpense,
                'total_expense'       => $totalExpense,
                'rowa'                => null,
                'rowa_status'         => 'formula_not_defined',
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
     * 10. Public Presentation Summary DTO
     *
     * Provides aggregated verified metrics while explicitly holding undefined policies as null.
     */
    public function getPublicSummary(?int $year = null, ?int $accountingPeriodId = null): array
    {
        return [
            'summary' => [
                'total_collected'          => $this->getTotalCollected($year, $accountingPeriodId),
                'total_waqf_collected'     => $this->getTotalWaqfCollected($year, $accountingPeriodId),
                'total_distributed'        => $this->getTotalDistributed($year, $accountingPeriodId),
                'verified_donations'       => $this->getVerifiedDonationsCount($year),
                'program_distributions'    => $this->getProgramDistributionsCount($year, $accountingPeriodId),
                'nazhir_expense'           => $this->getNazhirExpense($year, $accountingPeriodId),
                'operational_expense'      => $this->getOperationalExpense($year, $accountingPeriodId),
                'total_expense'            => $this->getTotalExpense($year, $accountingPeriodId),
                'available_balance'        => null,
                'available_balance_status' => 'definition_required',
                'rowa'                     => null,
                'rowa_status'              => 'formula_not_defined',
            ],
            'monthly' => $year !== null ? $this->getMonthlyRealization($year) : [],
        ];
    }
}
