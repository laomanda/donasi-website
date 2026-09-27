<?php

namespace Tests\Feature\Finance;

use App\Models\Account;
use App\Models\AccountingPeriod;
use App\Models\Allocation;
use App\Models\AuditLog;
use App\Models\Donation;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\Program;
use App\Models\User;
use App\Services\AccountingPeriodService;
use App\Services\AllocationJournalService;
use App\Services\DonationJournalService;
use App\Services\FinanceJournalImportService;
use App\Services\FinanceOpeningBalanceImportService;
use App\Services\FinancialStatementService;
use App\Services\GeneralLedgerService;
use App\Services\JournalService;
use App\Services\TrialBalanceService;
use Database\Seeders\AccountSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Tests\TestCase;

class AccountingPeriodEngineTest extends TestCase
{
    protected AccountingPeriodService $periodService;

    protected JournalService $journalService;

    protected GeneralLedgerService $glService;

    protected TrialBalanceService $tbService;

    protected FinancialStatementService $fsService;

    protected FinanceJournalImportService $juImportService;

    protected FinanceOpeningBalanceImportService $obImportService;

    protected DonationJournalService $donationJournalService;

    protected AllocationJournalService $allocationJournalService;

    protected User $user;

    protected Account $debitAccount;

    protected Account $creditAccount;

    protected AccountingPeriod $openPeriod;

    protected AccountingPeriod $closedPeriod;

    protected function setUp(): void
    {
        parent::setUp();

        $this->periodService = app(AccountingPeriodService::class);
        $this->journalService = app(JournalService::class);
        $this->glService = app(GeneralLedgerService::class);
        $this->tbService = app(TrialBalanceService::class);
        $this->fsService = app(FinancialStatementService::class);
        $this->juImportService = app(FinanceJournalImportService::class);
        $this->obImportService = app(FinanceOpeningBalanceImportService::class);
        $this->donationJournalService = app(DonationJournalService::class);
        $this->allocationJournalService = app(AllocationJournalService::class);

        if (Account::count() === 0) {
            $this->seed(AccountSeeder::class);
        }

        // Seed roles & permissions
        $this->seed(RolePermissionSeeder::class);

        $this->user = User::first() ?? User::factory()->create();
        if (! $this->user->hasRole('superadmin')) {
            $this->user->assignRole('superadmin');
        }

        // Setup Accounts
        $this->debitAccount = Account::where('code', '1112')->first() ?? Account::create([
            'code' => '1112',
            'name' => 'Bank BSI - Rekening Wakaf',
            'account_type' => 'asset',
            'normal_balance' => 'debit',
            'is_active' => true,
        ]);

        $this->creditAccount = Account::where('code', '4110')->first() ?? Account::create([
            'code' => '4110',
            'name' => 'Penerimaan Wakaf Uang - Abadi',
            'account_type' => 'revenue',
            'normal_balance' => 'credit',
            'is_active' => true,
        ]);

        // Setup Periods
        $this->openPeriod = AccountingPeriod::where('name', 'Periode 2026')->first()
            ?? AccountingPeriod::where('status', 'open')->first()
            ?? AccountingPeriod::create([
                'name' => 'Periode 2026',
                'start_date' => '2026-01-01',
                'end_date' => '2026-12-31',
                'status' => 'open',
                'is_closed' => false,
            ]);

        $this->openPeriod->update(['is_closed' => false, 'status' => 'open']);

        $this->closedPeriod = AccountingPeriod::where('name', 'Periode 2025')->first()
            ?? AccountingPeriod::create([
                'name' => 'Periode 2025',
                'start_date' => '2025-01-01',
                'end_date' => '2025-12-31',
                'status' => 'closed',
                'is_closed' => true,
                'closed_at' => '2025-12-31 23:59:59',
                'closed_by' => $this->user->id,
            ]);

        $this->closedPeriod->update(['is_closed' => true, 'status' => 'closed']);
    }

