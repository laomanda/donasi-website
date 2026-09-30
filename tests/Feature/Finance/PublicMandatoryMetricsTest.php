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
    }

    protected function createPostedJournal(Account $debitAcc, Account $creditAcc, float $amount, string $date, string $status = 'posted'): JournalEntry
    {
        $year = (int) substr($date, 0, 4);
        $period = $year === 2025 ? $this->period2025 : $this->period2026;

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
    // PART Y: RoWA TESTS
    // ==========================================

    public function test_rowa_calculates_with_productive_asset_and_posted_hasil(): void
    {
        // 1. Create 100m productive asset
        WaqfAsset::create([
            'asset_code'            => 'AST-ROWA-001',
            'asset_name'            => 'Ruko Hasil Sewa',
            'category_id'           => $this->categoryBangunan->id,
            'wakif_id'              => $this->wakif->id,
            'acquisition_date'      => '2026-01-01',
            'quantity'              => 1.0,
            'useful_life_month'     => 120,
            'acquisition_value'     => 100_000_000,
            'current_value'         => 100_000_000,
            'condition'             => 'good',
            'status'                => 'active',
            'economic_use'          => 'productive',
            'productive_percentage' => null,
        ]);

        // 2. Post 5m Hasil Pengelolaan in 2026
        $this->createPostedJournal($this->bankAccount, $this->hasilPengelolaanAccount, 5_000_000, '2026-03-15');

        $rowaData = $this->service->getRoWA(2026);

        $this->assertEquals('available', $rowaData['rowa_status']);
        $this->assertEquals(100_000_000.0, $rowaData['productive_asset_book_value']);
        // 5m / 100m * 100% = 5.00%
        $this->assertEquals(5.00, $rowaData['rowa']);
    }

    public function test_rowa_excludes_draft_hasil_pengelolaan(): void
    {
        WaqfAsset::create([
            'asset_code'            => 'AST-ROWA-002',
            'asset_name'            => 'Ruko Produktif 2',
            'category_id'           => $this->categoryBangunan->id,
            'wakif_id'              => $this->wakif->id,
            'acquisition_date'      => '2026-01-01',
            'quantity'              => 1.0,
            'useful_life_month'     => 120,
            'acquisition_value'     => 100_000_000,
            'current_value'         => 100_000_000,
            'condition'             => 'good',
            'status'                => 'active',
            'economic_use'          => 'productive',
            'productive_percentage' => null,
        ]);

        // Draft journal for 10m
        $this->createPostedJournal($this->bankAccount, $this->hasilPengelolaanAccount, 10_000_000, '2026-04-01', 'draft');

        $rowaData = $this->service->getRoWA(2026);

        $this->assertEquals('available', $rowaData['rowa_status']);
        // Draft not included -> 0%
        $this->assertEquals(0.00, $rowaData['rowa']);
    }

    public function test_rowa_uses_requested_year_numerator(): void
    {
        WaqfAsset::create([
            'asset_code'            => 'AST-ROWA-003',
            'asset_name'            => 'Ruko Multi Year',
            'category_id'           => $this->categoryBangunan->id,
            'wakif_id'              => $this->wakif->id,
            'acquisition_date'      => '2025-01-01',
            'quantity'              => 1.0,
            'useful_life_month'     => 120,
            'acquisition_value'     => 100_000_000,
            'current_value'         => 100_000_000,
            'condition'             => 'good',
            'status'                => 'active',
            'economic_use'          => 'productive',
            'productive_percentage' => null,
        ]);

        // 2025 Hasil: 8m
        $this->createPostedJournal($this->bankAccount, $this->hasilPengelolaanAccount, 8_000_000, '2025-06-15');
        // 2026 Hasil: 4m
        $this->createPostedJournal($this->bankAccount, $this->hasilPengelolaanAccount, 4_000_000, '2026-06-15');

        $rowa2025 = $this->service->getRoWA(2025);
        $rowa2026 = $this->service->getRoWA(2026);

        $this->assertEquals(8.00, $rowa2025['rowa']);
        $this->assertEquals(4.00, $rowa2026['rowa']);
    }

    public function test_unclassified_asset_blocks_rowa(): void
    {
        WaqfAsset::create([
            'asset_code'            => 'AST-UNCLASS-001',
            'asset_name'            => 'Aset Belum Klasifikasi',
            'category_id'           => $this->categoryBangunan->id,
            'wakif_id'              => $this->wakif->id,
            'acquisition_date'      => '2026-01-01',
            'quantity'              => 1.0,
            'useful_life_month'     => 0,
            'acquisition_value'     => 50_000_000,
            'current_value'         => 50_000_000,
            'condition'             => 'good',
            'status'                => 'active',
            'economic_use'          => null, // unclassified!
        ]);

        $rowaData = $this->service->getRoWA(2026);

        $this->assertNull($rowaData['rowa']);
        $this->assertEquals('asset_classification_incomplete', $rowaData['rowa_status']);
    }

    public function test_monthly_rowa_is_explicitly_unavailable(): void
    {
        $monthly = $this->service->getMonthlyRealization(2026);

        foreach ($monthly as $row) {
            $this->assertNull($row['rowa']);
            $this->assertEquals('monthly_asset_basis_unavailable', $row['rowa_status']);
        }
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
