<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Account;
use App\Models\AccountingPeriod;
use App\Models\Allocation;
use App\Models\Donation;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\Program;
use App\Models\User;
use App\Services\JournalService;
use App\Services\PublicFinanceReadService;
use Database\Seeders\AccountSeeder;
use Database\Seeders\AccountingPeriodSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PublicFinanceReadServiceTest extends TestCase
{
    use DatabaseTransactions;

    protected PublicFinanceReadService $service;
    protected JournalService $journalService;
    protected User $user;
    protected AccountingPeriod $period;

    protected Account $bankAccount;
    protected Account $waqfRevenueAccount;
    protected Account $infaqRevenueAccount;
    protected Account $distributionAccount;
    protected Account $nazhirExpenseAccount;
    protected Account $operationalExpenseAccount;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = app(PublicFinanceReadService::class);
        $this->journalService = app(JournalService::class);

        // Ensure baseline COA and Accounting Periods exist
        if (Account::count() === 0) {
            $this->seed(AccountSeeder::class);
        }
        if (AccountingPeriod::count() === 0) {
            $this->seed(AccountingPeriodSeeder::class);
        }

        $this->user = User::first() ?? User::factory()->create();

        if (class_exists(Role::class)) {
            $role = Role::firstOrCreate(['name' => 'superadmin', 'guard_name' => 'web']);
            if (!$this->user->hasRole('superadmin')) {
                $this->user->assignRole($role);
            }
        }

        $this->period = AccountingPeriod::where('status', 'open')->first() ?? AccountingPeriod::create([
            'name'       => 'Tahun 2026',
            'start_date' => '2026-01-01',
            'end_date'   => '2026-12-31',
            'status'     => 'open',
        ]);

        // Key accounts matching official seeders
        $this->bankAccount = Account::where('code', '1112')->firstOrFail();
        $this->waqfRevenueAccount = Account::where('code', '4110')->firstOrFail();
        $this->infaqRevenueAccount = Account::where('code', '4310')->firstOrFail();
        $this->distributionAccount = Account::where('code', '5110')->firstOrFail();
        $this->nazhirExpenseAccount = Account::where('code', '5210')->firstOrFail();
        $this->operationalExpenseAccount = Account::where('code', '5310')->firstOrFail();
    }

    /**
     * Helper to create test journals.
     */
    protected function createTestJournal(
        Account $debitAcc,
        Account $creditAcc,
        float $amount,
        string $status = 'posted',
        string $date = '2026-05-10',
        ?string $refType = null,
        ?int $refId = null
    ): JournalEntry {
        return $this->journalService->createJournal([
            'transaction_date'     => $date,
            'accounting_period_id' => $this->period->id,
            'reference_type'       => $refType ?? 'manual',
            'reference_id'         => $refId,
            'description'          => "Test Journal {$status}",
            'status'               => $status,
            'journal_lines'        => [
                [
                    'account_id'  => $debitAcc->id,
                    'debit'       => $amount,
                    'credit'      => 0,
                    'description' => "Debit {$debitAcc->name}",
                ],
                [
                    'account_id'  => $creditAcc->id,
                    'debit'       => 0,
                    'credit'      => $amount,
                    'description' => "Credit {$creditAcc->name}",
                ],
            ],
        ], $this->user);
    }

    /**
     * Test 1: total waqf collected uses posted waqf revenue.
     */
    public function test_total_waqf_collected_uses_posted_waqf_revenue(): void
    {
        $initial = $this->service->getTotalWaqfCollected(2026);

        $this->createTestJournal(
            $this->bankAccount,
            $this->waqfRevenueAccount,
            5_000_000,
            'posted',
            '2026-06-01'
        );

        $current = $this->service->getTotalWaqfCollected(2026);
        $this->assertEquals($initial + 5_000_000, $current);
    }

    /**
     * Test 2: draft revenue excluded from total waqf collected.
     */
    public function test_draft_revenue_excluded(): void
    {
        $initial = $this->service->getTotalWaqfCollected(2026);

        $this->createTestJournal(
            $this->bankAccount,
            $this->waqfRevenueAccount,
            12_000_000,
            'draft',
            '2026-06-05'
        );

        $current = $this->service->getTotalWaqfCollected(2026);
        $this->assertEquals($initial, $current);
    }

    /**
     * Test 3: void journal excluded from total waqf collected.
     */
    public function test_void_journal_excluded(): void
    {
        $initial = $this->service->getTotalWaqfCollected(2026);

        $journal = $this->createTestJournal(
            $this->bankAccount,
            $this->waqfRevenueAccount,
            8_000_000,
            'draft',
            '2026-06-10'
        );

        // Update to void
        $journal->update(['status' => 'void']);

        $current = $this->service->getTotalWaqfCollected(2026);
        $this->assertEquals($initial, $current);
    }

    /**
     * Test 4: total collected includes verified revenue categories (both waqf and other revenues).
     */
    public function test_total_collected_includes_verified_revenue_categories(): void
    {
        $initialWaqf = $this->service->getTotalWaqfCollected(2026);
        $initialTotal = $this->service->getTotalCollected(2026);

        // Waqf revenue 10m
        $this->createTestJournal($this->bankAccount, $this->waqfRevenueAccount, 10_000_000, 'posted', '2026-07-01');
        // Non-waqf infaq revenue 4m
        $this->createTestJournal($this->bankAccount, $this->infaqRevenueAccount, 4_000_000, 'posted', '2026-07-02');

        $currentWaqf = $this->service->getTotalWaqfCollected(2026);
        $currentTotal = $this->service->getTotalCollected(2026);

        // Waqf metric only increases by 10m
        $this->assertEquals($initialWaqf + 10_000_000, $currentWaqf);
        // Total collected metric increases by 14m (10m + 4m)
        $this->assertEquals($initialTotal + 14_000_000, $currentTotal);
    }

    /**
     * Test 5: total distributed uses Penyaluran Manfaat.
     */
    public function test_total_distributed_uses_penyaluran_manfaat(): void
    {
        $initialDist = $this->service->getTotalDistributed(2026);

        // Penyaluran 7.5m
        $this->createTestJournal($this->distributionAccount, $this->bankAccount, 7_500_000, 'posted', '2026-08-01');

        $currentDist = $this->service->getTotalDistributed(2026);
        $this->assertEquals($initialDist + 7_500_000, $currentDist);
    }

    /**
     * Test 6: operational expense is based on real journal lines.
     */
    public function test_operational_expense_is_based_on_real_journal_lines(): void
    {
        $initialNazhir = $this->service->getNazhirExpense(2026);
        $initialOps = $this->service->getOperationalExpense(2026);
        $initialTotalExp = $this->service->getTotalExpense(2026);

        // Nazhir expense: 1.5m
        $this->createTestJournal($this->nazhirExpenseAccount, $this->bankAccount, 1_500_000, 'posted', '2026-08-10');
        // General ops expense: 2.5m
        $this->createTestJournal($this->operationalExpenseAccount, $this->bankAccount, 2_500_000, 'posted', '2026-08-11');

        $this->assertEquals($initialNazhir + 1_500_000, $this->service->getNazhirExpense(2026));
        $this->assertEquals($initialOps + 2_500_000, $this->service->getOperationalExpense(2026));
        $this->assertEquals($initialTotalExp + 4_000_000, $this->service->getTotalExpense(2026));
    }

    /**
     * Test 7: no 7% synthetic expense is ever applied.
     */
    public function test_no_7_percent_synthetic_expense(): void
    {
        // Even with 100m revenue, if no expense journals exist, expenses must not be calculated as 7m
        $summary = $this->service->getPublicSummary(2026);

        $this->assertNotEquals(
            $summary['summary']['total_collected'] * 0.07,
            $summary['summary']['total_expense']
        );
    }

    /**
     * Test 8: monthly aggregation uses transaction_date.
     */
    public function test_monthly_aggregation_uses_transaction_date(): void
    {
        $this->createTestJournal($this->bankAccount, $this->waqfRevenueAccount, 3_000_000, 'posted', '2026-02-14');
        $this->createTestJournal($this->distributionAccount, $this->bankAccount, 1_000_000, 'posted', '2026-02-20');

        $monthly = $this->service->getMonthlyRealization(2026);
        $feb = collect($monthly)->firstWhere('month', 2);

        $this->assertNotNull($feb);
        $this->assertGreaterThanOrEqual(3_000_000, $feb['collected']);
        $this->assertGreaterThanOrEqual(1_000_000, $feb['distributed']);
    }

    /**
     * Test 9: monthly draft journals excluded.
     */
    public function test_monthly_draft_journals_excluded(): void
    {
        $monthlyBefore = $this->service->getMonthlyRealization(2026);
        $marBefore = collect($monthlyBefore)->firstWhere('month', 3)['collected'];

        // Draft journal in March
        $this->createTestJournal($this->bankAccount, $this->waqfRevenueAccount, 9_999_999, 'draft', '2026-03-10');

        $monthlyAfter = $this->service->getMonthlyRealization(2026);
        $marAfter = collect($monthlyAfter)->firstWhere('month', 3)['collected'];

        $this->assertEquals($marBefore, $marAfter);
    }

    /**
     * Test 10: verified donations count uses paid status.
     */
    public function test_verified_donations_count_uses_paid_status(): void
    {
        $initialCount = $this->service->getVerifiedDonationsCount(2026);

        // Paid donation
        Donation::create([
            'donation_code'  => 'TEST-PAID-01',
            'amount'         => 100_000,
            'status'         => 'paid',
            'paid_at'        => '2026-04-10 10:00:00',
            'payment_source' => 'manual',
        ]);

        // Pending donation (should not be counted)
        Donation::create([
            'donation_code'  => 'TEST-PENDING-02',
            'amount'         => 200_000,
            'status'         => 'pending',
            'payment_source' => 'manual',
        ]);

        $currentCount = $this->service->getVerifiedDonationsCount(2026);
        $this->assertEquals($initialCount + 1, $currentCount);
    }

    /**
     * Test 11: program distribution count requires posted journal.
     */
    public function test_program_distribution_count_requires_posted_journal(): void
    {
        $initialCount = $this->service->getProgramDistributionsCount(2026);

        $program = Program::query()->first() ?? Program::create([
            'title'        => 'Program Uji Distribusi',
            'target_amount'=> 10_000_000,
            'status'       => 'active',
        ]);

        // Allocation 1: has posted journal (automatically posted via AllocationObserver)
        $alloc1 = Allocation::create([
            'user_id'      => $this->user->id,
            'program_id'   => $program->id,
            'amount'       => 500_000,
            'description'  => 'Penyaluran Berjurnal Posted',
            'allocated_at' => '2026-05-01',
        ]);

        // Allocation 2: unjournaled allocation (e.g. simulated legacy/failed allocation)
        Allocation::withoutEvents(function () use ($program) {
            return Allocation::create([
                'user_id'      => $this->user->id,
                'program_id'   => $program->id,
                'amount'       => 300_000,
                'description'  => 'Penyaluran Tanpa Jurnal',
                'allocated_at' => '2026-05-02',
            ]);
        });

        // Allocation 3: allocation with a draft journal (not posted)
        $alloc3 = Allocation::withoutEvents(function () use ($program) {
            return Allocation::create([
                'user_id'      => $this->user->id,
                'program_id'   => $program->id,
                'amount'       => 400_000,
                'description'  => 'Penyaluran Jurnal Draft',
                'allocated_at' => '2026-05-03',
            ]);
        });
        $this->createTestJournal(
            $this->distributionAccount,
            $this->bankAccount,
            400_000,
            'draft',
            '2026-05-03',
            'allocation',
            $alloc3->id
        );

        $currentCount = $this->service->getProgramDistributionsCount(2026);
        $this->assertEquals($initialCount + 1, $currentCount);
    }

    /**
     * Test 12: RoWA returns null / unavailable in summary.
     */
    public function test_rowa_returns_null_in_summary(): void
    {
        $summary = $this->service->getPublicSummary(2026);

        $this->assertNull($summary['summary']['rowa']);
        $this->assertEquals('formula_not_defined', $summary['summary']['rowa_status']);
    }

    /**
     * Test 13: monthly RoWA returns null / unavailable across all months.
     */
    public function test_monthly_rowa_returns_null_across_all_months(): void
    {
        $monthly = $this->service->getMonthlyRealization(2026);

        $this->assertCount(12, $monthly);
        foreach ($monthly as $monthData) {
            $this->assertNull($monthData['rowa'], "Month {$monthData['month']} RoWA must be null");
            $this->assertEquals('formula_not_defined', $monthData['rowa_status']);
        }
    }

    /**
     * Test 14: available balance returns null / definition required.
     */
    public function test_available_balance_returns_null(): void
    {
        $summary = $this->service->getPublicSummary(2026);

        $this->assertNull($summary['summary']['available_balance']);
        $this->assertEquals('definition_required', $summary['summary']['available_balance_status']);
    }

    /**
     * Test 15: no double-counting through account hierarchy.
     */
    public function test_no_double_counting_through_account_hierarchy(): void
    {
        // When 1 journal entry line is posted to leaf account 4110 (child of 4100),
        // it must only be summed once in getTotalCollected and once in getTotalWaqfCollected.
        $initialWaqf = $this->service->getTotalWaqfCollected(2026);
        $initialTotal = $this->service->getTotalCollected(2026);

        $this->createTestJournal($this->bankAccount, $this->waqfRevenueAccount, 5_000_000, 'posted', '2026-09-01');

        $this->assertEquals($initialWaqf + 5_000_000, $this->service->getTotalWaqfCollected(2026));
        $this->assertEquals($initialTotal + 5_000_000, $this->service->getTotalCollected(2026));
    }

    /**
     * Test 16: no production finance write operation performed.
     */
    public function test_no_production_finance_write_operation_performed(): void
    {
        $journalCountBefore = JournalEntry::count();
        $lineCountBefore = JournalEntryLine::count();
        $accountCountBefore = Account::count();
        $periodCountBefore = AccountingPeriod::count();

        // Call all public read service methods
        $this->service->getTotalWaqfCollected(2026);
        $this->service->getTotalCollected(2026);
        $this->service->getTotalDistributed(2026);
        $this->service->getNazhirExpense(2026);
        $this->service->getOperationalExpense(2026);
        $this->service->getTotalExpense(2026);
        $this->service->getMonthlyRealization(2026);
        $this->service->getVerifiedDonationsCount(2026);
        $this->service->getProgramDistributionsCount(2026);
        $this->service->getPublicSummary(2026);

        $this->assertEquals($journalCountBefore, JournalEntry::count());
        $this->assertEquals($lineCountBefore, JournalEntryLine::count());
        $this->assertEquals($accountCountBefore, Account::count());
        $this->assertEquals($periodCountBefore, AccountingPeriod::count());
    }
}
