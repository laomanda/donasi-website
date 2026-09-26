<?php

namespace Tests\Feature\Finance;

use App\Models\AccountingPeriod;
use App\Models\AssetDepreciation;
use App\Models\User;
use App\Models\Wakif;
use App\Models\WaqfAsset;
use App\Models\WaqfAssetCategory;
use App\Models\WaqfAssetSource;
use App\Services\WaqfAssetReportService;
use Database\Seeders\AccountingPeriodSeeder;
use Database\Seeders\WaqfAssetCategorySeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class WaqfAssetReportEngineTest extends TestCase
{
    use DatabaseTransactions;

    protected WaqfAssetReportService $reportService;
    protected User $user;
    protected AccountingPeriod $period;
    protected WaqfAssetCategory $categoryTanah;
    protected WaqfAssetCategory $categoryBangunan;
    protected Wakif $wakif;

    protected function setUp(): void
    {
        parent::setUp();

        $this->reportService = app(WaqfAssetReportService::class);

        // Seed categories and periods if empty
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
            ['email' => 'wakif.test@example.com'],
            [
                'name'    => 'H. Ahmad Dahlan',
                'phone'   => '081234567890',
                'address' => 'Jakarta',
                'type'    => 'individual',
            ]
        );

        $this->period = AccountingPeriod::where('status', 'open')->first() ?? AccountingPeriod::create([
            'name'       => 'Tahun 2026',
            'start_date' => '2026-01-01',
            'end_date'   => '2026-12-31',
            'status'     => 'open',
        ]);

        $this->user = User::first() ?? User::factory()->create();
        if (class_exists(Role::class)) {
            $role = Role::firstOrCreate(['name' => 'superadmin', 'guard_name' => 'web']);
            if (!$this->user->hasRole('superadmin')) {
                $this->user->assignRole($role);
            }
        }
    }

    public function test_asset_register_returns_expected_keys_and_values(): void
    {
        $asset = WaqfAsset::create([
            'asset_code'        => 'AST-TEST-001',
            'asset_name'        => 'Tanah Wakaf Masjid Al-Ikhlas',
            'category_id'       => $this->categoryTanah->id,
            'wakif_id'          => $this->wakif->id,
            'acquisition_date'  => '2026-01-15',
            'quantity'          => 1.00,
            'useful_life_month' => 0,
            'acquisition_value' => 500000000.00,
            'current_value'     => 500000000.00,
            'location'          => 'Jl. Merdeka No. 10',
            'condition'         => 'excellent',
            'status'            => 'active',
        ]);

        WaqfAssetSource::create([
            'asset_id'    => $asset->id,
            'source_type' => 'wakif',
            'amount'      => 500000000.00,
            'description' => 'Wakaf Tanah Langsung dari Wakif',
        ]);

        $register = $this->reportService->getAssetRegister();

        $this->assertIsArray($register);
        $this->assertNotEmpty($register);

        $item = collect($register)->firstWhere('asset_code', 'AST-TEST-001');
        $this->assertNotNull($item);

        // Required keys from specification
        $this->assertArrayHasKey('asset_code', $item);
        $this->assertArrayHasKey('asset_name', $item);
        $this->assertArrayHasKey('category', $item);
        $this->assertArrayHasKey('wakif', $item);
        $this->assertArrayHasKey('acquisition_date', $item);
        $this->assertArrayHasKey('acquisition_value', $item);
        $this->assertArrayHasKey('accumulated_depreciation', $item);
        $this->assertArrayHasKey('book_value', $item);
        $this->assertArrayHasKey('location', $item);
        $this->assertArrayHasKey('condition', $item);
        $this->assertArrayHasKey('status', $item);

        // Value checks
        $this->assertEquals('AST-TEST-001', $item['asset_code']);
        $this->assertEquals('Tanah Wakaf Masjid Al-Ikhlas', $item['asset_name']);
        $this->assertEquals('Tanah', $item['category']);
        $this->assertEquals('H. Ahmad Dahlan', $item['wakif']);
        $this->assertEquals('2026-01-15', $item['acquisition_date']);
        $this->assertEquals(500000000.00, $item['acquisition_value']);
        $this->assertEquals(0.00, $item['accumulated_depreciation']);
        $this->assertEquals(500000000.00, $item['book_value']);
        $this->assertEquals('Jl. Merdeka No. 10', $item['location']);
        $this->assertEquals('excellent', $item['condition']);
        $this->assertEquals('active', $item['status']);
        $this->assertNotEmpty($item['sources']);
    }

    public function test_asset_register_with_depreciation_period(): void
    {
        $asset = WaqfAsset::create([
            'asset_code'        => 'AST-TEST-002',
            'asset_name'        => 'Gedung Klinik Wakaf Sehat',
            'category_id'       => $this->categoryBangunan->id,
            'wakif_id'          => $this->wakif->id,
            'acquisition_date'  => '2025-01-01',
            'quantity'          => 1.00,
            'useful_life_month' => 240,
            'acquisition_value' => 240000000.00,
            'current_value'     => 228000000.00,
            'location'          => 'Jl. Sehat No. 5',
            'condition'         => 'good',
            'status'            => 'active',
        ]);

        AssetDepreciation::create([
            'asset_id'                 => $asset->id,
            'period_id'                => $this->period->id,
            'depreciation_expense'     => 12000000.00,
            'accumulated_depreciation' => 12000000.00,
            'book_value'               => 228000000.00,
        ]);

        $register = $this->reportService->getAssetRegister(null, $this->period->id, null);

        $item = collect($register)->firstWhere('asset_code', 'AST-TEST-002');
        $this->assertNotNull($item);
        $this->assertEquals(12000000.00, $item['accumulated_depreciation']);
        $this->assertEquals(228000000.00, $item['book_value']);
    }

    public function test_asset_register_filters_by_category_and_status(): void
    {
        WaqfAsset::create([
            'asset_code'        => 'AST-CAT-001',
            'asset_name'        => 'Tanah Umat',
            'category_id'       => $this->categoryTanah->id,
            'acquisition_date'  => '2026-02-01',
            'acquisition_value' => 100000000.00,
            'current_value'     => 100000000.00,
            'condition'         => 'good',
            'status'            => 'active',
        ]);

        WaqfAsset::create([
            'asset_code'        => 'AST-CAT-002',
            'asset_name'        => 'Bangunan Rusak Lama',
            'category_id'       => $this->categoryBangunan->id,
            'acquisition_date'  => '2020-01-01',
            'acquisition_value' => 50000000.00,
            'current_value'     => 0.00,
            'condition'         => 'damaged',
            'status'            => 'disposed',
        ]);

        // Filter by category Tanah
        $tanahAssets = $this->reportService->getAssetRegister($this->categoryTanah->id);
        $this->assertTrue(collect($tanahAssets)->every(fn ($a) => $a['category_id'] === $this->categoryTanah->id));

        // Filter by status active
        $activeAssets = $this->reportService->getAssetRegister(null, null, 'active');
        $this->assertTrue(collect($activeAssets)->every(fn ($a) => $a['status'] === 'active'));

        // Filter by status disposed
        $disposedAssets = $this->reportService->getAssetRegister(null, null, 'disposed');
        $this->assertTrue(collect($disposedAssets)->every(fn ($a) => $a['status'] === 'disposed'));
    }

    public function test_summary_and_full_report_generation(): void
    {
        $asset = WaqfAsset::create([
            'asset_code'        => 'AST-SUM-001',
            'asset_name'        => 'Ruko Produktif',
            'category_id'       => $this->categoryBangunan->id,
            'acquisition_date'  => '2026-03-01',
            'acquisition_value' => 300000000.00,
            'current_value'     => 300000000.00,
            'condition'         => 'good',
            'status'            => 'active',
        ]);

        $summary = $this->reportService->getSummary();

        $this->assertArrayHasKey('total_assets', $summary);
        $this->assertArrayHasKey('total_acquisition_value', $summary);
        $this->assertArrayHasKey('total_accumulated_depreciation', $summary);
        $this->assertArrayHasKey('total_book_value', $summary);
        $this->assertArrayHasKey('by_category', $summary);
        $this->assertArrayHasKey('by_condition', $summary);
        $this->assertArrayHasKey('by_status', $summary);
        $this->assertGreaterThan(0, $summary['total_assets']);

        $report = $this->reportService->getReport(null, $this->period->id);
        $this->assertArrayHasKey('period', $report);
        $this->assertArrayHasKey('summary', $report);
        $this->assertArrayHasKey('assets', $report);
        $this->assertEquals($this->period->id, $report['period']['id']);

        $detail = $this->reportService->getAssetDetail($asset->id);
        $this->assertNotNull($detail);
        $this->assertEquals('AST-SUM-001', $detail['asset_code']);
        $this->assertArrayHasKey('depreciation_history', $detail);
    }

    public function test_api_endpoints_return_successful_response(): void
    {
        $responseReport = $this->actingAs($this->user)
            ->getJson('/api/v1/finance/waqf-assets-report');

        $responseReport->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'data' => [
                    'period',
                    'filters',
                    'summary' => [
                        'total_assets',
                        'total_acquisition_value',
                        'total_accumulated_depreciation',
                        'total_book_value',
                        'by_category',
                        'by_condition',
                        'by_status',
                    ],
                    'assets',
                ],
            ]);

        $responseRegister = $this->actingAs($this->user)
            ->getJson('/api/v1/finance/waqf-assets-register');

        $responseRegister->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'data' => [
                    '*' => [
                        'asset_code',
                        'asset_name',
                        'category',
                        'wakif',
                        'acquisition_date',
                        'acquisition_value',
                        'accumulated_depreciation',
                        'book_value',
                        'location',
                        'condition',
                        'status',
                    ],
                ],
            ]);
    }
}
