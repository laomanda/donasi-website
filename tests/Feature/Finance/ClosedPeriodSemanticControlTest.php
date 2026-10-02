<?php

namespace Tests\Feature\Finance;

use App\Models\Account;
use App\Models\AccountingPeriod;
use App\Models\AuditLog;
use App\Models\JournalEntry;
use App\Models\User;
use App\Services\AccountingPeriodService;
use App\Services\FinanceReconciliationService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ClosedPeriodSemanticControlTest extends TestCase
{
    use DatabaseTransactions;

    protected User $user;
    protected Account $debitAccount;
    protected Account $creditAccount;
    protected AccountingPeriodService $periodService;
    protected FinanceReconciliationService $reconciliationService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->periodService = app(AccountingPeriodService::class);
        $this->reconciliationService = app(FinanceReconciliationService::class);

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
    }

    /**
     * Case 1: Journal created while period is open -> PASS
     */
    public function test_case_1_journal_created_while_period_open_passes(): void
    {
        $period = AccountingPeriod::create([
            'name' => 'Test Period Open ' . uniqid(),
            'start_date' => '2024-01-01',
            'end_date' => '2024-12-31',
            'status' => 'open',
            'is_closed' => false,
            'closed_at' => null,
        ]);

        $jId = DB::table('journal_entries')->insertGetId([
            'accounting_period_id' => $period->id,
            'journal_number' => 'JU-TEST-OPEN-' . uniqid(),
            'transaction_date' => '2024-06-01',
            'description' => 'Created while period open',
            'status' => 'posted',
            'created_by' => $this->user->id,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $res = $this->reconciliationService->reconcile($period->id);
        $check = collect($res['data']['checks'])->firstWhere('check_code', 'CLOSED_PERIOD_CONTROL');

        $this->assertEquals('passed', $check['status']);
        $this->assertEquals(0, $check['total_failed']);
    }

    /**
     * Case 2: Journal created after period closed without reopen -> FAIL
     */
    public function test_case_2_journal_created_after_closed_without_reopen_fails(): void
    {
        $closedAt = Carbon::now()->subDays(5);
        $period = AccountingPeriod::create([
            'name' => 'Test Period Closed ' . uniqid(),
            'start_date' => '2024-01-01',
            'end_date' => '2024-12-31',
            'status' => 'closed',
            'is_closed' => true,
            'closed_at' => $closedAt,
        ]);

        $jId = DB::table('journal_entries')->insertGetId([
            'accounting_period_id' => $period->id,
            'journal_number' => 'JU-TEST-ILLEGAL-' . uniqid(),
            'transaction_date' => '2024-06-01',
            'description' => 'Late creation after closure without reopen',
            'status' => 'posted',
            'created_by' => $this->user->id,
            'created_at' => Carbon::now(), // created after closed_at
            'updated_at' => Carbon::now(),
        ]);

        $res = $this->reconciliationService->reconcile($period->id);
        $check = collect($res['data']['checks'])->firstWhere('check_code', 'CLOSED_PERIOD_CONTROL');

        $this->assertEquals('failed', $check['status']);
        $this->assertEquals(1, $check['total_failed']);
    }

    /**
     * Case 3: Period reopened through canonical service, journal created during reopen window, period reclosed -> PASS
     */
    public function test_case_3_journal_created_during_authorized_reopen_window_passes(): void
    {
        $period = AccountingPeriod::create([
            'name' => 'Test Period Reopen ' . uniqid(),
            'start_date' => '2024-01-01',
            'end_date' => '2024-12-31',
            'status' => 'closed',
            'is_closed' => true,
            'closed_at' => Carbon::now()->subDays(10),
        ]);

        // 1. Reopen via canonical service
        $this->periodService->reopenPeriod($period, $this->user);

        // 2. Post journal during reopen window
        $journalTime = Carbon::now();
        $jId = DB::table('journal_entries')->insertGetId([
            'accounting_period_id' => $period->id,
            'journal_number' => 'JU-TEST-REOPENED-' . uniqid(),
            'transaction_date' => '2024-06-01',
            'description' => 'Created during authorized reopen window',
            'status' => 'posted',
            'created_by' => $this->user->id,
            'created_at' => $journalTime,
            'updated_at' => $journalTime,
        ]);

        // 3. Reclose via canonical service
        $this->periodService->closePeriod($period, $this->user);

        $res = $this->reconciliationService->reconcile($period->id);
        $check = collect($res['data']['checks'])->firstWhere('check_code', 'CLOSED_PERIOD_CONTROL');

        $this->assertEquals('passed', $check['status']);
        $this->assertEquals(0, $check['total_failed']);
    }

    /**
     * Case 4: Journal created after reclosure -> FAIL
     */
    public function test_case_4_journal_created_after_reclosure_fails(): void
    {
        $period = AccountingPeriod::create([
            'name' => 'Test Period Reclose Fail ' . uniqid(),
            'start_date' => '2024-01-01',
            'end_date' => '2024-12-31',
            'status' => 'closed',
            'is_closed' => true,
            'closed_at' => Carbon::now()->subDays(10),
        ]);

        // 1. Reopen canonical
        $this->periodService->reopenPeriod($period, $this->user);

        // 2. Reclose canonical
        $this->periodService->closePeriod($period, $this->user);

        // 3. Insert illegal journal AFTER reclosure
        $jId = DB::table('journal_entries')->insertGetId([
            'accounting_period_id' => $period->id,
            'journal_number' => 'JU-TEST-AFTER-RECLOSE-' . uniqid(),
            'transaction_date' => '2024-06-01',
            'description' => 'Created after period was reclosed',
            'status' => 'posted',
            'created_by' => $this->user->id,
            'created_at' => Carbon::now()->addMinute(),
            'updated_at' => Carbon::now()->addMinute(),
        ]);

        $res = $this->reconciliationService->reconcile($period->id);
        $check = collect($res['data']['checks'])->firstWhere('check_code', 'CLOSED_PERIOD_CONTROL');

        $this->assertEquals('failed', $check['status']);
        $this->assertGreaterThanOrEqual(1, $check['total_failed']);
    }

    /**
     * Case 5: Historical transaction_date does NOT by itself authorize late journal creation -> FAIL
     */
    public function test_case_5_historical_transaction_date_does_not_authorize_late_creation(): void
    {
        $period = AccountingPeriod::create([
            'name' => 'Test Period Hist Date ' . uniqid(),
            'start_date' => '2024-01-01',
            'end_date' => '2024-12-31',
            'status' => 'closed',
            'is_closed' => true,
            'closed_at' => '2024-12-31 23:59:59',
        ]);

        // Journal has transaction_date in 2024, but created_at in 2026 without reopen window
        $jId = DB::table('journal_entries')->insertGetId([
            'accounting_period_id' => $period->id,
            'journal_number' => 'JU-TEST-HIST-FAIL-' . uniqid(),
            'transaction_date' => '2024-03-15', // valid historical date
            'description' => 'Historical date without reopen authorization',
            'status' => 'posted',
            'created_by' => $this->user->id,
            'created_at' => Carbon::now(), // created today
            'updated_at' => Carbon::now(),
        ]);

        $res = $this->reconciliationService->reconcile($period->id);
        $check = collect($res['data']['checks'])->firstWhere('check_code', 'CLOSED_PERIOD_CONTROL');

        $this->assertEquals('failed', $check['status']);
        $this->assertEquals(1, $check['total_failed']);
    }

    /**
     * Case 6: Unauthorized manual mutation remains detectable -> FAIL
     */
    public function test_case_6_unauthorized_manual_mutation_remains_detectable(): void
    {
        $period = AccountingPeriod::create([
            'name' => 'Test Period Manual Mutation ' . uniqid(),
            'start_date' => '2024-01-01',
            'end_date' => '2024-12-31',
            'status' => 'closed',
            'is_closed' => true,
            'closed_at' => Carbon::now()->subDays(2),
        ]);

        // Direct SQL bypass simulating unauthorized DB injection
        DB::statement("
            INSERT INTO journal_entries (
                accounting_period_id, journal_number, transaction_date, description,
                status, created_by, created_at, updated_at
            ) VALUES (
                {$period->id}, 'JU-DIRECT-SQL-" . uniqid() . "', '2024-05-01', 'Direct injection bypass',
                'posted', {$this->user->id}, NOW(), NOW()
            )
        ");

        $res = $this->reconciliationService->reconcile($period->id);
        $check = collect($res['data']['checks'])->firstWhere('check_code', 'CLOSED_PERIOD_CONTROL');

        $this->assertEquals('failed', $check['status']);
        $this->assertEquals(1, $check['total_failed']);
    }

    /**
     * Case 7: Multiple reopen/reclose cycles handled correctly (Window 1 valid, between windows invalid, Window 2 valid, after Window 2 invalid)
     */
    public function test_case_7_multiple_reopen_reclose_windows_handled_correctly(): void
    {
        $period = AccountingPeriod::create([
            'name' => 'Test Multi Cycle ' . uniqid(),
            'start_date' => '2024-01-01',
            'end_date' => '2024-12-31',
            'status' => 'closed',
            'is_closed' => true,
            'closed_at' => Carbon::now()->subDays(20),
        ]);

        // Cycle 1: reopen at T1, reclose at T2
        $t1 = Carbon::now()->subDays(15);
        $t2 = Carbon::now()->subDays(12);

        DB::table('audit_logs')->insert([
            'user_id' => $this->user->id,
            'module' => 'finance_period',
            'action' => 'reopen_period',
            'reference_id' => $period->id,
            'created_at' => $t1,
            'updated_at' => $t1,
        ]);
        DB::table('audit_logs')->insert([
            'user_id' => $this->user->id,
            'module' => 'finance_period',
            'action' => 'close_period',
            'reference_id' => $period->id,
            'created_at' => $t2,
            'updated_at' => $t2,
        ]);

        // Cycle 2: reopen at T3, reclose at T4
        $t3 = Carbon::now()->subDays(8);
        $t4 = Carbon::now()->subDays(5);

        DB::table('audit_logs')->insert([
            'user_id' => $this->user->id,
            'module' => 'finance_period',
            'action' => 'reopen_period',
            'reference_id' => $period->id,
            'created_at' => $t3,
            'updated_at' => $t3,
        ]);
        DB::table('audit_logs')->insert([
            'user_id' => $this->user->id,
            'module' => 'finance_period',
            'action' => 'close_period',
            'reference_id' => $period->id,
            'created_at' => $t4,
            'updated_at' => $t4,
        ]);

        $period->update(['closed_at' => $t4, 'status' => 'closed', 'is_closed' => true]);

        // Journal A: created in Cycle 1 -> valid
        DB::table('journal_entries')->insert([
            'accounting_period_id' => $period->id,
            'journal_number' => 'JU-CYCLE1-' . uniqid(),
            'transaction_date' => '2024-06-01',
            'description' => 'Cycle 1 journal',
            'status' => 'posted',
            'created_by' => $this->user->id,
            'created_at' => $t1->copy()->addDay(),
            'updated_at' => $t1->copy()->addDay(),
        ]);

        // Journal B: created in Cycle 2 -> valid
        DB::table('journal_entries')->insert([
            'accounting_period_id' => $period->id,
            'journal_number' => 'JU-CYCLE2-' . uniqid(),
            'transaction_date' => '2024-06-02',
            'description' => 'Cycle 2 journal',
            'status' => 'posted',
            'created_by' => $this->user->id,
            'created_at' => $t3->copy()->addDay(),
            'updated_at' => $t3->copy()->addDay(),
        ]);

        // Reconcile -> should pass with 0 failures
        $res = $this->reconciliationService->reconcile($period->id);
        $check = collect($res['data']['checks'])->firstWhere('check_code', 'CLOSED_PERIOD_CONTROL');
        $this->assertEquals('passed', $check['status']);
        $this->assertEquals(0, $check['total_failed']);

        // Now add Journal C: created between Cycle 1 and Cycle 2 (while period was closed) -> MUST FAIL
        $illegalBetweenId = DB::table('journal_entries')->insertGetId([
            'accounting_period_id' => $period->id,
            'journal_number' => 'JU-BETWEEN-' . uniqid(),
            'transaction_date' => '2024-06-03',
            'description' => 'Between cycles journal',
            'status' => 'posted',
            'created_by' => $this->user->id,
            'created_at' => $t2->copy()->addDay(), // between t2 and t3
            'updated_at' => $t2->copy()->addDay(),
        ]);

        $res2 = $this->reconciliationService->reconcile($period->id);
        $check2 = collect($res2['data']['checks'])->firstWhere('check_code', 'CLOSED_PERIOD_CONTROL');
        $this->assertEquals('failed', $check2['status']);
        $this->assertEquals(1, $check2['total_failed']);

        // Clean up Journal C and test Journal D: created after Cycle 2 reclosed -> MUST FAIL
        DB::table('journal_entries')->where('id', $illegalBetweenId)->delete();

        DB::table('journal_entries')->insert([
            'accounting_period_id' => $period->id,
            'journal_number' => 'JU-AFTER-CYCLE2-' . uniqid(),
            'transaction_date' => '2024-06-04',
            'description' => 'After Cycle 2 journal',
            'status' => 'posted',
            'created_by' => $this->user->id,
            'created_at' => $t4->copy()->addDay(), // after t4
            'updated_at' => $t4->copy()->addDay(),
        ]);

        $res3 = $this->reconciliationService->reconcile($period->id);
        $check3 = collect($res3['data']['checks'])->firstWhere('check_code', 'CLOSED_PERIOD_CONTROL');
        $this->assertEquals('failed', $check3['status']);
        $this->assertEquals(1, $check3['total_failed']);
    }

    /**
     * Case 8 & 9: Unrelated audit log records (different module or different period) cannot authorize a journal
     */
    public function test_case_8_and_9_unrelated_audit_logs_cannot_authorize_journal(): void
    {
        $periodA = AccountingPeriod::create([
            'name' => 'Test Period A ' . uniqid(),
            'start_date' => '2024-01-01',
            'end_date' => '2024-12-31',
            'status' => 'closed',
            'is_closed' => true,
            'closed_at' => Carbon::now()->subDays(5),
        ]);

        $periodB = AccountingPeriod::create([
            'name' => 'Test Period B ' . uniqid(),
            'start_date' => '2023-01-01',
            'end_date' => '2023-12-31',
            'status' => 'closed',
            'is_closed' => true,
            'closed_at' => Carbon::now()->subDays(5),
        ]);

        // Create reopen audit log for Period B only
        DB::table('audit_logs')->insert([
            'user_id' => $this->user->id,
            'module' => 'finance_period',
            'action' => 'reopen_period',
            'reference_id' => $periodB->id, // Period B
            'created_at' => Carbon::now()->subHours(2),
            'updated_at' => Carbon::now()->subHours(2),
        ]);

        // Create reopen audit log for unrelated module
        DB::table('audit_logs')->insert([
            'user_id' => $this->user->id,
            'module' => 'journal', // Unrelated module
            'action' => 'reopen_period',
            'reference_id' => $periodA->id,
            'created_at' => Carbon::now()->subHours(2),
            'updated_at' => Carbon::now()->subHours(2),
        ]);

        // Insert journal into Period A after closed_at
        DB::table('journal_entries')->insert([
            'accounting_period_id' => $periodA->id,
            'journal_number' => 'JU-UNAUTH-AUDIT-' . uniqid(),
            'transaction_date' => '2024-06-01',
            'description' => 'Unrelated audit log test',
            'status' => 'posted',
            'created_by' => $this->user->id,
            'created_at' => Carbon::now()->subHour(),
            'updated_at' => Carbon::now()->subHour(),
        ]);

        $res = $this->reconciliationService->reconcile($periodA->id);
        $check = collect($res['data']['checks'])->firstWhere('check_code', 'CLOSED_PERIOD_CONTROL');

        // MUST FAIL because Period A was never canonically reopened!
        $this->assertEquals('failed', $check['status']);
        $this->assertEquals(1, $check['total_failed']);
    }
}
