<?php

namespace Tests\Feature\Finance;

use App\Models\Account;
use App\Models\AuditLog;
use App\Models\ImportBatch;
use App\Models\ImportError;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class FinanceImportManagementTest extends TestCase
{
    use DatabaseTransactions;

    protected User $user;
    protected array $tempFiles = [];

    protected function setUp(): void
    {
        parent::setUp();

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

    protected function createExcelFile(array $rows, string $sheetTitle = 'AD'): UploadedFile
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle($sheetTitle);
        $sheet->fromArray($rows);

        $tempFile = tempnam(sys_get_temp_dir(), 'test_mgmt_') . '.xlsx';
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
     * Test 1: Template berhasil dibuat.
     */
    public function test_template_is_generated_successfully(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->get('/api/v1/finance/import/accounts/template');

        $response->assertOk();
        $disposition = (string) $response->headers->get('content-disposition');
        $this->assertStringContainsString('template_chart_of_accounts.xlsx', $disposition);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $this->user->id,
            'module'  => 'finance_import',
            'action'  => 'template_download',
        ]);
    }

    /**
     * Test 2: Preview Excel valid berhasil.
     */
    public function test_preview_valid_excel_succeeds(): void
    {
        $unique = uniqid();
        $file = $this->createExcelFile([
            ['Kode Akun', 'Nama Akun', 'Level', 'Parent Akun', 'Jenis Akun', 'Saldo Normal', 'Kategori Laporan', 'Status'],
            ['1000-PV-' . $unique, 'Aset Preview', 1, '', 'asset', 'debit', 'Aset', 'Aktif'],
            ['1100-PV-' . $unique, 'Kas Preview', 2, '1000-PV-' . $unique, 'asset', 'debit', 'Aset Lancar', 'Aktif'],
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->post('/api/v1/finance/import/accounts/preview', [
                'file' => $file,
            ]);

        $response->assertOk()
            ->assertJson([
                'status' => 'success',
                'data'   => [
                    'total_rows'  => 2,
                    'valid_rows'  => 2,
                    'failed_rows' => 0,
                    'errors'      => [],
                ],
            ]);

        $this->assertNotEmpty($response->json('data.batch_token'));
    }

    /**
     * Test 3: Preview TIDAK insert database (accounts & import_batches tetap bersih).
     */
    public function test_preview_does_not_insert_database(): void
    {
        $unique = uniqid();
        $code = '9999-NO-INSERT-' . $unique;

        $file = $this->createExcelFile([
            ['Kode Akun', 'Nama Akun', 'Level', 'Parent Akun', 'Jenis Akun', 'Saldo Normal', 'Kategori Laporan', 'Status'],
            [$code, 'Akun Preview Only', 1, '', 'asset', 'debit', 'Aset', 'Aktif'],
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->post('/api/v1/finance/import/accounts/preview', [
                'file' => $file,
            ]);

        $response->assertOk();

        // Must NOT exist in accounts table!
        $this->assertDatabaseMissing('accounts', ['code' => $code]);

        // Must NOT create an import batch!
        $this->assertDatabaseMissing('import_batches', ['file_name' => 'accounts.xlsx']);
    }

    /**
     * Test 4: Preview duplicate mendeteksi error.
     */
    public function test_preview_duplicate_detects_error(): void
    {
        $unique = uniqid();
        $existing = Account::firstOrCreate(
            ['code' => '5000-EXIST-' . $unique],
            [
                'name'           => 'Beban Existing',
                'account_type'   => 'expense',
                'normal_balance' => 'debit',
                'is_active'      => true,
            ]
        );

        $file = $this->createExcelFile([
            ['Kode Akun', 'Nama Akun', 'Level', 'Parent Akun', 'Jenis Akun', 'Saldo Normal', 'Kategori Laporan', 'Status'],
            [$existing->code, 'Beban Duplikat', 1, '', 'expense', 'debit', 'Beban', 'Aktif'],
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/finance/import/accounts/preview', [
                'file' => $file,
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'status' => 'failed',
                'data'   => [
                    'total_rows'  => 1,
                    'valid_rows'  => 0,
                    'failed_rows' => 1,
                ],
            ]);

        $this->assertStringContainsString('Account code already exists', json_encode($response->json('data.errors')));
    }

    /**
     * Test 5: Confirm import berhasil (menggunakan batch_token).
     */
    public function test_confirm_import_succeeds_using_token(): void
    {
        $unique = uniqid();
        $code = '1500-CONFIRM-' . $unique;

        $file = $this->createExcelFile([
            ['Kode Akun', 'Nama Akun', 'Level', 'Parent Akun', 'Jenis Akun', 'Saldo Normal', 'Kategori Laporan', 'Status'],
            [$code, 'Akun Confirm Test', 1, '', 'asset', 'debit', 'Aset Tetap', 'Aktif'],
        ]);

        // Step 1: Preview
        $previewRes = $this->actingAs($this->user, 'sanctum')
            ->post('/api/v1/finance/import/accounts/preview', ['file' => $file]);

        $previewRes->assertOk();
        $token = $previewRes->json('data.batch_token');
        $this->assertNotEmpty($token);

        // Step 2: Confirm
        $confirmRes = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/finance/import/accounts/confirm', [
                'batch_token' => $token,
            ]);

        $confirmRes->assertOk()
            ->assertJson([
                'status'       => 'success',
                'total_rows'   => 1,
                'success_rows' => 1,
                'failed_rows'  => 0,
            ]);

        // Verify account inserted
        $this->assertDatabaseHas('accounts', ['code' => $code, 'name' => 'Akun Confirm Test']);

        // Verify batch completed
        $batchId = $confirmRes->json('batch_id');
        $this->assertDatabaseHas('import_batches', [
            'id'     => $batchId,
            'status' => 'completed',
        ]);
    }

    /**
     * Test 6: History import tampil.
     */
    public function test_import_history_lists_batches(): void
    {
        $batch = ImportBatch::create([
            'file_name'   => 'history_test.xlsx',
            'module'      => 'accounts',
            'status'      => 'completed',
            'imported_by' => $this->user->id,
        ]);

        AuditLog::create([
            'user_id'      => $this->user->id,
            'module'       => 'finance_import',
            'action'       => 'confirm_import',
            'reference_id' => $batch->id,
            'old_data'     => null,
            'new_data'     => [
                'total_rows'   => 10,
                'success_rows' => 10,
                'failed_rows'  => 0,
            ],
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/finance/import/history');

        $response->assertOk();
        $this->assertIsArray($response->json());
        $this->assertNotEmpty($response->json());

        $first = collect($response->json())->firstWhere('id', $batch->id);
        $this->assertNotNull($first);
        $this->assertEquals('history_test.xlsx', $first['filename']);
        $this->assertEquals('completed', $first['status']);
        $this->assertEquals(10, $first['total_rows']);
        $this->assertEquals(10, $first['success_rows']);
        $this->assertEquals(0, $first['failed_rows']);
        $this->assertEquals($this->user->name, $first['user']);
    }

    /**
     * Test 7: Detail error tampil.
     */
    public function test_import_history_detail_shows_errors(): void
    {
        $batch = ImportBatch::create([
            'file_name'   => 'failed_accounts.xlsx',
            'module'      => 'accounts',
            'status'      => 'failed',
            'imported_by' => $this->user->id,
        ]);

        ImportError::create([
            'batch_id'      => $batch->id,
            'row_number'    => 10,
            'error_message' => 'Account code already exists: 1112',
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/finance/import/history/' . $batch->id);

        $response->assertOk()
            ->assertJson([
                'batch' => [
                    'filename' => 'failed_accounts.xlsx',
                    'status'   => 'failed',
                ],
                'errors' => [
                    [
                        'row'     => 10,
                        'message' => 'Account code already exists: 1112',
                        'data'    => '',
                    ]
                ],
            ]);
    }

    /**
     * Test 8: Audit log tersimpan untuk setiap aksi management.
     */
    public function test_audit_logs_are_saved_for_all_management_actions(): void
    {
        // 1. Template
        $this->actingAs($this->user, 'sanctum')->get('/api/v1/finance/import/accounts/template');
        $this->assertDatabaseHas('audit_logs', [
            'module' => 'finance_import',
            'action' => 'template_download',
        ]);

        // 2. Preview
        $unique = uniqid();
        $file = $this->createExcelFile([
            ['Kode Akun', 'Nama Akun', 'Level', 'Parent Akun', 'Jenis Akun', 'Saldo Normal', 'Kategori Laporan', 'Status'],
            ['1234-AUDIT-' . $unique, 'Akun Audit', 1, '', 'asset', 'debit', 'Aset', 'Aktif'],
        ]);
        $previewRes = $this->actingAs($this->user, 'sanctum')->post('/api/v1/finance/import/accounts/preview', ['file' => $file]);
        $token = $previewRes->json('data.batch_token');

        $this->assertDatabaseHas('audit_logs', [
            'module' => 'finance_import',
            'action' => 'preview_accounts',
        ]);

        // 3. Confirm
        $this->actingAs($this->user, 'sanctum')->postJson('/api/v1/finance/import/accounts/confirm', ['batch_token' => $token]);
        $this->assertDatabaseHas('audit_logs', [
            'module' => 'finance_import',
            'action' => 'confirm_import',
        ]);

        // 4. View History
        $this->actingAs($this->user, 'sanctum')->getJson('/api/v1/finance/import/history');
        $this->assertDatabaseHas('audit_logs', [
            'module' => 'finance_import',
            'action' => 'view_history',
        ]);
    }
}
