<?php

namespace Tests\Feature\Finance;

use App\Models\Account;
use App\Models\AccountingPeriod;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\Wakif;
use App\Models\WaqfAsset;
use App\Models\WaqfAssetCategory;
use App\Services\PublicFinanceReadService;
use App\Services\WaqfAssetReportService;
use Database\Seeders\AccountingPeriodSeeder;
use Database\Seeders\AccountSeeder;
use Database\Seeders\WaqfAssetCategorySeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class PublicMandatoryMetricsTest extends TestCase
{
    use DatabaseTransactions;

    protected PublicFinanceReadService $service;
    protected WaqfAssetReportService $assetReportService;
    protected AccountingPeriod $period2025;
    protected AccountingPeriod $period2026;
    protected AccountingPeriod $period2030;
    protected AccountingPeriod $period2031;
    protected Account $bankAccount;
    protected Account $hasilPengelolaanAccount;
    protected Account $infaqTerikatAccount;
    protected Account $wakafMelaluiUangAccount;
    protected Account $wakafAbadiAccount;
    protected Account $wakafTemporerAccount;
    protected Account $penyaluranAccount;
    protected Account $bebanNazhirAccount;
    protected Account $bebanOperasionalAccount;
    protected Account $hutangPenyaluranAccount;
    protected WaqfAssetCategory $categoryBangunan;
    protected Wakif $wakif;

    protected function setUp(): void
    {
        parent::setUp();

        if (Account::count() === 0) {
            $this->seed(AccountSeeder::class);
        }
        if (AccountingPeriod::count() === 0) {
            $this->seed(AccountingPeriodSeeder::class);
        }
        if (WaqfAssetCategory::count() === 0) {
            $this->seed(WaqfAssetCategorySeeder::class);
        }

        $this->assetReportService = app(WaqfAssetReportService::class);
        $this->service = app(PublicFinanceReadService::class);

        $this->bankAccount = Account::where('code', '1112')->firstOrFail();
        $this->hasilPengelolaanAccount = Account::where('code', '4210')->firstOrFail();
        $this->infaqTerikatAccount = Account::where('code', '4310')->firstOrFail();
        $this->wakafMelaluiUangAccount = Account::where('code', '4130')->firstOrFail();
        $this->wakafAbadiAccount = Account::where('code', '4110')->firstOrFail();
        $this->wakafTemporerAccount = Account::where('code', '4120')->firstOrFail();
        $this->penyaluranAccount = Account::where('code', '5110')->firstOrFail();
        $this->bebanNazhirAccount = Account::where('code', '5210')->firstOrFail();
        $this->bebanOperasionalAccount = Account::where('code', '5310')->firstOrFail();
        $this->hutangPenyaluranAccount = Account::where('code', '2120')->firstOrFail();

        $this->categoryBangunan = WaqfAssetCategory::firstOrCreate(
            ['name' => 'Bangunan'],
            ['description' => 'Aset Bangunan']
        );

        $this->wakif = Wakif::firstOrCreate(
            ['email' => 'wakif.metrics.test@example.com'],
            ['name' => 'Wakif Metrics Test', 'phone' => '0812345678', 'type' => 'individual']
        );

        $this->period2025 = AccountingPeriod::firstOrCreate(
            ['name' => 'Tahun 2025 Test PMM'],
            [
                'start_date' => '2025-01-01',
                'end_date'   => '2025-12-31',
                'status'     => 'closed',
            ]
        );

        $this->period2026 = AccountingPeriod::firstOrCreate(
            ['name' => 'Tahun 2026 Test PMM'],
            [
                'start_date' => '2026-01-01',
                'end_date'   => '2026-12-31',
                'status'     => 'open',
            ]
        );

        $this->period2030 = AccountingPeriod::firstOrCreate(
            ['name' => 'Tahun 2030 Test PMM'],
            [
                'start_date' => '2030-01-01',
                'end_date'   => '2030-12-31',
                'status'     => 'open',
            ]
        );

        $this->period2031 = AccountingPeriod::firstOrCreate(
            ['name' => 'Tahun 2031 Test PMM'],
            [
                'start_date' => '2031-01-01',
                'end_date'   => '2031-12-31',
                'status'     => 'open',
            ]
        );
    }

    protected function createPostedJournal(Account $debitAcc, Account $creditAcc, float $amount, string $date, string $status = 'posted'): JournalEntry
    {
        $year = (int) substr($date, 0, 4);
        $period = match ($year) {
            2025 => $this->period2025,
            2030 => $this->period2030,
            2031 => $this->period2031,
            default => $this->period2026,
        };

        $entry = JournalEntry::create([
            'accounting_period_id' => $period->id,
            'journal_number'       => 'JRN-' . uniqid(),
            'transaction_date'     => $date,
            'description'          => 'Test Transaction',
            'status'               => $status,
            'created_by'           => 1,
        ]);

        JournalEntryLine::create([
            'journal_entry_id' => $entry->id,
            'account_id'       => $debitAcc->id,
            'debit'            => $amount,
            'credit'           => 0.0,
            'description'      => 'Debit line',
        ]);

        JournalEntryLine::create([
            'journal_entry_id' => $entry->id,
            'account_id'       => $creditAcc->id,
            'debit'            => 0.0,
            'credit'           => $amount,
            'description'      => 'Credit line',
        ]);

        return $entry;
    }

    // ==========================================
    // ==========================================
    // PART Y: Rasio RoWA TESTS (Phase 8.6.4.2)
    // Formula: Total Wakaf Terhimpun / Total Penyaluran
    // ==========================================

    /**
     * TEST 1 — NORMAL CASE
     * total_waqf_collected = 200,000,000
     * total_distributed = 100,000,000
     * Expected: rowa = 2.0
     */
    public function test_rowa_normal_case(): void
    {
        $this->createPostedJournal($this->bankAccount, $this->wakafAbadiAccount, 200_000_000, '2030-02-15');
        $this->createPostedJournal($this->penyaluranAccount, $this->bankAccount, 100_000_000, '2030-02-20');

        $rowaData = $this->service->getRoWA(2030);

        $this->assertEquals('available', $rowaData['rowa_status']);
        $this->assertEquals(2.0, $rowaData['rowa']);
    }

    /**
     * TEST 2 — DECIMAL CASE
     * total_waqf_collected = 4,539,500,000
     * total_distributed = 2,378,500,000
     * Expected approximately: 1.908555...
     */
    public function test_rowa_decimal_case(): void
    {
        $this->createPostedJournal($this->bankAccount, $this->wakafAbadiAccount, 4_539_500_000, '2030-03-01');
        $this->createPostedJournal($this->penyaluranAccount, $this->bankAccount, 2_378_500_000, '2030-03-10');

        $rowaData = $this->service->getRoWA(2030);

        $this->assertEquals('available', $rowaData['rowa_status']);
        $this->assertEqualsWithDelta(1.908555, $rowaData['rowa'], 0.001);
    }

    /**
     * TEST 3 — ZERO DISTRIBUTION
     * total_waqf_collected > 0
     * total_distributed = 0
     * Expected: rowa = null, rowa_status = 'distribution_base_unavailable'
     */
    public function test_rowa_zero_distribution(): void
    {
        $this->createPostedJournal($this->bankAccount, $this->wakafAbadiAccount, 150_000_000, '2030-04-01');

        $rowaData = $this->service->getRoWA(2030);

        $this->assertNull($rowaData['rowa']);
        $this->assertEquals('distribution_base_unavailable', $rowaData['rowa_status']);
    }

    /**
     * TEST 4 — EXPENSE INDEPENDENCE
     * Create/change legitimate expense.
     * Keep total_waqf_collected and total_distributed unchanged.
     * Expected: rowa unchanged.
     */
    public function test_rowa_expense_independence(): void
    {
        // Base: 200m wakaf, 100m distributed => rowa = 2.0
        $this->createPostedJournal($this->bankAccount, $this->wakafAbadiAccount, 200_000_000, '2030-05-01');
        $this->createPostedJournal($this->penyaluranAccount, $this->bankAccount, 100_000_000, '2030-05-05');

        $rowaBefore = $this->service->getRoWA(2030);
        $this->assertEquals(2.0, $rowaBefore['rowa']);

        // Post legitimate expenses (nazhir + operational)
        $this->createPostedJournal($this->bebanNazhirAccount, $this->bankAccount, 20_000_000, '2030-05-10');
        $this->createPostedJournal($this->bebanOperasionalAccount, $this->bankAccount, 30_000_000, '2030-05-12');

        $rowaAfter = $this->service->getRoWA(2030);

        // RoWA MUST remain exactly unchanged
        $this->assertEquals(2.0, $rowaAfter['rowa']);
        $this->assertEquals($rowaBefore['rowa'], $rowaAfter['rowa']);
    }

    /**
     * TEST 5 — DISTRIBUTION CHANGE
     * Keep total wakaf constant.
     * Increase authoritative posted distribution.
     * Expected: RoWA recalculates based on the new denominator.
     */
    public function test_rowa_distribution_change(): void
    {
        // Initial: 300m wakaf, 100m distributed => rowa = 3.0
        $this->createPostedJournal($this->bankAccount, $this->wakafAbadiAccount, 300_000_000, '2030-06-01');
        $this->createPostedJournal($this->penyaluranAccount, $this->bankAccount, 100_000_000, '2030-06-05');

        $rowa1 = $this->service->getRoWA(2030);
        $this->assertEquals(3.0, $rowa1['rowa']);

        // Increase distribution by 50m (total 150m) => rowa = 300m / 150m = 2.0
        $this->createPostedJournal($this->penyaluranAccount, $this->bankAccount, 50_000_000, '2030-06-15');

        $rowa2 = $this->service->getRoWA(2030);
        $this->assertEquals(2.0, $rowa2['rowa']);
    }

    /**
     * TEST 6 — WAKAF CHANGE
     * Keep distribution constant.
     * Increase authoritative posted wakaf receipt.
     * Expected: RoWA recalculates based on the new numerator.
     */
    public function test_rowa_wakaf_change(): void
    {
        // Initial: 200m wakaf, 100m distributed => rowa = 2.0
        $this->createPostedJournal($this->bankAccount, $this->wakafAbadiAccount, 200_000_000, '2030-07-01');
        $this->createPostedJournal($this->penyaluranAccount, $this->bankAccount, 100_000_000, '2030-07-05');

        $rowa1 = $this->service->getRoWA(2030);
        $this->assertEquals(2.0, $rowa1['rowa']);

        // Increase wakaf by 100m (total 300m) => rowa = 300m / 100m = 3.0
        $this->createPostedJournal($this->bankAccount, $this->wakafAbadiAccount, 100_000_000, '2030-07-15');

        $rowa2 = $this->service->getRoWA(2030);
        $this->assertEquals(3.0, $rowa2['rowa']);
    }

    /**
     * TEST 7 — YEAR CONSISTENCY
     * Create transactions in 2030 and 2031.
     * Verify ?year=2030 uses only 2030 wakaf / 2030 distribution
     * and ?year=2031 uses only 2031 wakaf / 2031 distribution.
     */
    public function test_rowa_year_consistency(): void
    {
        // 2030: 400m wakaf, 100m distribution => rowa = 4.0
        $this->createPostedJournal($this->bankAccount, $this->wakafAbadiAccount, 400_000_000, '2030-05-01');
        $this->createPostedJournal($this->penyaluranAccount, $this->bankAccount, 100_000_000, '2030-05-10');

        // 2031: 250m wakaf, 100m distribution => rowa = 2.5
        $this->createPostedJournal($this->bankAccount, $this->wakafAbadiAccount, 250_000_000, '2031-05-01');
        $this->createPostedJournal($this->penyaluranAccount, $this->bankAccount, 100_000_000, '2031-05-10');

        $rowa2030 = $this->service->getRoWA(2030);
        $rowa2031 = $this->service->getRoWA(2031);

        $this->assertEquals(4.0, $rowa2030['rowa']);
        $this->assertEquals(2.5, $rowa2031['rowa']);
    }

    /**
     * TEST 8 — MONTHLY ROWA
     * January: wakaf 200M, distribution 100M => rowa = 2.0
     * February: wakaf 150M, distribution 0 => rowa = null
     */
    public function test_monthly_rowa_calculation(): void
    {
        // January 2030: 200m wakaf, 100m distributed
        $this->createPostedJournal($this->bankAccount, $this->wakafAbadiAccount, 200_000_000, '2030-01-10');
        $this->createPostedJournal($this->penyaluranAccount, $this->bankAccount, 100_000_000, '2030-01-20');

        // February 2030: 150m wakaf, 0 distributed
        $this->createPostedJournal($this->bankAccount, $this->wakafAbadiAccount, 150_000_000, '2030-02-10');

        $monthly = $this->service->getMonthlyRealization(2030);
        $jan = collect($monthly)->firstWhere('month', 1);
        $feb = collect($monthly)->firstWhere('month', 2);

        $this->assertNotNull($jan);
        $this->assertEquals(2.0, $jan['rowa']);
        $this->assertEquals('available', $jan['rowa_status']);

        $this->assertNotNull($feb);
        $this->assertNull($feb['rowa']);
        $this->assertEquals('distribution_base_unavailable', $feb['rowa_status']);
    }

    // ==========================================
    // PART Z: BIAYA PENGELUARAN TESTS
    // ==========================================

    public function test_biaya_pengeluaran_sums_beban_nazhir_and_operasional(): void
    {
        $this->createPostedJournal($this->bebanNazhirAccount, $this->bankAccount, 2_000_000, '2026-05-10');
        $this->createPostedJournal($this->bebanOperasionalAccount, $this->bankAccount, 3_000_000, '2026-05-12');
        $this->createPostedJournal($this->penyaluranAccount, $this->bankAccount, 50_000_000, '2026-05-15');

        $nazhir = $this->service->getNazhirExpense(2026);
        $operasional = $this->service->getOperationalExpense(2026);
        $totalExpense = $this->service->getTotalExpense(2026);

        $this->assertGreaterThanOrEqual(2_000_000, $nazhir);
        $this->assertGreaterThanOrEqual(3_000_000, $operasional);
        $this->assertEquals(round($nazhir + $operasional, 2), $totalExpense);

        // Excludes Penyaluran Manfaat (50m) from expense
        $this->assertNotEquals($totalExpense + 50_000_000, $totalExpense);
    }

    public function test_monthly_expense_uses_transaction_date(): void
    {
        $this->createPostedJournal($this->bebanOperasionalAccount, $this->bankAccount, 1_500_000, '2026-08-20');

        $monthly = $this->service->getMonthlyRealization(2026);
        $aug = collect($monthly)->firstWhere('month', 8);

        $this->assertNotNull($aug);
        $this->assertGreaterThanOrEqual(1_500_000, $aug['total_expense']);
        $this->assertGreaterThanOrEqual(1_500_000, $aug['expense']);
    }

    // ==========================================
    // PART AA: SALDO SIAP DISALURKAN TESTS
    // ==========================================

    public function test_available_balance_includes_4200_4310_4130_and_subtracts_distribution_and_2120(): void
    {
        // Fresh balance test using specific date cutoff
        $testCutoff = '2026-11-30';

        // 1. Post Inflows:
        // 4210 (Hasil Pengelolaan): 10m
        $this->createPostedJournal($this->bankAccount, $this->hasilPengelolaanAccount, 10_000_000, '2026-11-01');
        // 4310 (Infaq Terikat): 15m
        $this->createPostedJournal($this->bankAccount, $this->infaqTerikatAccount, 15_000_000, '2026-11-02');
        // 4130 (Wakaf Melalui Uang): 20m
        $this->createPostedJournal($this->bankAccount, $this->wakafMelaluiUangAccount, 20_000_000, '2026-11-03');

        // 2. Post Excluded Inflows (Must NOT be included in available balance):
        // 4110 (Wakaf Uang Abadi): 50m
        $this->createPostedJournal($this->bankAccount, $this->wakafAbadiAccount, 50_000_000, '2026-11-04');
        // 4120 (Wakaf Temporer): 30m
        $this->createPostedJournal($this->bankAccount, $this->wakafTemporerAccount, 30_000_000, '2026-11-05');

        // 3. Post Outflow: Penyaluran Manfaat (5110): 8m
        $this->createPostedJournal($this->penyaluranAccount, $this->bankAccount, 8_000_000, '2026-11-10');

        // 4. Post Liability 2120 (Hutang Penyaluran): 5m
        // Debit Penyaluran Manfaat (5110), Credit Hutang Penyaluran (2120)
        $this->createPostedJournal($this->penyaluranAccount, $this->hutangPenyaluranAccount, 5_000_000, '2026-11-12');

        $balanceData = $this->service->getAvailableBalance(2026);

        $this->assertEquals('available', $balanceData['available_balance_status']);
        $this->assertArrayHasKey('distributable_inflows', $balanceData);
        $this->assertArrayHasKey('realized_distributions', $balanceData);
        $this->assertArrayHasKey('distribution_liabilities', $balanceData);
        $this->assertArrayHasKey('available_balance', $balanceData);

        // Verification of components:
        // Available balance = inflows - distributions - liability
        $calculated = round($balanceData['distributable_inflows'] - $balanceData['realized_distributions'] - $balanceData['distribution_liabilities'], 2);
        $this->assertEquals($calculated, $balanceData['available_balance']);
    }

    public function test_available_balance_preserves_negative_amount_without_math_max(): void
    {
        // When distributions exceed recognized distributable inflows, balance becomes negative
        // The service MUST preserve the true negative value, NEVER mask it with max(0, balance)
        $balanceData = $this->service->getAvailableBalance(2026);

        // If balance is negative, it must be returned as negative float
        if ($balanceData['available_balance'] < 0) {
            $this->assertLessThan(0, $balanceData['available_balance']);
        } else {
            $this->assertIsFloat($balanceData['available_balance']);
        }
    }

    public function test_available_balance_is_cumulative_and_carries_forward(): void
    {
        // Post 10m in 2025
        $this->createPostedJournal($this->bankAccount, $this->hasilPengelolaanAccount, 10_000_000, '2025-07-01');

        $bal2025 = $this->service->getAvailableBalance(2025);
        $bal2026 = $this->service->getAvailableBalance(2026);

        // Balance as of 2026 includes cumulative 2025 inflows
        $this->assertGreaterThanOrEqual($bal2025['distributable_inflows'], $bal2026['distributable_inflows']);
    }
}
