<?php

namespace Tests\Feature\Finance;

use App\Exports\Finance\AccountsExport;
use App\Exports\Finance\AnnualPackageExport;
use App\Exports\Finance\JournalEntriesExport;
use App\Models\Account;
use App\Models\AccountingPeriod;
use App\Models\FinancialNote;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\User;
use App\Models\WaqfAsset;
use App\Models\WaqfAssetCategory;
use App\Services\FinanceExportService;
use Database\Seeders\AccountingPeriodSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class FinanceExportEngineTest extends TestCase
{
    use DatabaseTransactions;

    protected FinanceExportService $exportService;
    protected User $user;
    protected AccountingPeriod $period2026;
    protected AccountingPeriod $period2025;
    protected Account $assetAccount;
    protected Account $revenueAccount;

    protected function setUp(): void
    {
        parent::setUp();

        $this->exportService = app(FinanceExportService::class);

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

        $this->assetAccount = Account::firstOrCreate(
            ['code' => '1111-TEST'],
            [
                'name'            => 'Kas Tunai Test',
                'account_type'    => 'asset',
                'normal_balance'  => 'debit',
                'report_category' => 'Aset Lancar',
                'is_active'       => true,
            ]
        );

        $this->revenueAccount = Account::firstOrCreate(
            ['code' => '4111-TEST'],
            [
                'name'            => 'Penerimaan Wakaf Test',
                'account_type'    => 'revenue',
                'normal_balance'  => 'credit',
                'report_category' => 'Penerimaan Wakaf',
                'is_active'       => true,
            ]
        );
    }

    /**
     * Test 1: Export COA berhasil.
     */
    public function test_export_coa_succeeds(): void
    {
        // 1. Service export
        $export = $this->exportService->getAccountsExport();
        $this->assertInstanceOf(AccountsExport::class, $export);
        $this->assertEquals('Daftar Akun', $export->title());

        $headings = $export->headings();
        $this->assertEquals([
            'Kode Akun',
            'Nama Akun',
            'Level',
            'Parent Akun',
            'Jenis Akun',
            'Saldo Normal',
            'Kategori Laporan',
            'Status',
        ], $headings);

        $collection = $export->collection();
        $this->assertGreaterThan(0, $collection->count());

        // 2. HTTP Endpoint test
        $response = $this->actingAs($this->user, 'sanctum')
            ->get('/api/v1/finance/export/accounts');

        $response->assertOk();
        $disposition = $response->headers->get('content-disposition');
        $this->assertNotNull($disposition);
        $this->assertStringContainsString('.xlsx', $disposition);
    }

    /**
     * Test 2: Export jurnal hanya mengambil posted (draft dan void tidak masuk).
     */
    public function test_export_journals_only_includes_posted_entries(): void
    {
        // Create 1 posted journal
        $postedJournal = JournalEntry::create([
            'accounting_period_id' => $this->period2026->id,
            'journal_number'       => 'JU-POSTED-' . uniqid(),
            'transaction_date'     => '2026-03-01',
            'description'          => 'Transaksi Terposting',
            'status'               => 'posted',
            'created_by'           => $this->user->id,
        ]);
        JournalEntryLine::create([
            'journal_entry_id' => $postedJournal->id,
            'account_id'       => $this->assetAccount->id,
            'debit'            => 1000000,
            'credit'           => 0,
            'description'      => 'Debet Kas',
        ]);
        JournalEntryLine::create([
            'journal_entry_id' => $postedJournal->id,
            'account_id'       => $this->revenueAccount->id,
            'debit'            => 0,
            'credit'           => 1000000,
            'description'      => 'Kredit Wakaf',
        ]);

        // Create 1 draft journal
        $draftJournal = JournalEntry::create([
            'accounting_period_id' => $this->period2026->id,
            'journal_number'       => 'JU-DRAFT-' . uniqid(),
            'transaction_date'     => '2026-03-02',
            'description'          => 'Transaksi Draft',
            'status'               => 'draft',
            'created_by'           => $this->user->id,
        ]);
        JournalEntryLine::create([
            'journal_entry_id' => $draftJournal->id,
            'account_id'       => $this->assetAccount->id,
            'debit'            => 500000,
            'credit'           => 0,
            'description'      => 'Draft line',
        ]);

        // Create 1 void journal
        $voidJournal = JournalEntry::create([
            'accounting_period_id' => $this->period2026->id,
            'journal_number'       => 'JU-VOID-' . uniqid(),
            'transaction_date'     => '2026-03-03',
            'description'          => 'Transaksi Batal/Void',
            'status'               => 'void',
            'created_by'           => $this->user->id,
        ]);
        JournalEntryLine::create([
            'journal_entry_id' => $voidJournal->id,
            'account_id'       => $this->assetAccount->id,
            'debit'            => 750000,
            'credit'           => 0,
            'description'      => 'Void line',
        ]);

        // Export inspection
        $export = new JournalEntriesExport(['period_id' => $this->period2026->id]);
        $rows = $export->collection();

        $journalNumbers = $rows->pluck('journal_number')->all();

        // Must contain posted journal
        $this->assertContains($postedJournal->journal_number, $journalNumbers);

        // MUST NOT contain draft or void journals
        $this->assertNotContains($draftJournal->journal_number, $journalNumbers);
        $this->assertNotContains($voidJournal->journal_number, $journalNumbers);

        // Verify status column on all mapped rows is Posted
        foreach ($rows as $row) {
            $this->assertEquals('Posted', $row['status']);
        }

        // HTTP Endpoint test
        $response = $this->actingAs($this->user, 'sanctum')
            ->get('/api/v1/finance/export/journals?period_id=' . $this->period2026->id);

        $response->assertOk();
        $this->assertStringContainsString('.xlsx', (string) $response->headers->get('content-disposition'));
    }

    /**
     * Test 3: Annual package menghasilkan semua sheet (AD, JU, BB, NS-TB, LP, LA, LRAW, CLK).
     */
    public function test_annual_package_generates_all_required_sheets(): void
    {
        $packageExport = new AnnualPackageExport(['period_id' => $this->period2026->id]);
        $sheets = $packageExport->sheets();

        $this->assertCount(8, $sheets);

        $sheetTitles = array_map(fn ($sheet) => $sheet->title(), $sheets);

        $expectedSheets = ['AD', 'JU', 'BB', 'NS-TB', 'LP', 'LA', 'LRAW', 'CLK'];
        $this->assertEquals($expectedSheets, $sheetTitles);

        // HTTP Endpoint test
        $response = $this->actingAs($this->user, 'sanctum')
            ->get('/api/v1/finance/export/annual-package?period_id=' . $this->period2026->id);

        $response->assertOk();
        $disposition = (string) $response->headers->get('content-disposition');
        $this->assertStringContainsString('paket-keuangan', $disposition);
        $this->assertStringContainsString('.xlsx', $disposition);
    }

    /**
     * Test 4: Filter periode berjalan dan validasi parameter.
     */
    public function test_export_filters_by_period_and_validates(): void
    {
        // 1. Jurnal di period 2026
        $j2026 = JournalEntry::create([
            'accounting_period_id' => $this->period2026->id,
            'journal_number'       => 'JU-2026-' . uniqid(),
            'transaction_date'     => '2026-05-10',
            'description'          => 'Jurnal 2026',
            'status'               => 'posted',
            'created_by'           => $this->user->id,
        ]);
        JournalEntryLine::create([
            'journal_entry_id' => $j2026->id,
            'account_id'       => $this->assetAccount->id,
            'debit'            => 2000000,
            'credit'           => 0,
        ]);
        JournalEntryLine::create([
            'journal_entry_id' => $j2026->id,
            'account_id'       => $this->revenueAccount->id,
            'debit'            => 0,
            'credit'           => 2000000,
        ]);

        // Jurnal di period 2025
        $j2025 = JournalEntry::create([
            'accounting_period_id' => $this->period2025->id,
            'journal_number'       => 'JU-2025-' . uniqid(),
            'transaction_date'     => '2025-05-10',
            'description'          => 'Jurnal 2025',
            'status'               => 'posted',
            'created_by'           => $this->user->id,
        ]);
        JournalEntryLine::create([
            'journal_entry_id' => $j2025->id,
            'account_id'       => $this->assetAccount->id,
            'debit'            => 1500000,
            'credit'           => 0,
        ]);
        JournalEntryLine::create([
            'journal_entry_id' => $j2025->id,
            'account_id'       => $this->revenueAccount->id,
            'debit'            => 0,
            'credit'           => 1500000,
        ]);

        // Filter 2026
        $export2026 = new JournalEntriesExport(['period_id' => $this->period2026->id]);
        $rows2026 = $export2026->collection();
        $this->assertContains($j2026->journal_number, $rows2026->pluck('journal_number')->all());
        $this->assertNotContains($j2025->journal_number, $rows2026->pluck('journal_number')->all());

        // Filter 2025
        $export2025 = new JournalEntriesExport(['period_id' => $this->period2025->id]);
        $rows2025 = $export2025->collection();
        $this->assertContains($j2025->journal_number, $rows2025->pluck('journal_number')->all());
        $this->assertNotContains($j2026->journal_number, $rows2025->pluck('journal_number')->all());

        // Validation test: invalid period_id on annual package returns 422
        $responseInvalid = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/finance/export/annual-package?period_id=999999');

        $responseInvalid->assertStatus(422);

        // Validation test: missing period_id on annual package returns 422
        $responseMissing = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/finance/export/annual-package');

        $responseMissing->assertStatus(422);
    }

    /**
     * Test 5: Semua endpoint individual laporan keuangan dapat di-export ke Excel.
     */
    public function test_all_individual_finance_export_endpoints_succeed(): void
    {
        // Setup a waqf asset
        $category = WaqfAssetCategory::firstOrCreate(
            ['name' => 'Tanah Wakaf Test'],
            ['description' => 'Kategori test', 'is_depreciable' => false]
        );

        WaqfAsset::create([
            'asset_code'        => 'AST-EXP-' . uniqid(),
            'asset_name'        => 'Tanah Wakaf Produktif',
            'category_id'       => $category->id,
            'acquisition_date'  => '2026-01-15',
            'acquisition_value' => 500000000,
            'current_value'     => 500000000,
            'useful_life_month' => 0,
            'location'          => 'Bandung',
            'condition'         => 'good',
            'status'            => 'active',
        ]);

        // Setup a financial note
        FinancialNote::create([
            'accounting_period_id' => $this->period2026->id,
            'title'                => 'Kebijakan Akuntansi Wakaf',
            'category'             => FinancialNote::CATEGORY_ACCOUNTING_POLICY,
            'content'              => 'Aset wakaf diakui sebesar nilai wajar.',
            'sort_order'           => 1,
            'status'               => FinancialNote::STATUS_PUBLISHED,
            'created_by'           => $this->user->id,
        ]);

        $endpoints = [
            '/api/v1/finance/export/general-ledger?period_id=' . $this->period2026->id,
            '/api/v1/finance/export/trial-balance?period_id=' . $this->period2026->id,
            '/api/v1/finance/export/balance-sheet?period_id=' . $this->period2026->id,
            '/api/v1/finance/export/activity-statement?period_id=' . $this->period2026->id,
            '/api/v1/finance/export/waqf-assets?period_id=' . $this->period2026->id,
            '/api/v1/finance/export/financial-notes?period_id=' . $this->period2026->id,
        ];

        foreach ($endpoints as $url) {
            $response = $this->actingAs($this->user, 'sanctum')->get($url);
            $response->assertOk();
            $this->assertStringContainsString('.xlsx', (string) $response->headers->get('content-disposition'));
        }
    }
}
