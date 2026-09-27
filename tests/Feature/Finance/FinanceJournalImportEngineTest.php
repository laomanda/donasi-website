<?php

namespace Tests\Feature\Finance;

use App\Models\Account;
use App\Models\AccountingPeriod;
use App\Models\AuditLog;
use App\Models\ImportBatch;
use App\Models\JournalEntry;
use App\Models\Program;
use App\Models\User;
use App\Services\GeneralLedgerService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class FinanceJournalImportEngineTest extends TestCase
{
    use DatabaseTransactions;

    protected User $user;
    protected AccountingPeriod $period;
    protected Account $debitAccount;
    protected Account $creditAccount;
    protected Program $program;
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

        // Open Accounting Period for 2026
        $this->period = AccountingPeriod::where('status', 'open')
            ->where('start_date', '<=', '2026-01-01')
            ->where('end_date', '>=', '2026-12-31')
            ->first() ?? AccountingPeriod::create([
                'name'       => 'Tahun 2026',
                'start_date' => '2026-01-01',
                'end_date'   => '2026-12-31',
                'status'     => 'open',
            ]);

        // Debit Account (1112 - Bank BSI)
        $this->debitAccount = Account::where('code', '1112')->first() ?? Account::create([
            'code'           => '1112',
            'name'           => 'Bank BSI - Rekening Wakaf',
            'account_type'   => 'asset',
            'normal_balance' => 'debit',
            'is_active'      => true,
        ]);

        // Credit Account (4110 - Penerimaan Wakaf Uang - Abadi)
        $this->creditAccount = Account::where('code', '4110')->first() ?? Account::create([
            'code'           => '4110',
            'name'           => 'Penerimaan Wakaf Uang - Abadi',
            'account_type'   => 'revenue',
            'normal_balance' => 'credit',
            'is_active'      => true,
        ]);

        // Program
        $this->program = Program::firstWhere('title', 'Program Pendidikan') ?? Program::create([
            'title'             => 'Program Pendidikan',
            'slug'              => 'program-pendidikan-' . uniqid(),
            'category'          => 'Pendidikan',
            'short_description' => 'Ringkasan Program Pendidikan',
            'description'       => 'Program Bantuan Pendidikan Wakaf',
            'status'            => 'published',
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
     * Helper to create an Excel file with JU sheet.
     */
    protected function createJournalExcel(array $rows, string $sheetTitle = 'JU'): UploadedFile
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle($sheetTitle);
        $sheet->fromArray($rows);

        $tempFile = tempnam(sys_get_temp_dir(), 'test_ju_') . '.xlsx';
        $this->tempFiles[] = $tempFile;

        $writer = new Xlsx($spreadsheet);
        $writer->save($tempFile);

        return new UploadedFile(
            $tempFile,
            'template_jurnal_umum.xlsx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            null,
            true
        );
    }

    /**
     * Test 1: Template JU berhasil dibuat.
     */
    public function test_template_ju_is_generated_successfully(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->get('/api/v1/finance/import/journals/template');

        $response->assertOk();
        $disposition = (string) $response->headers->get('content-disposition');
        $this->assertStringContainsString('template_jurnal_umum.xlsx', $disposition);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $this->user->id,
            'module'  => 'finance_import',
            'action'  => 'template_download',
        ]);
    }

    /**
     * Test 2: Preview valid berhasil.
     */
    public function test_preview_valid_journal_succeeds(): void
    {
        $unique = uniqid();
        $journalNumber = 'JU-PV-' . $unique;

        $file = $this->createJournalExcel([
            ['Nomor Jurnal', 'Tanggal', 'Kode Akun', 'Nama Akun', 'Keterangan', 'Program', 'Debit', 'Kredit'],
            [$journalNumber, '2026-01-01', $this->debitAccount->code, 'Bank BSI', 'Penerimaan Wakaf', 'Program Pendidikan', 10000000, 0],
            [$journalNumber, '2026-01-01', $this->creditAccount->code, 'Penerimaan Wakaf', 'Penerimaan Wakaf', 'Program Pendidikan', 0, 10000000],
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->post('/api/v1/finance/import/journals/preview', [
                'file' => $file,
            ]);

        $response->assertOk()
            ->assertJson([
                'status' => 'success',
                'data'   => [
                    'total_rows'      => 2,
                    'total_journals'  => 1,
                    'valid_journals'  => 1,
                    'failed_journals' => 0,
                    'errors'          => [],
                ],
            ]);

        $this->assertNotEmpty($response->json('data.batch_token'));
    }

    /**
     * Test 3: Preview tidak insert database.
     */
    public function test_preview_does_not_insert_database(): void
    {
        $unique = uniqid();
        $journalNumber = 'JU-NO-INSERT-' . $unique;

        $file = $this->createJournalExcel([
            ['Nomor Jurnal', 'Tanggal', 'Kode Akun', 'Nama Akun', 'Keterangan', 'Program', 'Debit', 'Kredit'],
            [$journalNumber, '2026-01-01', $this->debitAccount->code, 'Bank BSI', 'Uji Preview Saja', 'Program Pendidikan', 5000000, 0],
            [$journalNumber, '2026-01-01', $this->creditAccount->code, 'Penerimaan Wakaf', 'Uji Preview Saja', 'Program Pendidikan', 0, 5000000],
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->post('/api/v1/finance/import/journals/preview', [
                'file' => $file,
            ]);

        $response->assertOk();

        // Must NOT create journal entry in DB!
        $this->assertDatabaseMissing('journal_entries', ['journal_number' => $journalNumber]);

        // Must NOT create an import batch!
        $this->assertDatabaseMissing('import_batches', ['file_name' => 'template_jurnal_umum.xlsx']);
    }

    /**
     * Test 4: Account tidak ditemukan ditolak.
     */
    public function test_account_not_found_is_rejected(): void
    {
        $unique = uniqid();
        $journalNumber = 'JU-BAD-ACC-' . $unique;

        $file = $this->createJournalExcel([
            ['Nomor Jurnal', 'Tanggal', 'Kode Akun', 'Nama Akun', 'Keterangan', 'Program', 'Debit', 'Kredit'],
            [$journalNumber, '2026-01-01', '99999999', 'Akun Fiktif', 'Gagal', 'Program Pendidikan', 1000000, 0],
            [$journalNumber, '2026-01-01', $this->creditAccount->code, 'Penerimaan Wakaf', 'Gagal', 'Program Pendidikan', 0, 1000000],
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/finance/import/journals/preview', [
                'file' => $file,
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'status' => 'failed',
                'data'   => [
                    'total_rows'      => 2,
                    'total_journals'  => 1,
                    'valid_journals'  => 0,
                    'failed_journals' => 1,
                ],
            ]);

        $errorsJson = json_encode($response->json('data.errors'));
        $this->assertStringContainsString('Account code not found', $errorsJson);
    }

    /**
     * Test 5: Balanced journal berhasil import (creates draft & posts to posted).
     */
    public function test_balanced_journal_imports_and_posts_successfully(): void
    {
        $unique = uniqid();
        $journalNumber = 'JU-OK-' . $unique;

        $file = $this->createJournalExcel([
            ['Nomor Jurnal', 'Tanggal', 'Kode Akun', 'Nama Akun', 'Keterangan', 'Program', 'Debit', 'Kredit'],
            [$journalNumber, '2026-01-01', $this->debitAccount->code, 'Bank BSI', 'Wakaf Tunai Berhasil', 'Program Pendidikan', 15000000, 0],
            [$journalNumber, '2026-01-01', $this->creditAccount->code, 'Penerimaan Wakaf', 'Wakaf Tunai Berhasil', 'Program Pendidikan', 0, 15000000],
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->post('/api/v1/finance/import/journals/confirm', [
                'file' => $file,
            ]);

        $response->assertOk()
            ->assertJson([
                'status'         => 'success',
                'total_rows'     => 2,
                'total_journals' => 1,
                'success_rows'   => 2,
                'failed_rows'    => 0,
            ]);

        // Must exist in journal_entries and status must be 'posted'
        $this->assertDatabaseHas('journal_entries', [
            'journal_number' => $journalNumber,
            'status'         => 'posted',
        ]);

        $entry = JournalEntry::where('journal_number', $journalNumber)->first();
        $this->assertNotNull($entry);
        $this->assertEquals(2, $entry->lines()->count());
        $this->assertEquals(15000000.0, (float) $entry->lines()->where('account_id', $this->debitAccount->id)->value('debit'));
        $this->assertEquals(15000000.0, (float) $entry->lines()->where('account_id', $this->creditAccount->id)->value('credit'));
    }

    /**
     * Test 6: Unbalanced journal gagal.
     */
    public function test_unbalanced_journal_fails(): void
    {
        $unique = uniqid();
        $journalNumber = 'JU-UNBAL-' . $unique;

        $file = $this->createJournalExcel([
            ['Nomor Jurnal', 'Tanggal', 'Kode Akun', 'Nama Akun', 'Keterangan', 'Program', 'Debit', 'Kredit'],
            [$journalNumber, '2026-01-01', $this->debitAccount->code, 'Bank BSI', 'Tidak Seimbang', 'Program Pendidikan', 10000000, 0],
            [$journalNumber, '2026-01-01', $this->creditAccount->code, 'Penerimaan Wakaf', 'Tidak Seimbang', 'Program Pendidikan', 0, 5000000],
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/finance/import/journals/confirm', [
                'file' => $file,
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'status' => 'failed',
            ]);

        $errorsJson = json_encode($response->json('errors'));
        $this->assertStringContainsString('Journal is not balanced', $errorsJson);

        // Must NOT create journal entry
        $this->assertDatabaseMissing('journal_entries', ['journal_number' => $journalNumber]);
    }

    /**
     * Test 7: Duplicate journal ditolak.
     */
    public function test_duplicate_journal_is_rejected(): void
    {
        $unique = uniqid();
        $journalNumber = 'JU-DUP-' . $unique;

        // Create existing journal in DB
        JournalEntry::create([
            'accounting_period_id' => $this->period->id,
            'journal_number'       => $journalNumber,
            'transaction_date'     => '2026-01-01',
            'reference_type'       => 'manual',
            'description'          => 'Existing Journal',
            'status'               => 'posted',
            'created_by'           => $this->user->id,
        ]);

        $file = $this->createJournalExcel([
            ['Nomor Jurnal', 'Tanggal', 'Kode Akun', 'Nama Akun', 'Keterangan', 'Program', 'Debit', 'Kredit'],
            [$journalNumber, '2026-01-01', $this->debitAccount->code, 'Bank BSI', 'Jurnal Duplikat', 'Program Pendidikan', 2000000, 0],
            [$journalNumber, '2026-01-01', $this->creditAccount->code, 'Penerimaan Wakaf', 'Jurnal Duplikat', 'Program Pendidikan', 0, 2000000],
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/finance/import/journals/preview', [
                'file' => $file,
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'status' => 'failed',
                'data'   => [
                    'failed_journals' => 1,
                ],
            ]);

        $errorsJson = json_encode($response->json('data.errors'));
        $this->assertStringContainsString('Duplicate journal number', $errorsJson);
    }

    /**
     * Test 8: Journal masuk General Ledger.
     */
    public function test_imported_journal_appears_in_general_ledger(): void
    {
        $unique = uniqid();
        $journalNumber = 'JU-GL-' . $unique;
        $amount = 25000000.0;

        $file = $this->createJournalExcel([
            ['Nomor Jurnal', 'Tanggal', 'Kode Akun', 'Nama Akun', 'Keterangan', 'Program', 'Debit', 'Kredit'],
            [$journalNumber, '2026-01-01', $this->debitAccount->code, 'Bank BSI', 'Masuk Buku Besar', 'Program Pendidikan', $amount, 0],
            [$journalNumber, '2026-01-01', $this->creditAccount->code, 'Penerimaan Wakaf', 'Masuk Buku Besar', 'Program Pendidikan', 0, $amount],
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->post('/api/v1/finance/import/journals/confirm', [
                'file' => $file,
            ]);

        $response->assertOk();

        // Verify with GeneralLedgerService
        $glService = app(GeneralLedgerService::class);
        $ledger = $glService->getLedger($this->debitAccount->id, $this->period->id);

        $foundInLedger = false;
        foreach ($ledger['accounts'] as $accLedger) {
            foreach ($accLedger['transactions'] as $tx) {
                if (($tx['journal_number'] ?? '') === $journalNumber) {
                    $foundInLedger = true;
                    $this->assertEquals($amount, (float) $tx['debit']);
                    break 2;
                }
            }
        }

        $this->assertTrue($foundInLedger, "Transaksi {$journalNumber} harus muncul di Buku Besar (General Ledger).");
    }

    /**
     * Test 9: Import batch tersimpan.
     */
    public function test_import_batch_is_persisted(): void
    {
        $unique = uniqid();
        $journalNumber = 'JU-BATCH-' . $unique;

        $file = $this->createJournalExcel([
            ['Nomor Jurnal', 'Tanggal', 'Kode Akun', 'Nama Akun', 'Keterangan', 'Program', 'Debit', 'Kredit'],
            [$journalNumber, '2026-01-01', $this->debitAccount->code, 'Bank BSI', 'Uji Batch', 'Program Pendidikan', 3000000, 0],
            [$journalNumber, '2026-01-01', $this->creditAccount->code, 'Penerimaan Wakaf', 'Uji Batch', 'Program Pendidikan', 0, 3000000],
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->post('/api/v1/finance/import/journals/confirm', [
                'file' => $file,
            ]);

        $response->assertOk();
        $batchId = $response->json('batch_id');

        $this->assertDatabaseHas('import_batches', [
            'id'          => $batchId,
            'module'      => 'journal_entries',
            'status'      => 'completed',
            'imported_by' => $this->user->id,
        ]);
    }

    /**
     * Test 10: Audit log tersimpan.
     */
    public function test_audit_log_is_recorded(): void
    {
        $unique = uniqid();
        $journalNumber = 'JU-AUDIT-' . $unique;

        $file = $this->createJournalExcel([
            ['Nomor Jurnal', 'Tanggal', 'Kode Akun', 'Nama Akun', 'Keterangan', 'Program', 'Debit', 'Kredit'],
            [$journalNumber, '2026-01-01', $this->debitAccount->code, 'Bank BSI', 'Uji Audit Log', 'Program Pendidikan', 4000000, 0],
            [$journalNumber, '2026-01-01', $this->creditAccount->code, 'Penerimaan Wakaf', 'Uji Audit Log', 'Program Pendidikan', 0, 4000000],
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->post('/api/v1/finance/import/journals/confirm', [
                'file' => $file,
            ]);

        $response->assertOk();
        $batchId = $response->json('batch_id');

        $this->assertDatabaseHas('audit_logs', [
            'user_id'      => $this->user->id,
            'module'       => 'finance_import',
            'action'       => 'confirm_journal_import',
            'reference_id' => $batchId,
        ]);
    }
}
