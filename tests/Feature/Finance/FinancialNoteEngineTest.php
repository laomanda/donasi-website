<?php

namespace Tests\Feature\Finance;

use App\Models\AccountingPeriod;
use App\Models\FinancialNote;
use App\Models\User;
use App\Services\FinancialNoteService;
use App\Services\FinancialStatementService;
use App\Services\WaqfAssetReportService;
use Database\Seeders\AccountingPeriodSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class FinancialNoteEngineTest extends TestCase
{
    use DatabaseTransactions;

    protected FinancialNoteService $noteService;
    protected FinancialStatementService $fsService;
    protected WaqfAssetReportService $assetReportService;
    protected User $user;
    protected AccountingPeriod $period2026;
    protected AccountingPeriod $period2025;

    protected function setUp(): void
    {
        parent::setUp();

        $this->noteService = app(FinancialNoteService::class);
        $this->fsService = app(FinancialStatementService::class);
        $this->assetReportService = app(WaqfAssetReportService::class);

        if (AccountingPeriod::count() === 0) {
            $this->seed(AccountingPeriodSeeder::class);
        }

        $this->period2026 = AccountingPeriod::firstOrCreate(
            ['name' => 'Tahun Buku 2026'],
            [
                'start_date' => '2026-01-01',
                'end_date'   => '2026-12-31',
                'status'     => 'open',
            ]
        );

        $this->period2025 = AccountingPeriod::firstOrCreate(
            ['name' => 'Tahun Buku 2025'],
            [
                'start_date' => '2025-01-01',
                'end_date'   => '2025-12-31',
                'status'     => 'closed',
            ]
        );
        $this->user = User::first(['*']) ?? User::factory()->create([]);
        if (class_exists(Role::class)) {
            $role = Role::firstOrCreate(['name' => 'superadmin', 'guard_name' => 'web']);
            if (!$this->user->hasRole('superadmin')) {
                $this->user->assignRole($role);
            }
        }
    }

    /**
     * Test 1: Create financial note -> tersimpan.
     */
    public function test_create_financial_note_saves_to_database(): void
    {
        $payload = [
            'accounting_period_id' => $this->period2026->id,
            'title'                => 'Kebijakan Pengakuan Aset Wakaf',
            'category'             => FinancialNote::CATEGORY_ACCOUNTING_POLICY,
            'content'              => 'Aset wakaf diakui sebesar nilai wajar atau perolehan saat penyerahan ikrar wakaf.',
            'sort_order'           => 1,
            'status'               => FinancialNote::STATUS_PUBLISHED,
        ];

        // Service test
        $note = $this->noteService->createNote($payload, $this->user->id);

        $this->assertDatabaseHas('financial_notes', [
            'id'                   => $note->id,
            'accounting_period_id' => $this->period2026->id,
            'title'                => 'Kebijakan Pengakuan Aset Wakaf',
            'category'             => FinancialNote::CATEGORY_ACCOUNTING_POLICY,
            'status'               => FinancialNote::STATUS_PUBLISHED,
            'created_by'           => $this->user->id,
        ]);

        // API test
        $apiPayload = [
            'period_id'  => $this->period2026->id,
            'title'      => 'Catatan Portofolio CWLS',
            'category'   => FinancialNote::CATEGORY_WAQF_NOTE,
            'content'    => 'Penempatan dana wakaf abadi pada Cash Waqf Linked Sukuk Seri SWR004.',
            'sort_order' => 2,
            'status'     => 'published',
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/finance/financial-notes', $apiPayload);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.title', 'Catatan Portofolio CWLS')
            ->assertJsonPath('data.accounting_period_id', $this->period2026->id);

        $this->assertDatabaseHas('financial_notes', [
            'title'                => 'Catatan Portofolio CWLS',
            'accounting_period_id' => $this->period2026->id,
        ]);
    }

    /**
     * Test 2: Filter berdasarkan periode -> hanya catatan periode tersebut.
     */
    public function test_filter_notes_by_period(): void
    {
        // Notes for 2026
        $note2026 = FinancialNote::create([
            'accounting_period_id' => $this->period2026->id,
            'title'                => 'Catatan Tahun 2026',
            'category'             => FinancialNote::CATEGORY_GENERAL_NOTE,
            'content'              => 'Konten 2026',
            'status'               => FinancialNote::STATUS_PUBLISHED,
        ]);

        // Notes for 2025
        $note2025 = FinancialNote::create([
            'accounting_period_id' => $this->period2025->id,
            'title'                => 'Catatan Tahun 2025',
            'category'             => FinancialNote::CATEGORY_GENERAL_NOTE,
            'content'              => 'Konten 2025',
            'status'               => FinancialNote::STATUS_PUBLISHED,
        ]);

        // Query service for 2026
        $notes2026 = $this->noteService->getNotes($this->period2026->id);
        $ids2026 = collect($notes2026)->pluck('id');

        $this->assertTrue($ids2026->contains($note2026->id));
        $this->assertFalse($ids2026->contains($note2025->id));

        // API filter by period_id
        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/finance/financial-notes?period_id={$this->period2026->id}");

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $data = $response->json('data');
        $apiIds = collect($data)->pluck('id');
        $this->assertTrue($apiIds->contains($note2026->id));
        $this->assertFalse($apiIds->contains($note2025->id));
    }

    /**
     * Test 3: Filter category -> kategori sesuai.
     */
    public function test_filter_notes_by_category(): void
    {
        $policyNote = FinancialNote::create([
            'accounting_period_id' => $this->period2026->id,
            'title'                => 'Kebijakan Penyusutan Aset',
            'category'             => FinancialNote::CATEGORY_ACCOUNTING_POLICY,
            'content'              => 'Metode garis lurus digunakan untuk seluruh aset produktif.',
            'status'               => FinancialNote::STATUS_PUBLISHED,
        ]);

        $assetNote = FinancialNote::create([
            'accounting_period_id' => $this->period2026->id,
            'title'                => 'Rincian Penilaian Tanah Wakaf',
            'category'             => FinancialNote::CATEGORY_ASSET_NOTE,
            'content'              => 'Penilaian dilakukan oleh KJPP independen per akhir tahun.',
            'status'               => FinancialNote::STATUS_PUBLISHED,
        ]);

        // Service filter
        $filtered = $this->noteService->getNotes($this->period2026->id, FinancialNote::CATEGORY_ACCOUNTING_POLICY);
        $filteredIds = collect($filtered)->pluck('id');

        $this->assertTrue($filteredIds->contains($policyNote->id));
        $this->assertFalse($filteredIds->contains($assetNote->id));

        // API filter
        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/finance/financial-notes?category=" . FinancialNote::CATEGORY_ACCOUNTING_POLICY);

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertTrue(collect($data)->every(fn ($item) => $item['category'] === FinancialNote::CATEGORY_ACCOUNTING_POLICY));
    }

    /**
     * Test 4: Summary -> jumlah dan kategori benar.
     */
    public function test_summary_returns_accurate_totals_and_categories(): void
    {
        FinancialNote::create([
            'accounting_period_id' => $this->period2026->id,
            'title'                => 'Note Draft 1',
            'category'             => FinancialNote::CATEGORY_REVENUE_NOTE,
            'content'              => 'Draft revenue',
            'status'               => FinancialNote::STATUS_DRAFT,
        ]);

        FinancialNote::create([
            'accounting_period_id' => $this->period2026->id,
            'title'                => 'Note Published 1',
            'category'             => FinancialNote::CATEGORY_EXPENSE_NOTE,
            'content'              => 'Published expense',
            'status'               => FinancialNote::STATUS_PUBLISHED,
        ]);

        $summary = $this->noteService->getSummary($this->period2026->id);

        $this->assertArrayHasKey('total_notes', $summary);
        $this->assertArrayHasKey('by_category', $summary);
        $this->assertArrayHasKey('by_status', $summary);
        $this->assertGreaterThanOrEqual(2, $summary['total_notes']);
        $this->assertGreaterThanOrEqual(1, $summary['by_status']['draft']);
        $this->assertGreaterThanOrEqual(1, $summary['by_status']['published']);

        // API summary
        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/finance/financial-notes/summary?period_id={$this->period2026->id}");

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.period_id', $this->period2026->id);
    }

    /**
     * Test 5: Validation rules.
     */
    public function test_validation_fails_when_required_fields_missing(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/finance/financial-notes', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'category', 'content']);

        // Invalid period id
        $invalidPeriodResponse = $this->actingAs($this->user)
            ->postJson('/api/v1/finance/financial-notes', [
                'title'     => 'Test Note',
                'category'  => 'general_note',
                'content'   => 'Test content',
                'period_id' => 9999999,
            ]);

        $invalidPeriodResponse->assertStatus(422)
            ->assertJsonValidationErrors(['period_id']);
    }

    /**
     * Test 6: Update and delete lifecycle.
     */
    public function test_update_and_delete_financial_note(): void
    {
        $note = FinancialNote::create([
            'accounting_period_id' => $this->period2026->id,
            'title'                => 'Judul Awal',
            'category'             => FinancialNote::CATEGORY_GENERAL_NOTE,
            'content'              => 'Konten Awal',
            'status'               => FinancialNote::STATUS_DRAFT,
        ]);

        // Update via API
        $updateResponse = $this->actingAs($this->user)
            ->putJson("/api/v1/finance/financial-notes/{$note->id}", [
                'title'  => 'Judul Diperbarui',
                'status' => FinancialNote::STATUS_PUBLISHED,
            ]);

        $updateResponse->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.title', 'Judul Diperbarui')
            ->assertJsonPath('data.status', FinancialNote::STATUS_PUBLISHED);

        // Delete via API
        $deleteResponse = $this->actingAs($this->user)
            ->deleteJson("/api/v1/finance/financial-notes/{$note->id}");

        $deleteResponse->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $this->assertDatabaseMissing('financial_notes', [
            'id' => $note->id,
        ]);
    }

    /**
     * Test 7: Integration with financial reports (LP, LA, LRAW, & Comprehensive Package).
     */
    public function test_integration_with_financial_reports(): void
    {
        $note = FinancialNote::create([
            'accounting_period_id' => $this->period2026->id,
            'title'                => 'Catatan Terintegrasi 2026',
            'category'             => FinancialNote::CATEGORY_WAQF_NOTE,
            'content'              => 'Penjelasan komprehensif aset wakaf tahun 2026.',
            'status'               => FinancialNote::STATUS_PUBLISHED,
        ]);

        // 1. Balance Sheet contains notes
        $balanceSheet = $this->fsService->getBalanceSheet($this->period2026->id);
        $this->assertArrayHasKey('notes', $balanceSheet);
        $bsNoteIds = collect($balanceSheet['notes'])->pluck('id');
        $this->assertTrue($bsNoteIds->contains($note->id));

        // 2. Activity Statement contains notes
        $activityStatement = $this->fsService->getActivityStatement($this->period2026->id);
        $this->assertArrayHasKey('notes', $activityStatement);
        $laNoteIds = collect($activityStatement['notes'])->pluck('id');
        $this->assertTrue($laNoteIds->contains($note->id));

        // 3. Waqf Asset Report contains notes
        $waqfReport = $this->assetReportService->getReport(null, $this->period2026->id);
        $this->assertArrayHasKey('notes', $waqfReport);
        $waqfNoteIds = collect($waqfReport['notes'])->pluck('id');
        $this->assertTrue($waqfNoteIds->contains($note->id));

        // 4. Comprehensive Package: LP + LA + LRAW + CLK
        $package = $this->fsService->getComprehensivePackage($this->period2026->id);
        $this->assertArrayHasKey('period', $package);
        $this->assertArrayHasKey('balance_sheet', $package);
        $this->assertArrayHasKey('activity_statement', $package);
        $this->assertArrayHasKey('waqf_asset_report', $package);
        $this->assertArrayHasKey('financial_notes', $package);
        $packageNoteIds = collect($package['financial_notes'])->pluck('id');
        $this->assertTrue($packageNoteIds->contains($note->id));
    }
}
