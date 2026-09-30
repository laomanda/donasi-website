<?php

namespace Tests\Feature\Finance;

use App\Models\AccountingPeriod;
use App\Models\AssetDepreciation;
use App\Models\Wakif;
use App\Models\WaqfAsset;
use App\Models\WaqfAssetCategory;
use App\Services\WaqfAssetReportService;
use Database\Seeders\AccountingPeriodSeeder;
use Database\Seeders\WaqfAssetCategorySeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class WaqfAssetClassificationTest extends TestCase
{
    use DatabaseTransactions;

    protected WaqfAssetReportService $reportService;
    protected WaqfAssetCategory $categoryTanah;
    protected WaqfAssetCategory $categoryBangunan;
    protected Wakif $wakif;
    protected AccountingPeriod $period2025;
    protected AccountingPeriod $period2026;

    protected function setUp(): void
    {
        parent::setUp();

        $this->reportService = app(WaqfAssetReportService::class);

        if (WaqfAssetCategory::count() === 0) {
            $this->seed(WaqfAssetCategorySeeder::class);
        }
        if (AccountingPeriod::count() === 0) {
            $this->seed(AccountingPeriodSeeder::class);
        }

        $this->categoryTanah = WaqfAssetCategory::firstOrCreate(
            ['name' => 'Tanah'],
            ['description' => 'Aset wakaf tanah']
        );

        $this->categoryBangunan = WaqfAssetCategory::firstOrCreate(
            ['name' => 'Bangunan'],
            ['description' => 'Aset wakaf bangunan']
        );

        $this->wakif = Wakif::firstOrCreate(
            ['email' => 'wakif.class.test@example.com'],
            ['name' => 'Wakif Test', 'phone' => '0812345678', 'type' => 'individual']
        );

        $this->period2025 = AccountingPeriod::firstOrCreate(
            ['name' => 'Tahun 2025 Test'],
            [
                'start_date' => '2025-01-01',
                'end_date'   => '2025-12-31',
                'status'     => 'closed',
            ]
        );

        $this->period2026 = AccountingPeriod::firstOrCreate(
            ['name' => 'Tahun 2026 Test'],
            [
                'start_date' => '2026-01-01',
                'end_date'   => '2026-12-31',
                'status'     => 'open',
            ]
        );
    }

    /**
     * Test 1: productive asset contributes 100% of book value.
     */
    public function test_productive_asset_contributes_100_percent(): void
    {
        WaqfAsset::create([
            'asset_code'            => 'AST-PROD-001',
            'asset_name'            => 'Ruko Komersial Produktif',
            'category_id'           => $this->categoryBangunan->id,
            'wakif_id'              => $this->wakif->id,
            'acquisition_date'      => '2026-01-10',
            'quantity'              => 1.0,
            'useful_life_month'     => 120,
            'acquisition_value'     => 100_000_000,
            'current_value'         => 100_000_000,
            'condition'             => 'good',
            'status'                => 'active',
            'economic_use'          => 'productive',
            'productive_percentage' => null,
        ]);

        $result = $this->reportService->getProductiveAssetBookValueAsOf('2026-12-31');

        $this->assertTrue($result['is_complete']);
        $this->assertEquals('available', $result['status']);
        $this->assertEquals(100_000_000.0, $result['productive_asset_book_value']);
    }

    /**
     * Test 2: social asset contributes 0% to productive denominator.
     */
    public function test_social_asset_contributes_zero_percent(): void
    {
        WaqfAsset::create([
            'asset_code'            => 'AST-SOC-001',
            'asset_name'            => 'Masjid Jami Sosial',
            'category_id'           => $this->categoryBangunan->id,
            'wakif_id'              => $this->wakif->id,
            'acquisition_date'      => '2026-01-10',
            'quantity'              => 1.0,
            'useful_life_month'     => 0,
            'acquisition_value'     => 500_000_000,
            'current_value'         => 500_000_000,
            'condition'             => 'good',
            'status'                => 'active',
            'economic_use'          => 'social',
            'productive_percentage' => null,
        ]);

        $result = $this->reportService->getProductiveAssetBookValueAsOf('2026-12-31');

        $this->assertTrue($result['is_complete']);
        // Because only social asset exists, productive book value is 0 -> productive_asset_base_unavailable
        $this->assertEquals('productive_asset_base_unavailable', $result['status']);
        $this->assertEquals(0.0, $result['productive_asset_book_value']);
    }

    /**
     * Test 3: mixed asset contributes exactly according to productive_percentage.
     */
    public function test_mixed_asset_contributes_proportional_percentage(): void
    {
        WaqfAsset::create([
            'asset_code'            => 'AST-MIX-001',
            'asset_name'            => 'Gedung Dakwah & Kios Sewa',
            'category_id'           => $this->categoryBangunan->id,
            'wakif_id'              => $this->wakif->id,
            'acquisition_date'      => '2026-01-10',
            'quantity'              => 1.0,
            'useful_life_month'     => 120,
            'acquisition_value'     => 200_000_000,
            'current_value'         => 200_000_000,
            'condition'             => 'good',
            'status'                => 'active',
            'economic_use'          => 'mixed',
            'productive_percentage' => 35.00,
        ]);

        $result = $this->reportService->getProductiveAssetBookValueAsOf('2026-12-31');

        $this->assertTrue($result['is_complete']);
        $this->assertEquals('available', $result['status']);
        // 200m * 35% = 70m
        $this->assertEquals(70_000_000.0, $result['productive_asset_book_value']);
    }

    /**
     * Test 4: mixed asset requires percentage between 0.01 and 99.99.
     */
    public function test_mixed_asset_requires_valid_percentage(): void
    {
        // Invalid: 0%
        $data0 = ['economic_use' => 'mixed', 'productive_percentage' => 0];
        $val0 = Validator::make($data0, WaqfAsset::validationRules($data0));
        $this->assertTrue($val0->fails());

        // Invalid: 100%
        $data100 = ['economic_use' => 'mixed', 'productive_percentage' => 100];
        $val100 = Validator::make($data100, WaqfAsset::validationRules($data100));
        $this->assertTrue($val100->fails());

        // Valid: 50.00%
        $dataValid = ['economic_use' => 'mixed', 'productive_percentage' => 50.00];
        $valValid = Validator::make($dataValid, WaqfAsset::validationRules($dataValid));
        $this->assertFalse($valValid->fails());
    }

    /**
     * Test 5: unclassified legacy asset blocks calculation.
     */
    public function test_unclassified_legacy_asset_blocks_calculation(): void
    {
        WaqfAsset::create([
            'asset_code'            => 'AST-LEG-001',
            'asset_name'            => 'Aset Warisan Belum Diklasifikasi',
            'category_id'           => $this->categoryTanah->id,
            'wakif_id'              => $this->wakif->id,
            'acquisition_date'      => '2026-01-01',
            'quantity'              => 1.0,
            'useful_life_month'     => 0,
            'acquisition_value'     => 50_000_000,
            'current_value'         => 50_000_000,
            'condition'             => 'good',
            'status'                => 'active',
            'economic_use'          => null, // unclassified
            'productive_percentage' => null,
        ]);

        $result = $this->reportService->getProductiveAssetBookValueAsOf('2026-12-31');

        $this->assertFalse($result['is_complete']);
        $this->assertEquals('asset_classification_incomplete', $result['status']);
        $this->assertNull($result['productive_asset_book_value']);
        $this->assertGreaterThanOrEqual(1, $result['unclassified_count']);
    }

    /**
     * Test 6: zero productive asset base returns null, not 0%.
     */
    public function test_zero_productive_asset_base_returns_unavailable(): void
    {
        // Only social asset exists
        WaqfAsset::create([
            'asset_code'            => 'AST-SOC-002',
            'asset_name'            => 'Tanah Kuburan Sosial',
            'category_id'           => $this->categoryTanah->id,
            'wakif_id'              => $this->wakif->id,
            'acquisition_date'      => '2026-01-01',
            'quantity'              => 1.0,
            'useful_life_month'     => 0,
            'acquisition_value'     => 80_000_000,
            'current_value'         => 80_000_000,
            'condition'             => 'good',
            'status'                => 'active',
            'economic_use'          => 'social',
            'productive_percentage' => null,
        ]);

        $result = $this->reportService->getProductiveAssetBookValueAsOf('2026-12-31');

        $this->assertTrue($result['is_complete']);
        $this->assertEquals('productive_asset_base_unavailable', $result['status']);
        $this->assertEquals(0.0, $result['productive_asset_book_value']);
    }

    /**
     * Test 7: depreciation reduces denominator according to existing asset accounting.
     */
    public function test_depreciation_reduces_book_value_denominator(): void
    {
        $asset = WaqfAsset::create([
            'asset_code'            => 'AST-DEP-001',
            'asset_name'            => 'Mesin Pabrik Produktif',
            'category_id'           => $this->categoryBangunan->id,
            'wakif_id'              => $this->wakif->id,
            'acquisition_date'      => '2025-01-01',
            'quantity'              => 1.0,
            'useful_life_month'     => 60,
            'acquisition_value'     => 100_000_000,
            'current_value'         => 80_000_000,
            'condition'             => 'good',
            'status'                => 'active',
            'economic_use'          => 'productive',
            'productive_percentage' => null,
        ]);

        AssetDepreciation::create([
            'asset_id'                 => $asset->id,
            'period_id'                => $this->period2025->id,
            'depreciation_expense'     => 20_000_000,
            'accumulated_depreciation' => 20_000_000,
            'book_value'               => 80_000_000,
        ]);

        // As of 2025-12-31, book value should be 80m (100m - 20m)
        $result = $this->reportService->getProductiveAssetBookValueAsOf('2025-12-31');

        $this->assertTrue($result['is_complete']);
        $this->assertEquals(80_000_000.0, $result['productive_asset_book_value']);
    }

    /**
     * Test 8: asset acquired after cutoff is excluded.
     */
    public function test_asset_acquired_after_cutoff_is_excluded(): void
    {
        WaqfAsset::create([
            'asset_code'            => 'AST-FUTURE-001',
            'asset_name'            => 'Aset Masa Depan',
            'category_id'           => $this->categoryTanah->id,
            'wakif_id'              => $this->wakif->id,
            'acquisition_date'      => '2027-01-15', // Acquired in 2027
            'quantity'              => 1.0,
            'useful_life_month'     => 0,
            'acquisition_value'     => 500_000_000,
            'current_value'         => 500_000_000,
            'condition'             => 'good',
            'status'                => 'active',
            'economic_use'          => 'productive',
            'productive_percentage' => null,
        ]);

        // Cutoff as of 2026-12-31 must not include 2027 acquisition
        $result = $this->reportService->getProductiveAssetBookValueAsOf('2026-12-31');

        $this->assertEquals(0.0, $result['productive_asset_book_value']);
        $this->assertEquals('productive_asset_base_unavailable', $result['status']);
    }
}
