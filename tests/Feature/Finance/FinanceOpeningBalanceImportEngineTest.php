<?php

namespace Tests\Feature\Finance;

use App\Models\Account;
use App\Models\AccountingPeriod;
use App\Models\AuditLog;
use App\Models\ImportBatch;
use App\Models\JournalEntry;
use App\Models\User;
use App\Services\GeneralLedgerService;
use Database\Seeders\AccountingPeriodSeeder;
use Database\Seeders\AccountSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class FinanceOpeningBalanceImportEngineTest extends TestCase
{
    use DatabaseTransactions;

    protected User $user;

    protected AccountingPeriod $period;

    protected Account $debitAccount;

    protected Account $creditAccount;

    protected array $tempFiles = [];

    protected function setUp(): void
    {
        parent::setUp();

        if (Account::count() === 0) {
            $this->seed(AccountSeeder::class);
        }
        if (AccountingPeriod::count() === 0) {
            $this->seed(AccountingPeriodSeeder::class);
        }

        $this->user = User::first(['*']) ?? User::factory()->create([]);
        if (class_exists(Role::class)) {
            $role = Role::firstOrCreate(['name' => 'superadmin', 'guard_name' => 'web']);
            if (! $this->user->hasRole('superadmin')) {
                $this->user->assignRole($role);
            }
        }

        // Open Accounting Period for 2026
        $this->period = AccountingPeriod::where('status', 'open')
            ->where('start_date', '<=', '2026-01-01')
            ->where('end_date', '>=', '2026-12-31')
            ->first() ?? AccountingPeriod::create([
                'name' => 'Tahun 2026',
                'start_date' => '2026-01-01',
                'end_date' => '2026-12-31',
                'status' => 'open',
            ]);

        // Clean any existing opening balance for this period to ensure isolated test runs
        JournalEntry::where('reference_type', 'opening_balance')
            ->where('accounting_period_id', $this->period->id)
            ->delete();

        // 1112 Bank BSI (Debit normal)
        $this->debitAccount = Account::where('code', '1112')->first() ?? Account::create([
            'code' => '1112',
            'name' => 'Bank BSI - Rekening Wakaf',
            'account_type' => 'asset',
            'normal_balance' => 'debit',
            'is_active' => true,
        ]);

        // 3110 Pokok Wakaf Abadi (Credit normal)
        $this->creditAccount = Account::where('code', '3110')->first() ?? Account::create([
            'code' => '3110',
            'name' => 'Aset Neto Terikat Permanen (Pokok Wakaf Abadi)',
            'account_type' => 'net_asset',
            'normal_balance' => 'credit',
            'is_active' => true,
        ]);
    }

    protected function tearDown(): void
    {
        foreach ($this->tempFiles as $file) {
            if (file_exists($file)) {
                @unlink($file);
            }
        }

        parent::tearDown();
    }

    /**
     * Helper to create an Excel file with OPENING BALANCE sheet.
     */
    protected function createOpeningBalanceExcel(array $rows, string $sheetTitle = 'OPENING BALANCE'): UploadedFile
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle($sheetTitle);

        $sheet->setCellValue('A1', 'Kode Akun');
        $sheet->setCellValue('B1', 'Nama Akun');
        $sheet->setCellValue('C1', 'Saldo Normal');
        $sheet->setCellValue('D1', 'Saldo Awal');

        $rowNum = 2;
        foreach ($rows as $row) {
            $sheet->setCellValue("A{$rowNum}", $row[0] ?? '');
            $sheet->setCellValue("B{$rowNum}", $row[1] ?? '');
            $sheet->setCellValue("C{$rowNum}", $row[2] ?? '');
            $sheet->setCellValue("D{$rowNum}", $row[3] ?? '');
            $rowNum++;
        }

        $tempFile = tempnam(sys_get_temp_dir(), 'test_ob_').'.xlsx';
        $writer = new Xlsx($spreadsheet);
        $writer->save($tempFile);

        $this->tempFiles[] = $tempFile;

        return new UploadedFile(
            $tempFile,
            'test_opening_balance.xlsx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            null,
            true
        );
    }

    /**
     * Test 1: Template saldo awal berhasil dibuat
     */
    public function test_1_opening_balance_template_download(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/api/v1/finance/import/opening-balance/template');

        $response->assertStatus(200);
        $this->assertStringContainsString('template_saldo_awal.xlsx', (string) $response->headers->get('content-disposition'));
    }

    /**
     * Test 2: Preview valid berhasil
     */
    public function test_2_valid_preview_succeeds(): void
    {
        $excel = $this->createOpeningBalanceExcel([
            ['1112', 'Bank BSI - Rekening Wakaf', 'Debit', 100000000],
            ['3110', 'Aset Neto Terikat Permanen', 'Credit', 100000000],
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/finance/import/opening-balance/preview', [
                'file' => $excel,
                'accounting_period_id' => $this->period->id,
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'status' => 'success',
            'data' => [
                'total_rows' => 2,
                'valid_rows' => 2,
                'failed_rows' => 0,
                'total_debit' => 100000000,
                'total_credit' => 100000000,
                'errors' => [],
            ],
        ]);
        $this->assertNotEmpty($response->json('data.batch_token'));
    }

    /**
     * Test 3: Preview tidak insert journal
     */
    public function test_3_preview_does_not_insert_journal(): void
    {
        $initialJournalsCount = JournalEntry::where('reference_type', 'opening_balance')->count();

        $excel = $this->createOpeningBalanceExcel([
            ['1112', 'Bank BSI - Rekening Wakaf', 'Debit', 100000000],
            ['3110', 'Aset Neto Terikat Permanen', 'Credit', 100000000],
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/finance/import/opening-balance/preview', [
                'file' => $excel,
                'accounting_period_id' => $this->period->id,
            ]);

        $response->assertStatus(200);

        $afterJournalsCount = JournalEntry::where('reference_type', 'opening_balance')->count();
        $this->assertEquals($initialJournalsCount, $afterJournalsCount, 'Preview tidak boleh membuat journal entry.');
    }

    /**
     * Test 4: Account tidak ditemukan ditolak ("Account code not found")
     */
    public function test_4_account_not_found_is_rejected(): void
    {
        $excel = $this->createOpeningBalanceExcel([
            ['9999-NOTFOUND', 'Akun Fiktif', 'Debit', 50000000],
            ['3110', 'Aset Neto Terikat Permanen', 'Credit', 50000000],
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/finance/import/opening-balance/preview', [
                'file' => $excel,
                'accounting_period_id' => $this->period->id,
            ]);

        $response->assertStatus(422);
        $response->assertJson(['status' => 'failed']);
        $this->assertStringContainsString('Account code not found', json_encode($response->json('data.errors')));
    }

    /**
     * Test 5: Debit kredit balance berhasil
     */
    public function test_5_balanced_debit_credit_import_succeeds(): void
    {
        $excel = $this->createOpeningBalanceExcel([
            ['1112', 'Bank BSI - Rekening Wakaf', 'Debit', 100000000],
            ['3110', 'Aset Neto Terikat Permanen', 'Credit', 100000000],
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/finance/import/opening-balance/confirm', [
                'file' => $excel,
                'accounting_period_id' => $this->period->id,
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'status' => 'success',
            'data' => [
                'total_rows' => 2,
                'total_debit' => 100000000,
                'total_credit' => 100000000,
            ],
        ]);

        $journalId = $response->json('data.journal_entry_id');
        $journal = JournalEntry::with('lines')->find($journalId);

        $this->assertNotNull($journal);
        $this->assertEquals('posted', $journal->status);
        $this->assertEquals('opening_balance', $journal->reference_type);
        $this->assertEquals(100000000.00, $journal->total_debit);
        $this->assertEquals(100000000.00, $journal->total_credit);
        $this->assertTrue($journal->is_balanced);
    }

    /**
     * Test 6: Debit kredit tidak balance gagal ("Opening balance is not balanced")
     */
    public function test_6_unbalanced_debit_credit_fails(): void
    {
        $excel = $this->createOpeningBalanceExcel([
            ['1112', 'Bank BSI - Rekening Wakaf', 'Debit', 100000000],
            ['3110', 'Aset Neto Terikat Permanen', 'Credit', 80000000], // Selisih 20 juta
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/finance/import/opening-balance/confirm', [
                'file' => $excel,
                'accounting_period_id' => $this->period->id,
            ]);

        $response->assertStatus(422);
        $response->assertJson(['status' => 'failed']);
        $this->assertStringContainsString('Opening balance is not balanced', json_encode($response->json()));
    }

    /**
     * Test 7: Duplicate opening balance ditolak ("Opening balance already exists")
     */
    public function test_7_duplicate_opening_balance_rejected(): void
    {
        // Import pertama berhasil
        $excel1 = $this->createOpeningBalanceExcel([
            ['1112', 'Bank BSI - Rekening Wakaf', 'Debit', 50000000],
            ['3110', 'Aset Neto Terikat Permanen', 'Credit', 50000000],
        ]);

        $res1 = $this->actingAs($this->user)
            ->postJson('/api/v1/finance/import/opening-balance/confirm', [
                'file' => $excel1,
                'accounting_period_id' => $this->period->id,
            ]);
        $res1->assertStatus(200);

        // Import kedua untuk periode yang sama harus ditolak
        $excel2 = $this->createOpeningBalanceExcel([
            ['1112', 'Bank BSI - Rekening Wakaf', 'Debit', 50000000],
            ['3110', 'Aset Neto Terikat Permanen', 'Credit', 50000000],
        ]);

        $res2 = $this->actingAs($this->user)
            ->postJson('/api/v1/finance/import/opening-balance/confirm', [
                'file' => $excel2,
                'accounting_period_id' => $this->period->id,
            ]);

        $res2->assertStatus(422);
        $res2->assertJson(['status' => 'failed']);
        $this->assertStringContainsString('Opening balance already exists', json_encode($res2->json()));
    }

    /**
     * Test 8: Journal opening balance masuk General Ledger
     */
    public function test_8_opening_balance_appears_in_general_ledger(): void
    {
        $uniqueBankCode = '1112-obgl-'.uniqid();
        $uniqueNetCode = '3110-obgl-'.uniqid();

        $bank = Account::create([
            'code' => $uniqueBankCode,
            'name' => 'Bank BSI Uji GL',
            'account_type' => 'asset',
            'normal_balance' => 'debit',
            'is_active' => true,
        ]);

        $net = Account::create([
            'code' => $uniqueNetCode,
            'name' => 'Pokok Wakaf Uji GL',
            'account_type' => 'net_asset',
            'normal_balance' => 'credit',
            'is_active' => true,
        ]);

        $excel = $this->createOpeningBalanceExcel([
            [$bank->code, $bank->name, 'Debit', 75000000],
            [$net->code, $net->name, 'Credit', 75000000],
        ]);

        $res = $this->actingAs($this->user)
            ->postJson('/api/v1/finance/import/opening-balance/confirm', [
                'file' => $excel,
                'accounting_period_id' => $this->period->id,
            ]);
        $res->assertStatus(200);

        // Periksa buku besar via GeneralLedgerService
        $glService = app(GeneralLedgerService::class);
        $glData = $glService->getLedger($bank->id, $this->period->id);

        $this->assertNotNull($glData['account']);
        $this->assertEquals($bank->code, $glData['account']['code']);
        $this->assertEquals(75000000.00, $glData['account']['total_debit']);
        $this->assertEquals(75000000.00, $glData['account']['closing_balance']);

        $trans = collect($glData['account']['transactions']);
        $this->assertTrue($trans->contains('reference_type', 'opening_balance'));
    }

    /**
     * Test 9: Import batch tersimpan
     */
    public function test_9_import_batch_persisted(): void
    {
        $excel = $this->createOpeningBalanceExcel([
            ['1112', 'Bank BSI - Rekening Wakaf', 'Debit', 25000000],
            ['3110', 'Aset Neto Terikat Permanen', 'Credit', 25000000],
        ]);

        $res = $this->actingAs($this->user)
            ->postJson('/api/v1/finance/import/opening-balance/confirm', [
                'file' => $excel,
                'accounting_period_id' => $this->period->id,
            ]);
        $res->assertStatus(200);

        $batchId = $res->json('data.batch_id');
        $batch = ImportBatch::find($batchId);

        $this->assertNotNull($batch);
        $this->assertEquals('opening_balance', $batch->module);
        $this->assertEquals('completed', $batch->status);
        $this->assertEquals($this->user->id, $batch->imported_by);
    }

    /**
     * Test 10: Audit log tersimpan
     */
    public function test_10_audit_log_persisted(): void
    {
        $excel = $this->createOpeningBalanceExcel([
            ['1112', 'Bank BSI - Rekening Wakaf', 'Debit', 35000000],
            ['3110', 'Aset Neto Terikat Permanen', 'Credit', 35000000],
        ]);

        // 1. Preview
        $previewRes = $this->actingAs($this->user)
            ->postJson('/api/v1/finance/import/opening-balance/preview', [
                'file' => $excel,
                'accounting_period_id' => $this->period->id,
            ]);
        $previewRes->assertStatus(200);

        $previewLog = AuditLog::where('module', 'finance_import')
            ->where('action', 'preview_opening_balance')
            ->latest('id')
            ->first();
        $this->assertNotNull($previewLog, 'Audit log untuk preview_opening_balance harus tercatat.');

        // 2. Confirm
        $confirmRes = $this->actingAs($this->user)
            ->postJson('/api/v1/finance/import/opening-balance/confirm', [
                'batch_token' => $previewRes->json('data.batch_token'),
                'accounting_period_id' => $this->period->id,
            ]);
        $confirmRes->assertStatus(200);

        $confirmLog = AuditLog::where('module', 'finance_import')
            ->where('action', 'confirm_opening_balance')
            ->latest('id')
            ->first();
        $this->assertNotNull($confirmLog, 'Audit log untuk confirm_opening_balance harus tercatat.');
    }
}
