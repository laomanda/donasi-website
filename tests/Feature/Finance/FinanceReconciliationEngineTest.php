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
use App\Services\AllocationJournalService;
use App\Services\DonationJournalService;
use App\Services\FinanceReconciliationService;
use App\Services\JournalService;
use Database\Seeders\AccountSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class FinanceReconciliationEngineTest extends TestCase
{
    use DatabaseTransactions;

    protected FinanceReconciliationService $reconciliationService;

    protected JournalService $journalService;

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

        $this->reconciliationService = app(FinanceReconciliationService::class);
        $this->journalService = app(JournalService::class);
        $this->donationJournalService = app(DonationJournalService::class);
        $this->allocationJournalService = app(AllocationJournalService::class);

        if (Account::count() === 0) {
            $this->seed(AccountSeeder::class);
        }

        $this->seed(RolePermissionSeeder::class);

        $this->user = User::first() ?? User::factory()->create();
        if (! $this->user->hasRole('superadmin')) {
            $this->user->assignRole('superadmin');
        }

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
                'closed_at' => '2026-01-05 10:00:00',
            ]);

        // Clean up any test journal remnants that might have been left over
        DB::table('journal_entries')->where(function ($q) {
            $q->where('journal_number', 'LIKE', 'JU-UNBALANCED-%')
                ->orWhere('journal_number', 'LIKE', 'JU-DUP-%')
                ->orWhere('journal_number', 'LIKE', 'JU-INVACC-%')
                ->orWhere('journal_number', 'LIKE', 'JU-MISMATCH-%')
                ->orWhere('journal_number', 'LIKE', 'JU-DON-%')
                ->orWhere('journal_number', 'LIKE', 'JU-CLOSED-ILLEGAL-%')
                ->orWhere('journal_number', 'LIKE', 'JU-DRAFT-%')
                ->orWhere('journal_number', 'LIKE', 'JU-VOID-%');
        })->delete();
    }

    /**
     * 1. Semua posted journal balanced
     */
    public function test_all_posted_journals_balanced(): void
    {
        $uniqueSuffix = uniqid();
        $this->journalService->createJournal([
            'transaction_date' => '2026-03-10',
            'accounting_period_id' => $this->openPeriod->id,
            'description' => "Balanced test {$uniqueSuffix}",
            'journal_lines' => [
                ['account_id' => $this->debitAccount->id, 'debit' => 1000000, 'credit' => 0],
                ['account_id' => $this->creditAccount->id, 'debit' => 0, 'credit' => 1000000],
            ],
        ]);

        $res = $this->reconciliationService->reconcile($this->openPeriod->id);

        $check = collect($res['data']['checks'])->firstWhere('check_code', 'JOURNAL_BALANCE');
        $this->assertNotNull($check);
        $this->assertEquals('passed', $check['status']);
        $this->assertNull($check['severity']);
    }

    /**
     * 2. Unbalanced journal terdeteksi
     */
    public function test_unbalanced_journal_detected(): void
    {
        // Insert an unbalanced posted journal directly into database to simulate anomaly
        $journalId = DB::table('journal_entries')->insertGetId([
            'accounting_period_id' => $this->openPeriod->id,
            'journal_number' => 'JU-UNBALANCED-'.uniqid(),
            'transaction_date' => '2026-03-11',
            'description' => 'Simulated unbalanced journal',
            'status' => 'posted',
            'created_by' => $this->user->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('journal_entry_lines')->insert([
            [
                'journal_entry_id' => $journalId,
                'account_id' => $this->debitAccount->id,
                'debit' => 5000000,
                'credit' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'journal_entry_id' => $journalId,
                'account_id' => $this->creditAccount->id,
                'debit' => 0,
                'credit' => 4000000, // unbalanced!
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $res = $this->reconciliationService->reconcile($this->openPeriod->id);

        $check = collect($res['data']['checks'])->firstWhere('check_code', 'JOURNAL_BALANCE');
        $this->assertNotNull($check);
        $this->assertEquals('failed', $check['status']);
        $this->assertEquals('critical', $check['severity']);
        $this->assertGreaterThan(0, $check['total_failed']);
        $this->assertEquals('critical', $res['data']['overall_status']);

        // Clean up
        DB::table('journal_entry_lines')->where('journal_entry_id', $journalId)->delete();
        DB::table('journal_entries')->where('id', $journalId)->delete();
    }

    /**
     * 3. Duplicate journal number terdeteksi
     */
    public function test_duplicate_journal_number_detected(): void
    {
        $dupNumber = 'JU-DUP-'.uniqid();

        DB::statement('ALTER TABLE journal_entries DROP INDEX journal_entries_journal_number_unique;');

        try {
            $id1 = DB::table('journal_entries')->insertGetId([
                'accounting_period_id' => $this->openPeriod->id,
                'journal_number' => $dupNumber,
                'transaction_date' => '2026-03-12',
                'description' => 'Dup 1',
                'status' => 'posted',
                'created_by' => $this->user->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $id2 = DB::table('journal_entries')->insertGetId([
                'accounting_period_id' => $this->openPeriod->id,
                'journal_number' => $dupNumber,
                'transaction_date' => '2026-03-12',
                'description' => 'Dup 2',
                'status' => 'posted',
                'created_by' => $this->user->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $res = $this->reconciliationService->reconcile($this->openPeriod->id);

            $check = collect($res['data']['checks'])->firstWhere('check_code', 'DUPLICATE_JOURNAL_NUMBER');
            $this->assertNotNull($check);
            $this->assertEquals('failed', $check['status']);
            $this->assertEquals('critical', $check['severity']);
        } finally {
            DB::table('journal_entries')->whereIn('id', [$id1 ?? 0, $id2 ?? 0])->delete();
            DB::statement('ALTER TABLE journal_entries ADD UNIQUE KEY journal_entries_journal_number_unique (journal_number);');
        }
    }

    /**
     * 4. Invalid account reference terdeteksi
     */
    public function test_invalid_account_reference_detected(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        try {
            $journalId = DB::table('journal_entries')->insertGetId([
                'accounting_period_id' => $this->openPeriod->id,
                'journal_number' => 'JU-INVACC-'.uniqid(),
                'transaction_date' => '2026-03-13',
                'description' => 'Invalid account line test',
                'status' => 'posted',
                'created_by' => $this->user->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $lineId = DB::table('journal_entry_lines')->insertGetId([
                'journal_entry_id' => $journalId,
                'account_id' => 99999999, // non-existent account
                'debit' => 1000000,
                'credit' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $res = $this->reconciliationService->reconcile($this->openPeriod->id);

            $check = collect($res['data']['checks'])->firstWhere('check_code', 'INVALID_ACCOUNT_REFERENCE');
            $this->assertNotNull($check);
            $this->assertEquals('failed', $check['status']);
            $this->assertEquals('critical', $check['severity']);
        } finally {
            DB::table('journal_entry_lines')->where('id', $lineId ?? 0)->delete();
            DB::table('journal_entries')->where('id', $journalId ?? 0)->delete();
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }
    }

    /**
     * 5. Orphan journal line terdeteksi
     */
    public function test_orphan_journal_line_detected(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        $lineId = DB::table('journal_entry_lines')->insertGetId([
            'journal_entry_id' => 99999999, // non-existent journal entry
            'account_id' => $this->debitAccount->id,
            'debit' => 500000,
            'credit' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $res = $this->reconciliationService->reconcile($this->openPeriod->id);

        $check = collect($res['data']['checks'])->firstWhere('check_code', 'ORPHAN_JOURNAL_LINES');
        $this->assertNotNull($check);
        $this->assertEquals('failed', $check['status']);
        $this->assertEquals('critical', $check['severity']);

        // Clean up
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('journal_entry_lines')->where('id', $lineId)->delete();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }

    /**
     * 6. Journal period mismatch terdeteksi
     */
    public function test_journal_period_mismatch_detected(): void
    {
        // Transaction date 2030-01-01 assigned to 2026 period
        $journalId = DB::table('journal_entries')->insertGetId([
            'accounting_period_id' => $this->openPeriod->id,
            'journal_number' => 'JU-MISMATCH-'.uniqid(),
            'transaction_date' => '2030-01-01',
            'description' => 'Period mismatch test',
            'status' => 'posted',
            'created_by' => $this->user->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $res = $this->reconciliationService->reconcile($this->openPeriod->id);

        $check = collect($res['data']['checks'])->firstWhere('check_code', 'PERIOD_CONSISTENCY');
        $this->assertNotNull($check);
        $this->assertEquals('failed', $check['status']);
        $this->assertEquals('critical', $check['severity']);

        // Clean up
        DB::table('journal_entries')->where('id', $journalId)->delete();
    }

    /**
     * 7. Paid donation tanpa journal terdeteksi
     */
    public function test_paid_donation_without_journal_detected(): void
    {
        $donation = Donation::create([
            'donation_code' => 'DON-'.uniqid(),
            'donor_name' => 'Hamba Allah Unjournaled',
            'donor_email' => 'unjournaled@example.com',
            'payment_source' => 'manual',
            'amount' => 750000,
            'status' => 'paid',
            'paid_at' => '2026-04-15 10:00:00',
        ]);

        // Ensure no journal exists for this donation
        DB::table('journal_entries')->where('reference_type', 'donation')->where('reference_id', $donation->id)->delete();

        $res = $this->reconciliationService->reconcile($this->openPeriod->id);

        $check = collect($res['data']['checks'])->firstWhere('check_code', 'DONATION_RECONCILIATION');
        $this->assertNotNull($check);
        $this->assertEquals('failed', $check['status']);
        $this->assertEquals('critical', $check['severity']);
        $this->assertContains($donation->id, collect($check['errors'])->pluck('reference_id')->all());

        // Clean up
        $donation->delete();
    }

    /**
     * 8. Paid donation dengan journal dianggap reconciled
     */
    public function test_paid_donation_with_journal_reconciled(): void
    {
        $donation = Donation::create([
            'donation_code' => 'DON-'.uniqid(),
            'donor_name' => 'Hamba Allah Reconciled',
            'donor_email' => 'reconciled@example.com',
            'payment_source' => 'manual',
            'amount' => 500000,
            'status' => 'paid',
            'paid_at' => '2026-04-16 10:00:00',
        ]);

        // Generate journal via DonationJournalService
        $this->donationJournalService->recordDonationJournal($donation);

        // Check specifically for this donation's date
        $res = $this->reconciliationService->reconcile(null, '2026-04-16', '2026-04-16');

        $check = collect($res['data']['checks'])->firstWhere('check_code', 'DONATION_RECONCILIATION');
        $this->assertNotNull($check);
        $this->assertEquals('passed', $check['status']);
        $this->assertEquals(0, $check['total_failed']);
    }

    /**
     * 9. Duplicate donation journal terdeteksi
     */
    public function test_duplicate_donation_journal_detected(): void
    {
        $donation = Donation::create([
            'donation_code' => 'DON-'.uniqid(),
            'donor_name' => 'Hamba Allah Dup Journal',
            'donor_email' => 'dup@example.com',
            'payment_source' => 'manual',
            'amount' => 1200000,
            'status' => 'paid',
            'paid_at' => '2026-04-20 10:00:00',
        ]);

        $id1 = DB::table('journal_entries')->insertGetId([
            'accounting_period_id' => $this->openPeriod->id,
            'journal_number' => 'JU-DON-1-'.uniqid(),
            'transaction_date' => '2026-04-20',
            'reference_type' => 'donation',
            'reference_id' => $donation->id,
            'description' => 'Dup donation journal 1',
            'status' => 'posted',
            'created_by' => $this->user->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $id2 = DB::table('journal_entries')->insertGetId([
            'accounting_period_id' => $this->openPeriod->id,
            'journal_number' => 'JU-DON-2-'.uniqid(),
            'transaction_date' => '2026-04-20',
            'reference_type' => 'donation',
            'reference_id' => $donation->id,
            'description' => 'Dup donation journal 2',
            'status' => 'posted',
            'created_by' => $this->user->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $res = $this->reconciliationService->reconcile($this->openPeriod->id);

        $check = collect($res['data']['checks'])->firstWhere('check_code', 'DUPLICATE_TRANSACTION_JOURNAL');
        $this->assertNotNull($check);
        $this->assertEquals('failed', $check['status']);
        $this->assertEquals('critical', $check['severity']);

        // Clean up
        DB::table('journal_entries')->whereIn('id', [$id1, $id2])->delete();
        $donation->delete();
    }

    /**
     * 10. Allocation tanpa journal terdeteksi
     */
    public function test_allocation_without_journal_detected(): void
    {
        $program = Program::first() ?? Program::create([
            'title' => 'Program Test Reconciliation',
            'slug' => 'program-test-reconciliation-'.uniqid(),
            'target_amount' => 10000000,
            'collected_amount' => 0,
            'status' => 'active',
        ]);

        $allocation = Allocation::create([
            'program_id' => $program->id,
            'amount' => 2000000,
            'description' => 'Penyaluran beasiswa',
            'allocated_at' => '2026-05-10',
        ]);

        // Ensure no journal exists
        DB::table('journal_entries')->where('reference_type', 'allocation')->where('reference_id', $allocation->id)->delete();

        $res = $this->reconciliationService->reconcile(null, '2026-05-10', '2026-05-10');

        $check = collect($res['data']['checks'])->firstWhere('check_code', 'ALLOCATION_RECONCILIATION');
        $this->assertNotNull($check);
        $this->assertEquals('failed', $check['status']);
        $this->assertEquals('critical', $check['severity']);

        // Clean up
        $allocation->delete();
    }

    /**
     * 11. Allocation dengan journal dianggap reconciled
     */
    public function test_allocation_with_journal_reconciled(): void
    {
        $program = Program::first() ?? Program::create([
            'title' => 'Program Test Reconciled Alloc',
            'slug' => 'program-test-reconciled-alloc-'.uniqid(),
            'target_amount' => 10000000,
            'collected_amount' => 0,
            'status' => 'active',
        ]);

        $allocation = Allocation::create([
            'program_id' => $program->id,
            'amount' => 1500000,
            'description' => 'Penyaluran kesehatan',
            'allocated_at' => '2026-05-12',
        ]);

        $this->allocationJournalService->recordAllocationJournal($allocation);

        $res = $this->reconciliationService->reconcile(null, '2026-05-12', '2026-05-12');

        $check = collect($res['data']['checks'])->firstWhere('check_code', 'ALLOCATION_RECONCILIATION');
        $this->assertNotNull($check);
        $this->assertEquals('passed', $check['status']);
    }

    /**
     * 12. General Ledger reconcile dengan posted journal
     */
    public function test_general_ledger_reconciles_with_posted_journal(): void
    {
        $res = $this->reconciliationService->reconcile($this->openPeriod->id);

        $check = collect($res['data']['checks'])->firstWhere('check_code', 'GENERAL_LEDGER_RECONCILIATION');
        $this->assertNotNull($check);
        $this->assertEquals('passed', $check['status']);
    }

    /**
     * 13. Trial Balance balanced
     */
    public function test_trial_balance_balanced(): void
    {
        $res = $this->reconciliationService->reconcile($this->openPeriod->id);

        $check = collect($res['data']['checks'])->firstWhere('check_code', 'TRIAL_BALANCE_RECONCILIATION');
        $this->assertNotNull($check);
        $this->assertEquals('passed', $check['status']);
    }

    /**
     * 14. Balance Sheet balanced
     */
    public function test_balance_sheet_balanced(): void
    {
        $res = $this->reconciliationService->reconcile($this->openPeriod->id);

        $check = collect($res['data']['checks'])->firstWhere('check_code', 'FINANCIAL_STATEMENT_RECONCILIATION');
        $this->assertNotNull($check);
        $this->assertEquals('passed', $check['status']);
    }

    /**
     * 15. Activity Statement surplus/deficit konsisten
     */
    public function test_activity_statement_surplus_deficit_consistent(): void
    {
        $res = $this->reconciliationService->reconcile($this->openPeriod->id);

        $check = collect($res['data']['checks'])->firstWhere('check_code', 'FINANCIAL_STATEMENT_RECONCILIATION');
        $this->assertNotNull($check);
        $this->assertEmpty($check['errors']);
    }

    /**
     * 16. Closed period terdeteksi dengan benar
     */
    public function test_closed_period_detected_correctly(): void
    {
        // Insert a journal into closed period with created_at AFTER closed_at
        $illegalId = DB::table('journal_entries')->insertGetId([
            'accounting_period_id' => $this->closedPeriod->id,
            'journal_number' => 'JU-CLOSED-ILLEGAL-'.uniqid(),
            'transaction_date' => '2025-06-01',
            'description' => 'Illegal creation after closing',
            'status' => 'posted',
            'created_by' => $this->user->id,
            'created_at' => '2026-06-01 12:00:00', // after 2026-01-05
            'updated_at' => '2026-06-01 12:00:00',
        ]);

        $res = $this->reconciliationService->reconcile($this->closedPeriod->id);

        $check = collect($res['data']['checks'])->firstWhere('check_code', 'CLOSED_PERIOD_CONTROL');
        $this->assertNotNull($check);
        $this->assertEquals('failed', $check['status']);
        $this->assertEquals('critical', $check['severity']);

        // Clean up
        DB::table('journal_entries')->where('id', $illegalId)->delete();
    }

    /**
     * 17. Draft journal tidak dihitung
     */
    public function test_draft_journal_not_counted_in_posted_checks(): void
    {
        // Create an unbalanced draft journal
        $draftId = DB::table('journal_entries')->insertGetId([
            'accounting_period_id' => $this->openPeriod->id,
            'journal_number' => 'JU-DRAFT-'.uniqid(),
            'transaction_date' => '2026-06-15',
            'description' => 'Draft unbalanced',
            'status' => 'draft',
            'created_by' => $this->user->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('journal_entry_lines')->insert([
            'journal_entry_id' => $draftId,
            'account_id' => $this->debitAccount->id,
            'debit' => 9999999,
            'credit' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $res = $this->reconciliationService->reconcile(null, '2026-06-15', '2026-06-15');

        $check = collect($res['data']['checks'])->firstWhere('check_code', 'JOURNAL_BALANCE');
        $this->assertNotNull($check);
        $this->assertEquals('passed', $check['status']); // Drafts must NOT cause failure

        // Clean up
        DB::table('journal_entry_lines')->where('journal_entry_id', $draftId)->delete();
        DB::table('journal_entries')->where('id', $draftId)->delete();
    }

    /**
     * 18. Void journal tidak dihitung
     */
    public function test_void_journal_not_counted_in_posted_checks(): void
    {
        $voidId = DB::table('journal_entries')->insertGetId([
            'accounting_period_id' => $this->openPeriod->id,
            'journal_number' => 'JU-VOID-'.uniqid(),
            'transaction_date' => '2026-06-16',
            'description' => 'Void unbalanced',
            'status' => 'void',
            'created_by' => $this->user->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('journal_entry_lines')->insert([
            'journal_entry_id' => $voidId,
            'account_id' => $this->debitAccount->id,
            'debit' => 8888888,
            'credit' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $res = $this->reconciliationService->reconcile(null, '2026-06-16', '2026-06-16');

        $check = collect($res['data']['checks'])->firstWhere('check_code', 'JOURNAL_BALANCE');
        $this->assertNotNull($check);
        $this->assertEquals('passed', $check['status']);

        // Clean up
        DB::table('journal_entry_lines')->where('journal_entry_id', $voidId)->delete();
        DB::table('journal_entries')->where('id', $voidId)->delete();
    }

    /**
     * 19. Reconciliation tidak mengubah data accounting
     */
    public function test_reconciliation_does_not_modify_accounting_data(): void
    {
        $journalCountBefore = JournalEntry::count();
        $lineCountBefore = JournalEntryLine::count();
        $donationCountBefore = Donation::count();
        $allocationCountBefore = Allocation::count();

        $this->reconciliationService->reconcile($this->openPeriod->id);

        $this->assertEquals($journalCountBefore, JournalEntry::count());
        $this->assertEquals($lineCountBefore, JournalEntryLine::count());
        $this->assertEquals($donationCountBefore, Donation::count());
        $this->assertEquals($allocationCountBefore, Allocation::count());
    }

    /**
     * 20. Audit log reconciliation tersimpan
     */
    public function test_audit_log_reconciliation_persisted(): void
    {
        $this->actingAs($this->user, 'sanctum');

        $logCountBefore = AuditLog::where('module', 'finance_reconciliation')->count();

        $this->reconciliationService->reconcile($this->openPeriod->id);

        $logCountAfter = AuditLog::where('module', 'finance_reconciliation')->count();
        $this->assertEquals($logCountBefore + 1, $logCountAfter);

        $latestLog = AuditLog::where('module', 'finance_reconciliation')->latest()->first();
        $this->assertEquals('reconcile_finance', $latestLog->action);
        $this->assertEquals($this->openPeriod->id, $latestLog->reference_id);
        $this->assertIsArray($latestLog->new_data);
        $this->assertEquals(14, $latestLog->new_data['total_checks']);
    }

    /**
     * 21. API reconciliation berhasil
     */
    public function test_api_reconciliation_endpoint_succeeds(): void
    {
        $this->actingAs($this->user, 'sanctum');

        $response = $this->getJson("/api/v1/finance/reconciliation?period_id={$this->openPeriod->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'period',
                    'scope',
                    'overall_status',
                    'total_checks',
                    'passed_checks',
                    'failed_checks',
                    'critical_errors',
                    'high_errors',
                    'warnings',
                    'checks',
                ],
            ]);

        $this->assertEquals(14, count($response->json('data.checks')));
    }

    /**
     * 22. API summary berhasil
     */
    public function test_api_summary_endpoint_succeeds(): void
    {
        $this->actingAs($this->user, 'sanctum');

        $response = $this->getJson("/api/v1/finance/reconciliation/summary?period_id={$this->openPeriod->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'overall_status',
                    'critical_errors',
                    'high_errors',
                    'warnings',
                    'failed_checks',
                    'total_checks',
                    'last_checked_at',
                ],
            ]);

        $this->assertEquals(14, $response->json('data.total_checks'));
    }

    /**
     * 23. Authorization berjalan
     */
    public function test_authorization_enforced(): void
    {
        // 1. User without appropriate role/permission is forbidden
        $unauthorizedUser = User::factory()->create(['is_active' => true]);
        $unauthorizedUser->syncRoles([]);
        $unauthorizedUser->syncPermissions([]);

        $this->actingAs($unauthorizedUser, 'sanctum');

        $response = $this->getJson('/api/v1/finance/reconciliation');
        $response->assertStatus(403);

        $summaryResponse = $this->getJson('/api/v1/finance/reconciliation/summary');
        $summaryResponse->assertStatus(403);

        // 2. User with keuangan role is authorized
        $keuanganUser = User::factory()->create(['is_active' => true]);
        $keuanganUser->assignRole('keuangan');

        $this->actingAs($keuanganUser, 'sanctum');
        $this->getJson('/api/v1/finance/reconciliation')->assertStatus(200);

        // 3. User with view reports permission is authorized
        $reporterUser = User::factory()->create(['is_active' => true]);
        $reporterUser->givePermissionTo('view reports');

        $this->actingAs($reporterUser, 'sanctum');
        $this->getJson('/api/v1/finance/reconciliation')->assertStatus(200);
    }

    /**
     * 24. Filter accounting period berjalan
     */
    public function test_filter_accounting_period_works(): void
    {
        $res = $this->reconciliationService->reconcile($this->openPeriod->id);

        $this->assertEquals($this->openPeriod->id, $res['data']['period']['id']);
        $this->assertEquals($this->openPeriod->name, $res['data']['period']['name']);
        $this->assertEquals('2026-01-01', $res['data']['scope']['start_date']);
        $this->assertEquals('2026-12-31', $res['data']['scope']['end_date']);
    }
}