    // ==========================================
    // AUTHORIZATION TESTS (1 - 4)
    // ==========================================

    /**
     * 1. View permission cannot close accounting period.
     */
    public function test_view_permission_cannot_close_accounting_period(): void
    {
        $viewer = User::factory()->create(['is_active' => true]);
        $viewer->givePermissionTo('view reports');

        $testPeriod = AccountingPeriod::create([
            'name' => 'Periode Auth Test 1',
            'start_date' => '2016-01-01',
            'end_date' => '2016-12-31',
            'status' => 'open',
            'is_closed' => false,
        ]);

        $response = $this->actingAs($viewer, 'sanctum')
            ->postJson("/api/v1/finance/accounting-periods/{$testPeriod->id}/close");

        $response->assertStatus(403);
        $this->assertFalse($testPeriod->fresh()->isClosed());
    }

    /**
     * 2. Manage donations cannot close accounting period.
     */
    public function test_manage_donations_cannot_close_accounting_period(): void
    {
        $donorStaff = User::factory()->create(['is_active' => true]);
        $donorStaff->givePermissionTo('manage donations');

        $testPeriod = AccountingPeriod::create([
            'name' => 'Periode Auth Test 2',
            'start_date' => '2015-01-01',
            'end_date' => '2015-12-31',
            'status' => 'open',
            'is_closed' => false,
        ]);

        $response = $this->actingAs($donorStaff, 'sanctum')
            ->postJson("/api/v1/finance/accounting-periods/{$testPeriod->id}/close");

        $response->assertStatus(403);
        $this->assertFalse($testPeriod->fresh()->isClosed());
    }

