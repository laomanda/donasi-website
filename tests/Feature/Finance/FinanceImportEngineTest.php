<?php

namespace Tests\Feature\Finance;

use App\Models\Account;
use App\Models\AuditLog;
use App\Models\ImportBatch;
use App\Models\ImportError;
use App\Models\User;
use App\Services\FinanceImportService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class FinanceImportEngineTest extends TestCase
{
    use DatabaseTransactions;

    protected FinanceImportService $importService;
    protected User $user;
    protected array $tempFiles = [];

    protected function setUp(): void
    {
        parent::setUp();

        $this->importService = app(FinanceImportService::class);

        $this->user = User::first(['*']) ?? User::factory()->create([]);
        if (class_exists(Role::class)) {
            $role = Role::firstOrCreate(['name' => 'superadmin', 'guard_name' => 'web']);
            if (!$this->user->hasRole('superadmin')) {
                $this->user->assignRole($role);
            }
        }
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
     * Helper to create a temporary Excel file for testing.
     */
    protected function createExcelFile(array $rows, string $sheetTitle = 'AD'): UploadedFile
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle($sheetTitle);
        $sheet->fromArray($rows);

        $tempFile = tempnam(sys_get_temp_dir(), 'test_import_') . '.xlsx';
        $this->tempFiles[] = $tempFile;

        $writer = new Xlsx($spreadsheet);
        $writer->save($tempFile);

        return new UploadedFile(
            $tempFile,
            'accounts.xlsx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            null,
            true
        );
    }

    /**
     * Test 1: Import AD valid berhasil.
     */
    public function test_valid_ad_import_succeeds(): void
    {
        $unique = uniqid();
        $code1 = '1000-' . $unique;
        $code2 = '1100-' . $unique;
        $code3 = '1110-' . $unique;

        $file = $this->createExcelFile([
            ['Kode Akun', 'Nama Akun', 'Level', 'Parent Akun', 'Jenis Akun', 'Saldo Normal', 'Kategori Laporan', 'Status'],
            [$code1, 'Aset Utama', 1, '', 'asset', 'debit', 'Aset', 'Aktif'],
            [$code2, 'Aset Lancar', 2, $code1, 'asset', 'debit', 'Aset Lancar', 'Aktif'],
            [$code3, 'Kas & Bank', 3, $code2, 'asset', 'debit', 'Kas', 'Aktif'],
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->post('/api/v1/finance/import/accounts', [
                'file' => $file,
            ]);

        $response->assertOk()
            ->assertJson([
                'status'       => 'success',
                'total_rows'   => 3,
                'success_rows' => 3,
                'failed_rows'  => 0,
            ]);

        $this->assertDatabaseHas('accounts', ['code' => $code1, 'name' => 'Aset Utama']);
        $this->assertDatabaseHas('accounts', ['code' => $code2, 'name' => 'Aset Lancar']);
        $this->assertDatabaseHas('accounts', ['code' => $code3, 'name' => 'Kas & Bank']);
    }

    /**
     * Test 2: Duplicate code ditolak (baik yang sudah ada di DB maupun duplikat di file).
     */
    public function test_duplicate_code_is_rejected(): void
    {
        // 1. Existing account in DB
        $existing = Account::firstOrCreate(
            ['code' => '9999-EXISTING'],
            [
                'name'           => 'Akun Lama',
                'account_type'   => 'asset',
                'normal_balance' => 'debit',
                'is_active'      => true,
            ]
        );

        // Upload file with duplicate of existing code
        $fileExisting = $this->createExcelFile([
            ['Kode Akun', 'Nama Akun', 'Level', 'Parent Akun', 'Jenis Akun', 'Saldo Normal', 'Kategori Laporan', 'Status'],
            [$existing->code, 'Akun Duplikat DB', 1, '', 'asset', 'debit', 'Aset', 'Aktif'],
        ]);

        $responseDbDup = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/finance/import/accounts', [
                'file' => $fileExisting,
            ]);

        $responseDbDup->assertStatus(422)
            ->assertJson([
                'status' => 'failed',
            ]);

        $this->assertStringContainsString('Account code already exists', json_encode($responseDbDup->json()));

        // 2. Duplicate within the same file
        $unique = uniqid();
        $dupCode = '5555-' . $unique;

        $fileInternalDup = $this->createExcelFile([
            ['Kode Akun', 'Nama Akun', 'Level', 'Parent Akun', 'Jenis Akun', 'Saldo Normal', 'Kategori Laporan', 'Status'],
            [$dupCode, 'Akun Pertama', 1, '', 'asset', 'debit', 'Aset', 'Aktif'],
            [$dupCode, 'Akun Kedua Duplikat', 1, '', 'asset', 'debit', 'Aset', 'Aktif'],
        ]);

        $responseFileDup = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/finance/import/accounts', [
                'file' => $fileInternalDup,
            ]);

        $responseFileDup->assertStatus(422)
            ->assertJson([
                'status' => 'failed',
            ]);

        $this->assertStringContainsString('Duplicate account code in file', json_encode($responseFileDup->json()));
    }

    /**
     * Test 3: Invalid account type gagal.
     */
    public function test_invalid_account_type_fails(): void
    {
        $unique = uniqid();
        $code = '7777-' . $unique;

        $file = $this->createExcelFile([
            ['Kode Akun', 'Nama Akun', 'Level', 'Parent Akun', 'Jenis Akun', 'Saldo Normal', 'Kategori Laporan', 'Status'],
            [$code, 'Akun Jenis Salah', 1, '', 'invalid_type', 'debit', 'Kategori', 'Aktif'],
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/finance/import/accounts', [
                'file' => $file,
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'status' => 'failed',
            ]);

        $this->assertStringContainsString('Invalid account type', json_encode($response->json()));
        $this->assertDatabaseMissing('accounts', ['code' => $code]);
    }

    /**
     * Test 4: Parent hierarchy benar (meskipun urutan di file terbalik/acak).
     */
    public function test_parent_hierarchy_is_resolved_correctly(): void
    {
        $unique = uniqid();
        $p1 = '2000-' . $unique;
        $p2 = '2100-' . $unique;
        $p3 = '2110-' . $unique;

        // Note: Row order is intentionally mixed (child before parent)
        $file = $this->createExcelFile([
            ['Kode Akun', 'Nama Akun', 'Level', 'Parent Akun', 'Jenis Akun', 'Saldo Normal', 'Kategori Laporan', 'Status'],
            [$p3, 'Hutang Dagang', 3, "{$p2} - Liabilitas Pendek", 'liability', 'credit', 'Liabilitas', 'Aktif'],
            [$p1, 'Liabilitas', 1, '', 'liability', 'credit', 'Liabilitas', 'Aktif'],
            [$p2, 'Liabilitas Jangka Pendek', 2, $p1, 'liability', 'credit', 'Liabilitas', 'Aktif'],
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->post('/api/v1/finance/import/accounts', [
                'file' => $file,
            ]);

        $response->assertOk()
            ->assertJson(['status' => 'success']);

        $acc1 = Account::where('code', $p1)->first();
        $acc2 = Account::where('code', $p2)->first();
        $acc3 = Account::where('code', $p3)->first();

        $this->assertNotNull($acc1);
        $this->assertNotNull($acc2);
        $this->assertNotNull($acc3);

        $this->assertNull($acc1->parent_id);
        $this->assertEquals($acc1->id, $acc2->parent_id);
        $this->assertEquals($acc2->id, $acc3->parent_id);
    }

    /**
     * Test 5: Import batch tersimpan untuk sukses dan gagal.
     */
    public function test_import_batch_is_saved_for_success_and_failure(): void
    {
        // 1. Success batch
        $unique = uniqid();
        $code = '8000-' . $unique;

        $fileSuccess = $this->createExcelFile([
            ['Kode Akun', 'Nama Akun', 'Level', 'Parent Akun', 'Jenis Akun', 'Saldo Normal', 'Kategori Laporan', 'Status'],
            [$code, 'Akun Sukses', 1, '', 'expense', 'debit', 'Beban', 'Aktif'],
        ]);

        $resSuccess = $this->actingAs($this->user, 'sanctum')
            ->post('/api/v1/finance/import/accounts', ['file' => $fileSuccess]);

        $resSuccess->assertOk();
        $batchIdSuccess = $resSuccess->json('batch_id');

        $this->assertDatabaseHas('import_batches', [
            'id'     => $batchIdSuccess,
            'module' => 'accounts',
            'status' => 'completed',
        ]);

        // 2. Failure batch & error record
        $fileFail = $this->createExcelFile([
            ['Kode Akun', 'Nama Akun', 'Level', 'Parent Akun', 'Jenis Akun', 'Saldo Normal', 'Kategori Laporan', 'Status'],
            ['', 'Akun Tanpa Kode', 1, '', 'expense', 'debit', 'Beban', 'Aktif'],
        ]);

        $resFail = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/finance/import/accounts', ['file' => $fileFail]);

        $resFail->assertStatus(422);
        $batchIdFail = $resFail->json('batch_id');

        $this->assertDatabaseHas('import_batches', [
            'id'     => $batchIdFail,
            'module' => 'accounts',
            'status' => 'failed',
        ]);

        $this->assertDatabaseHas('import_errors', [
            'batch_id'   => $batchIdFail,
            'row_number' => 2,
        ]);
    }

    /**
     * Test 6: Audit log tersimpan.
     */
    public function test_audit_log_is_saved_for_import(): void
    {
        $unique = uniqid();
        $code = '6000-' . $unique;

        $file = $this->createExcelFile([
            ['Kode Akun', 'Nama Akun', 'Level', 'Parent Akun', 'Jenis Akun', 'Saldo Normal', 'Kategori Laporan', 'Status'],
            [$code, 'Akun Audit Test', 1, '', 'revenue', 'credit', 'Pendapatan', 'Aktif'],
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->post('/api/v1/finance/import/accounts', ['file' => $file]);

        $response->assertOk();
        $batchId = $response->json('batch_id');

        $this->assertDatabaseHas('audit_logs', [
            'module'       => 'finance_import',
            'action'       => 'import_accounts',
            'reference_id' => $batchId,
        ]);
    }

    /**
     * Test 7: Rollback jika terjadi error pada baris mana pun (semua akun batal tersimpan).
     */
    public function test_rollback_on_error_leaves_database_clean(): void
    {
        $unique = uniqid();
        $validCode1 = '3100-' . $unique;
        $validCode2 = '3200-' . $unique;
        $invalidCode = '3300-' . $unique;

        // 2 valid rows, 1 row with invalid normal balance
        $file = $this->createExcelFile([
            ['Kode Akun', 'Nama Akun', 'Level', 'Parent Akun', 'Jenis Akun', 'Saldo Normal', 'Kategori Laporan', 'Status'],
            [$validCode1, 'Akun Valid 1', 1, '', 'net_asset', 'credit', 'Aset Neto', 'Aktif'],
            [$validCode2, 'Akun Valid 2', 1, '', 'net_asset', 'credit', 'Aset Neto', 'Aktif'],
            [$invalidCode, 'Akun Saldo Salah', 1, '', 'net_asset', 'INVALID_BALANCE', 'Aset Neto', 'Aktif'],
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/finance/import/accounts', ['file' => $file]);

        $response->assertStatus(422)
            ->assertJson(['status' => 'failed']);

        // None of the accounts from this batch should exist in database!
        $this->assertDatabaseMissing('accounts', ['code' => $validCode1]);
        $this->assertDatabaseMissing('accounts', ['code' => $validCode2]);
        $this->assertDatabaseMissing('accounts', ['code' => $invalidCode]);
    }
}