    /**
     * 3. Keuangan can close accounting period.
     */
    public function test_keuangan_can_close_accounting_period(): void
    {
        $keuanganUser = User::factory()->create(['is_active' => true]);
        $keuanganUser->assignRole('keuangan');

        $testPeriod = AccountingPeriod::create([
            'name' => 'Periode Keuangan Close',
            'start_date' => '2014-01-01',
            'end_date' => '2014-12-31',
            'status' => 'open',
            'is_closed' => false,
        ]);

        $response = $this->actingAs($keuanganUser, 'sanctum')
            ->postJson("/api/v1/finance/accounting-periods/{$testPeriod->id}/close");

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'period_id' => $testPeriod->id,
                    'status' => 'closed',
                    'closed_by' => $keuanganUser->id,
                ],
            ]);

        $this->assertTrue($testPeriod->fresh()->isClosed());
    }

    /**
     * 4. Superadmin can close accounting period.
     */
    public function test_superadmin_can_close_accounting_period(): void
    {
        $superadminUser = User::factory()->create(['is_active' => true]);
        $superadminUser->assignRole('superadmin');

        $testPeriod = AccountingPeriod::create([
            'name' => 'Periode Superadmin Close',
            'start_date' => '2013-01-01',
            'end_date' => '2013-12-31',
            'status' => 'open',
            'is_closed' => false,
        ]);

        $response = $this->actingAs($superadminUser, 'sanctum')
            ->postJson("/api/v1/finance/accounting-periods/{$testPeriod->id}/close");

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'period_id' => $testPeriod->id,
                    'status' => 'closed',
                    'closed_by' => $superadminUser->id,
                ],
            ]);

        $this->assertTrue($testPeriod->fresh()->isClosed());
    }

    // ==========================================
    // STATE CONSISTENCY TESTS (5 - 7)
    // ==========================================

    /**
     * 5. Open period has consistent state (status = open, is_closed = false).
     */
    public function test_open_period_has_consistent_state(): void
    {
        $period = AccountingPeriod::create([
            'name' => 'Consistency Open',
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
            'status' => 'open',
            'is_closed' => false,
        ]);

        $this->assertEquals('open', $period->status);
        $this->assertFalse($period->is_closed);
        $this->assertTrue($period->isOpen());
        $this->assertFalse($period->isClosed());
    }

    /**
     * 6. Closed period has consistent state (status = closed, is_closed = true).
     */
    public function test_closed_period_has_consistent_state(): void
    {
        $period = AccountingPeriod::create([
            'name' => 'Consistency Closed',
            'start_date' => '2025-01-01',
            'end_date' => '2025-12-31',
            'status' => 'closed',
            'is_closed' => true,
        ]);

        $this->assertEquals('closed', $period->status);
        $this->assertTrue($period->is_closed);
        $this->assertFalse($period->isOpen());
        $this->assertTrue($period->isClosed());
    }

    /**
     * 7. Period cannot become contradictory.
     */
    public function test_period_cannot_become_contradictory(): void
    {
        $period = AccountingPeriod::create([
            'name' => 'Anti Contradiction Test',
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
            'status' => 'open',
            'is_closed' => false,
        ]);

        // Attempt contradictory 1: is_closed = true with status = open
        $period->is_closed = true;
        $this->assertEquals('closed', $period->status);
        $this->assertTrue($period->is_closed);
        $period->save();
        $period->refresh();
        $this->assertEquals('closed', $period->status);
        $this->assertTrue($period->is_closed);

        // Attempt contradictory 2: status = open with is_closed = true
        $period->status = 'open';
        $this->assertEquals('open', $period->status);
        $this->assertFalse($period->is_closed);
        $period->save();
        $period->refresh();
        $this->assertEquals('open', $period->status);
        $this->assertFalse($period->is_closed);

        // Raw attribute check
        $period->setRawAttributes(array_merge($period->getAttributes(), [
            'status' => 'open',
            'is_closed' => 1,
        ]));
        $this->assertEquals('closed', $period->status);
        $this->assertTrue($period->is_closed);

        $period->setRawAttributes(array_merge($period->getAttributes(), [
            'status' => 'closed',
            'is_closed' => 0,
        ]));
        $this->assertEquals('closed', $period->status);
        $this->assertTrue($period->is_closed);
    }

    // ==========================================
    // DONATION INTEGRATION TESTS (8 - 12)
    // ==========================================

    /**
     * 8. Paid donation in open period creates journal.
     */
    public function test_paid_donation_in_open_period_creates_journal(): void
    {
        $program = Program::first() ?? Program::create([
            'slug' => 'prog-open-'.uniqid(),
            'title' => 'Program Donasi Terbuka',
            'category' => 'Pendidikan',
            'target_amount' => 10000000,
            'collected_amount' => 0,
            'status' => 'active',
        ]);

        $donation = Donation::create([
            'user_id' => $this->user->id,
            'program_id' => $program->id,
            'donation_code' => 'DON-OPEN-'.uniqid(),
            'donor_name' => 'Donatur Dermawan',
            'amount' => 500000,
            'payment_source' => 'manual',
            'payment_channel' => 'bsi',
            'status' => 'paid',
            'paid_at' => '2026-06-15 10:00:00', // Open period
        ]);

        $journal = $this->donationJournalService->recordDonationJournal($donation);

        $this->assertNotNull($journal);
        $this->assertEquals('donation', $journal->reference_type);
        $this->assertEquals($donation->id, $journal->reference_id);
        $this->assertEquals(500000, $journal->total_debit);
    }

    /**
     * 9. Paid donation in closed period does not create journal.
     */
    public function test_paid_donation_in_closed_period_does_not_create_journal(): void
    {
        $program = Program::first() ?? Program::create([
            'slug' => 'prog-closed-'.uniqid(),
            'title' => 'Program Donasi Closed',
            'category' => 'Pendidikan',
            'target_amount' => 10000000,
            'collected_amount' => 0,
            'status' => 'active',
        ]);

        $donation = Donation::create([
            'user_id' => $this->user->id,
            'program_id' => $program->id,
            'donation_code' => 'DON-CLOSED-'.uniqid(),
            'donor_name' => 'Donatur Periode Tutup',
            'amount' => 450000,
            'payment_source' => 'manual',
            'payment_channel' => 'bsi',
            'status' => 'paid',
            'paid_at' => '2025-05-15 10:00:00', // Closed period
        ]);

        $journal = $this->donationJournalService->recordDonationJournal($donation);

        $this->assertNull($journal);
        $this->assertDatabaseMissing('journal_entries', [
            'reference_type' => 'donation',
            'reference_id' => $donation->id,
        ]);
    }

    /**
     * 10. Closed-period donation creates audit trail for rejected journal.
     */
    public function test_closed_period_donation_creates_audit_trail_for_rejected_journal(): void
    {
        $program = Program::first() ?? Program::create([
            'slug' => 'prog-audit-'.uniqid(),
            'title' => 'Program Audit Trail',
            'category' => 'Sosial',
            'target_amount' => 10000000,
            'collected_amount' => 0,
            'status' => 'active',
        ]);

        $donation = Donation::create([
            'user_id' => $this->user->id,
            'program_id' => $program->id,
            'donation_code' => 'DON-AUDIT-'.uniqid(),
            'donor_name' => 'Donatur Audit',
            'amount' => 750000,
            'payment_source' => 'manual',
            'payment_channel' => 'mandiri',
            'status' => 'paid',
            'paid_at' => '2025-08-20 12:00:00', // Closed period
        ]);

        $journal = $this->donationJournalService->recordDonationJournal($donation);
        $this->assertNull($journal);

        $auditLog = AuditLog::where('module', 'donation')
            ->where('action', 'journal_rejected_closed_period')
            ->where('reference_id', $donation->id)
            ->first();

        $this->assertNotNull($auditLog, 'Audit trail must be created when donation journal is rejected due to closed period.');
        $this->assertEquals($donation->id, $auditLog->new_data['donation_id']);
        $this->assertEquals(750000, $auditLog->new_data['amount']);
        $this->assertEquals('2025-08-20', $auditLog->new_data['transaction_date']);
        $this->assertEquals('Accounting period is closed', $auditLog->new_data['reason']);
    }

    /**
     * 11. Donation journal remains idempotent.
     */
    public function test_donation_journal_remains_idempotent(): void
    {
        $program = Program::first();

        $donation = Donation::create([
            'user_id' => $this->user->id,
            'program_id' => $program->id,
            'donation_code' => 'DON-IDEM-'.uniqid(),
            'donor_name' => 'Donatur Idempotent',
            'amount' => 300000,
            'payment_source' => 'manual',
            'payment_channel' => 'bsi',
            'status' => 'paid',
            'paid_at' => '2026-07-01 10:00:00',
        ]);

        $firstCall = $this->donationJournalService->recordDonationJournal($donation);
        $this->assertNotNull($firstCall);

        $secondCall = $this->donationJournalService->recordDonationJournal($donation);
        $this->assertEquals($firstCall->id, $secondCall->id);

        $count = JournalEntry::where('reference_type', 'donation')
            ->where('reference_id', $donation->id)
            ->count();
        $this->assertEquals(1, $count);
    }

    /**
     * 12. Paid donation cannot create duplicate journal.
     */
    public function test_paid_donation_cannot_create_duplicate_journal(): void
    {
        $program = Program::first();

        $donation = Donation::create([
            'user_id' => $this->user->id,
            'program_id' => $program->id,
            'donation_code' => 'DON-DUP-'.uniqid(),
            'donor_name' => 'Donatur Resave',
            'amount' => 200000,
            'payment_source' => 'manual',
            'payment_channel' => 'bsi',
            'status' => 'paid',
            'paid_at' => '2026-07-05 10:00:00',
        ]);

        $firstJournal = $this->donationJournalService->recordDonationJournal($donation);
        $this->assertNotNull($firstJournal);

        // Resaving donation
        $donation->update(['notes' => 'Catatan diupdate']);
        $donation->save();

        $count = JournalEntry::where('reference_type', 'donation')
            ->where('reference_id', $donation->id)
            ->count();

        $this->assertEquals(1, $count);
    }

    // ==========================================
    // PERIOD PROTECTION TESTS (13 - 20)
    // ==========================================

    /**
     * 13. Closed period rejects manual journal.
     */
    public function test_closed_period_rejects_manual_journal(): void
    {
        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('Accounting period is closed');

        $payload = [
            'transaction_date' => '2025-05-10',
            'accounting_period_id' => $this->closedPeriod->id,
            'description' => 'Manual journal in closed period',
            'journal_lines' => [
                ['account_id' => $this->debitAccount->id, 'debit' => 200000, 'credit' => 0],
                ['account_id' => $this->creditAccount->id, 'debit' => 0, 'credit' => 200000],
            ],
        ];

        $this->journalService->createJournal($payload, $this->user);
    }

    /**
     * 14. Closed period rejects journal posting.
     */
    public function test_closed_period_rejects_journal_posting(): void
    {
        $journal = JournalEntry::create([
            'accounting_period_id' => $this->closedPeriod->id,
            'journal_number' => 'JU-POST-CLOSED-'.uniqid(),
            'transaction_date' => '2025-05-10',
            'description' => 'Draft in closed period',
            'status' => 'draft',
            'created_by' => $this->user->id,
        ]);

        JournalEntryLine::create([
            'journal_entry_id' => $journal->id,
            'account_id' => $this->debitAccount->id,
            'debit' => 100000,
            'credit' => 0,
        ]);

        JournalEntryLine::create([
            'journal_entry_id' => $journal->id,
            'account_id' => $this->creditAccount->id,
            'debit' => 0,
            'credit' => 100000,
        ]);

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('Cannot post journal in closed accounting period');

        $this->journalService->postJournal($journal, $this->user);
    }

    /**
     * 15. Closed period rejects JU import.
     */
    public function test_closed_period_rejects_ju_import(): void
    {
        $file = $this->createJournalImportExcel([
            ['JU-TEST-CLOSED-001', '2025-06-15', $this->debitAccount->code, 'Penerimaan', '500000', '0'],
            ['JU-TEST-CLOSED-001', '2025-06-15', $this->creditAccount->code, 'Penerimaan', '0', '500000'],
        ]);

        $result = $this->juImportService->importJournalEntries($file, $this->user);

        $this->assertEquals('failed', $result['status']);
        $errorFound = collect($result['errors'])->contains(function ($err) {
            return str_contains($err['message'], 'closed') || str_contains($err['message'], 'Accounting period is closed');
        });
        $this->assertTrue($errorFound, 'Import JU harus gagal ketika tanggal transaksi berada di periode closed.');
    }

    /**
     * 16. Closed period rejects opening balance import.
     */
    public function test_closed_period_rejects_opening_balance_import(): void
    {
        $file = $this->createOpeningBalanceExcel([
            [$this->debitAccount->code, $this->debitAccount->name, 'debit', 1000000],
            [$this->creditAccount->code, $this->creditAccount->name, 'credit', 1000000],
        ]);

        $result = $this->obImportService->importOpeningBalance($file, $this->closedPeriod->id, $this->user);

        $this->assertEquals('failed', $result['status']);
        $errorFound = collect($result['errors'])->contains(function ($err) {
            return str_contains($err['message'], 'closed');
        });
        $this->assertTrue($errorFound, 'Opening Balance import harus ditolak untuk periode yang closed.');
    }

    /**
     * 17. Closed period rejects allocation journal.
     */
    public function test_closed_period_rejects_allocation_journal(): void
    {
        $program = Program::first() ?? Program::create([
            'slug' => 'prog-alloc-test-'.uniqid(),
            'title' => 'Program Penyaluran Closed Test',
            'category' => 'Sosial',
            'target_amount' => 10000000,
            'collected_amount' => 0,
            'status' => 'active',
        ]);

        $allocation = Allocation::create([
            'program_id' => $program->id,
            'user_id' => $this->user->id,
            'amount' => 250000,
            'description' => 'Penyaluran pada periode closed',
            'allocated_at' => '2025-07-20 10:00:00', // Falls in closedPeriod
        ]);

        $journal = $this->allocationJournalService->recordAllocationJournal($allocation);

        $this->assertNull($journal, 'Allocation journal integration must not create journal in closed period.');
        $this->assertDatabaseMissing('journal_entries', [
            'reference_type' => 'allocation',
            'reference_id' => $allocation->id,
        ]);
    }

    /**
     * 18. Closed period remains readable by General Ledger.
     */
    public function test_closed_period_remains_readable_by_general_ledger(): void
    {
        $journal = JournalEntry::create([
            'accounting_period_id' => $this->closedPeriod->id,
            'journal_number' => 'JU-CLOSED-GL-'.uniqid(),
            'transaction_date' => '2025-06-15',
            'description' => 'Transaksi Periode Tutup untuk GL',
            'status' => 'posted',
            'created_by' => $this->user->id,
        ]);

        JournalEntryLine::create([
            'journal_entry_id' => $journal->id,
            'account_id' => $this->debitAccount->id,
            'debit' => 750000,
            'credit' => 0,
        ]);

        JournalEntryLine::create([
            'journal_entry_id' => $journal->id,
            'account_id' => $this->creditAccount->id,
            'debit' => 0,
            'credit' => 750000,
        ]);

        $ledger = $this->glService->getLedger($this->debitAccount->id, $this->closedPeriod->id);

        $this->assertNotNull($ledger);
        $transactions = collect($ledger['account']['transactions']);
        $found = $transactions->firstWhere('journal_entry_id', $journal->id);
        $this->assertNotNull($found, 'Closed period transactions must be fully readable by General Ledger.');
    }

    /**
     * 19. Closed period remains readable by Trial Balance.
     */
    public function test_closed_period_remains_readable_by_trial_balance(): void
    {
        $tb = $this->tbService->getTrialBalance($this->closedPeriod->id);

        $this->assertIsArray($tb);
        $this->assertArrayHasKey('accounts', $tb);
        $this->assertArrayHasKey('is_balanced', $tb);
    }

    /**
     * 20. Closed period remains readable by Financial Statements.
     */
    public function test_closed_period_remains_readable_by_financial_statements(): void
    {
        $balanceSheet = $this->fsService->getBalanceSheet($this->closedPeriod->id);
        $this->assertNotNull($balanceSheet);
        $this->assertArrayHasKey('assets', $balanceSheet);
        $this->assertArrayHasKey('liabilities', $balanceSheet);

        $activityStatement = $this->fsService->getActivityStatement($this->closedPeriod->id);
        $this->assertNotNull($activityStatement);
        $this->assertArrayHasKey('revenues', $activityStatement);
    }

    // ==========================================
    // CLOSING TESTS (21 - 25)
    // ==========================================

    /**
     * 21. Cannot close already closed period.
     */
    public function test_cannot_close_already_closed_period(): void
    {
        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('Accounting period is already closed');

        $this->periodService->closePeriod($this->closedPeriod, $this->user);
    }

    /**
     * 22. Draft journal prevents closing.
     */
    public function test_draft_journal_prevents_closing(): void
    {
        $testPeriod = AccountingPeriod::create([
            'name' => 'Periode Ada Draft',
            'start_date' => '2019-01-01',
            'end_date' => '2019-12-31',
            'status' => 'open',
            'is_closed' => false,
        ]);

        JournalEntry::create([
            'accounting_period_id' => $testPeriod->id,
            'journal_number' => 'JU-DRAFT-'.uniqid(),
            'transaction_date' => '2019-06-01',
            'description' => 'Unresolved Draft Journal',
            'status' => 'draft',
            'created_by' => $this->user->id,
        ]);

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('There are unresolved draft journals');

        $this->periodService->closePeriod($testPeriod, $this->user);
    }

    /**
     * 23. Unbalanced journal prevents closing.
     */
    public function test_unbalanced_journal_prevents_closing(): void
    {
        $testPeriod = AccountingPeriod::create([
            'name' => 'Periode Unbalanced',
            'start_date' => '2020-01-01',
            'end_date' => '2020-12-31',
            'status' => 'open',
            'is_closed' => false,
        ]);

        $journal = JournalEntry::create([
            'accounting_period_id' => $testPeriod->id,
            'journal_number' => 'JU-UNBALANCED-'.uniqid(),
            'transaction_date' => '2020-05-01',
            'description' => 'Unbalanced Entry',
            'status' => 'posted',
            'created_by' => $this->user->id,
        ]);

        JournalEntryLine::create([
            'journal_entry_id' => $journal->id,
            'account_id' => $this->debitAccount->id,
            'debit' => 1000000,
            'credit' => 0,
        ]);

        JournalEntryLine::create([
            'journal_entry_id' => $journal->id,
            'account_id' => $this->creditAccount->id,
            'debit' => 0,
            'credit' => 500000, // Unbalanced
        ]);

        $this->expectException(ValidationException::class);

        $this->periodService->closePeriod($testPeriod, $this->user);
    }

    /**
     * 24. Concurrent close does not corrupt state.
     */
    public function test_concurrent_close_does_not_corrupt_state(): void
    {
        $concurrentPeriod = AccountingPeriod::create([
            'name' => 'Periode Uji Konkurensi',
            'start_date' => '2018-01-01',
            'end_date' => '2018-12-31',
            'status' => 'open',
            'is_closed' => false,
        ]);

        // First attempt succeeds
        $firstResult = $this->periodService->closePeriod($concurrentPeriod, $this->user);
        $this->assertTrue($firstResult->isClosed());
        $this->assertEquals('closed', $firstResult->status);

        // Second immediate attempt must fail gracefully
        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('Accounting period is already closed');

        $this->periodService->closePeriod($concurrentPeriod, $this->user);
    }

    /**
     * 25. Close creates audit log.
     */
    public function test_close_creates_audit_log(): void
    {
        $periodToClose = AccountingPeriod::create([
            'name' => 'Periode Uji Audit 25',
            'start_date' => '2021-01-01',
            'end_date' => '2021-12-31',
            'status' => 'open',
            'is_closed' => false,
        ]);

        $closed = $this->periodService->closePeriod($periodToClose, $this->user);

        $auditLog = AuditLog::where('module', 'finance_period')
            ->where('action', 'close_period')
            ->where('reference_id', $closed->id)
            ->first();

        $this->assertNotNull($auditLog);
        $this->assertEquals($this->user->id, $auditLog->user_id);
        $this->assertEquals('closed', $auditLog->new_data['new_status']);
    }

    // ==========================================
    // ADDITIONAL HELPER & API TESTS
    // ==========================================

    /**
     * Open period can resolve by transaction date.
     */
    public function test_open_period_can_resolve_by_transaction_date(): void
    {
        $resolved = $this->periodService->resolvePeriodByDate('2026-06-15');

        $this->assertNotNull($resolved);
        $this->assertEquals($this->openPeriod->id, $resolved->id);
        $this->assertTrue($resolved->isOpen());
        $this->assertFalse($resolved->isClosed());
    }

    /**
     * Transaction date outside all periods is rejected.
     */
    public function test_transaction_date_outside_all_periods_is_rejected(): void
    {
        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('Accounting period not found for transaction date');

        $this->periodService->resolvePeriodByDate('2099-01-01');
    }

    /**
     * Posted journal remains immutable.
     */
    public function test_posted_journal_remains_immutable(): void
    {
        $payload = [
            'transaction_date' => '2026-04-10',
            'accounting_period_id' => $this->openPeriod->id,
            'description' => 'Transaksi awal sebelum di-post',
            'journal_lines' => [
                ['account_id' => $this->debitAccount->id, 'debit' => 300000, 'credit' => 0],
                ['account_id' => $this->creditAccount->id, 'debit' => 0, 'credit' => 300000],
            ],
        ];

        $journal = $this->journalService->createJournal($payload, $this->user);
        $postedJournal = $this->journalService->postJournal($journal, $this->user);

        try {
            $postedJournal->update(['description' => 'Deskripsi diganti secara ilegal']);
            $this->fail('Posted journal update should have thrown an exception');
        } catch (\DomainException $e) {
            $this->assertStringContainsString('Posted journal is immutable', $e->getMessage());
        }

        try {
            $postedJournal->delete();
            $this->fail('Posted journal delete should have thrown an exception');
        } catch (\DomainException $e) {
            $this->assertStringContainsString('Posted journal is immutable', $e->getMessage());
        }
    }

    /**
     * API List Accounting Periods returns expected structure.
     */
    public function test_api_list_accounting_periods_returns_expected_structure(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/finance/accounting-periods');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    '*' => [
                        'id',
                        'period_name',
                        'period_type',
                        'start_date',
                        'end_date',
                        'is_closed',
                        'closed_at',
                        'closed_by',
                        'status',
                    ],
                ],
            ]);
    }

    /**
     * API Get Accounting Period Detail returns metrics.
     */
    public function test_api_get_accounting_period_detail_returns_metrics(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson("/api/v1/finance/accounting-periods/{$this->openPeriod->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'id',
                    'period_name',
                    'start_date',
                    'end_date',
                    'status',
                    'is_closed',
                    'journal_count',
                    'posted_journal_count',
                    'draft_journal_count',
                    'total_debit',
                    'total_credit',
                    'is_balanced',
                    'closed_at',
                    'closed_by',
                ],
            ]);
    }

    /**
     * Helper to generate Excel file for Journal (JU) Import.
     */
    protected function createJournalImportExcel(array $rows): UploadedFile
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('JU');

        $headers = ['No', 'Nomor Jurnal', 'Tanggal', 'Kode Akun', 'Keterangan', 'Debit', 'Kredit'];
        $sheet->fromArray([$headers], null, 'A1');

        $dataRows = [];
        $no = 1;
        foreach ($rows as $r) {
            $dataRows[] = [
                $no++,
                $r[0], // journal_number
                $r[1], // date
                $r[2], // account code
                $r[3], // description
                $r[4], // debit
                $r[5], // credit
            ];
        }

        $sheet->fromArray($dataRows, null, 'A2');

        $tempPath = tempnam(sys_get_temp_dir(), 'ju_test_').'.xlsx';
        $writer = new Xlsx($spreadsheet);
        $writer->save($tempPath);

        return new UploadedFile($tempPath, 'ju_test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', null, true);
    }

    /**
     * Helper to generate Excel file for Opening Balance Import.
     */
    protected function createOpeningBalanceExcel(array $rows): UploadedFile
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('OPENING BALANCE');

        $headers = ['No', 'Kode Akun', 'Nama Akun', 'Saldo Normal', 'Saldo Awal'];
        $sheet->fromArray([$headers], null, 'A1');

        $dataRows = [];
        $no = 1;
        foreach ($rows as $r) {
            $dataRows[] = [
                $no++,
                $r[0], // code
                $r[1], // name
                $r[2], // normal_balance
                $r[3], // amount
            ];
        }

        $sheet->fromArray($dataRows, null, 'A2');

        $tempPath = tempnam(sys_get_temp_dir(), 'ob_test_').'.xlsx';
        $writer = new Xlsx($spreadsheet);
        $writer->save($tempPath);

        return new UploadedFile($tempPath, 'ob_test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', null, true);
    }
}
