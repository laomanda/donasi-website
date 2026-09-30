<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Account;
use App\Models\AccountingPeriod;
use App\Models\Allocation;
use App\Models\Article;
use App\Models\Donation;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\Partner;
use App\Models\Program;
use App\Models\User;
use App\Services\JournalService;
use Database\Seeders\AccountSeeder;
use Database\Seeders\AccountingPeriodSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PublicHomeFinanceIntegrationTest extends TestCase
{
    use DatabaseTransactions;

    protected User $user;
    protected AccountingPeriod $period;
    protected JournalService $journalService;

    protected Account $bankAccount;
    protected Account $waqfRevenueAccount;
    protected Account $infaqRevenueAccount;
    protected Account $distributionAccount;
    protected Account $nazhirExpenseAccount;
    protected Account $operationalExpenseAccount;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();

        if (Account::count() === 0) {
            $this->seed(AccountSeeder::class);
        }
        if (AccountingPeriod::count() === 0) {
            $this->seed(AccountingPeriodSeeder::class);
        }

        $this->journalService = app(JournalService::class);

        $this->user = User::first() ?? User::factory()->create();

        if (class_exists(Role::class)) {
            $role = Role::firstOrCreate(['name' => 'superadmin', 'guard_name' => 'web']);
            if (!$this->user->hasRole('superadmin')) {
                $this->user->assignRole($role);
            }
        }

        $this->period = AccountingPeriod::where('status', 'open')->first()
            ?? AccountingPeriod::create([
                'name'       => 'Tahun 2026',
                'start_date' => '2026-01-01',
                'end_date'   => '2026-12-31',
                'status'     => 'open',
            ]);

        $this->bankAccount = Account::where('code', '1112')->firstOrFail();
        $this->waqfRevenueAccount = Account::where('code', '4110')->firstOrFail();
        $this->infaqRevenueAccount = Account::where('code', '4310')->firstOrFail();
        $this->distributionAccount = Account::where('code', '5110')->firstOrFail();
        $this->nazhirExpenseAccount = Account::where('code', '5210')->firstOrFail();
        $this->operationalExpenseAccount = Account::where('code', '5310')->firstOrFail();
    }

    /**
     * Helper to create test journals matching JournalService contract.
     */
    protected function postTestJournal(
        string $date,
        Account $debitAcc,
        Account $creditAcc,
        float $amount,
        string $status = 'posted',
        string $desc = 'Test Jurnal'
    ): JournalEntry {
        return $this->journalService->createJournal([
            'transaction_date'     => $date,
            'accounting_period_id' => $this->period->id,
            'reference_type'       => 'manual',
            'reference_id'         => null,
            'description'          => $desc,
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
        ]);
    }

    /**
     * Test 1: /api/v1/home returns Finance-derived total_collected.
     */
    public function test_home_returns_finance_derived_total_collected(): void
    {
        $resBefore = $this->getJson('/api/v1/home?year=2026');
        $resBefore->assertOk();
        $initial = (float) $resBefore->json('finance.total_collected');

        $this->postTestJournal('2026-03-10', $this->bankAccount, $this->waqfRevenueAccount, 1_500_000, 'posted', 'Penerimaan Wakaf Test');

        Cache::flush();
        $resAfter = $this->getJson('/api/v1/home?year=2026');
        $resAfter->assertOk();

        $this->assertEquals($initial + 1_500_000, (float) $resAfter->json('finance.total_collected'));
        $this->assertEquals($initial + 1_500_000, (float) $resAfter->json('stats.total_collected'));
    }

    /**
     * Test 2: total_waqf_collected is distinct and correct.
     */
    public function test_total_waqf_collected_is_distinct_and_correct(): void
    {
        $resBefore = $this->getJson('/api/v1/home?year=2026');
        $initWaqf = (float) $resBefore->json('finance.total_waqf_collected');
        $initTotal = (float) $resBefore->json('finance.total_collected');

        // Post waqf revenue
        $this->postTestJournal('2026-03-15', $this->bankAccount, $this->waqfRevenueAccount, 1_000_000, 'posted', 'Wakaf Uang');
        // Post non-waqf revenue (infaq/lainnya)
        $this->postTestJournal('2026-03-16', $this->bankAccount, $this->infaqRevenueAccount, 500_000, 'posted', 'Infaq Umum');

        Cache::flush();
        $resAfter = $this->getJson('/api/v1/home?year=2026');
        $resAfter->assertOk();

        $afterWaqf = (float) $resAfter->json('finance.total_waqf_collected');
        $afterTotal = (float) $resAfter->json('finance.total_collected');

        $this->assertEquals($initWaqf + 1_000_000, $afterWaqf);
        $this->assertEquals($initTotal + 1_500_000, $afterTotal);
        $this->assertNotEquals($afterWaqf, $afterTotal);
    }

    /**
     * Test 3: total_distributed comes from posted journal lines.
     */
    public function test_total_distributed_comes_from_posted_journal_lines(): void
    {
        $resBefore = $this->getJson('/api/v1/home?year=2026');
        $initDist = (float) $resBefore->json('finance.total_distributed');

        $this->postTestJournal('2026-04-10', $this->distributionAccount, $this->bankAccount, 800_000, 'posted', 'Penyaluran Beasiswa');

        Cache::flush();
        $resAfter = $this->getJson('/api/v1/home?year=2026');
        $resAfter->assertOk();

        $this->assertEquals($initDist + 800_000, (float) $resAfter->json('finance.total_distributed'));
        $this->assertEquals($initDist + 800_000, (float) $resAfter->json('stats.total_distributed'));
    }

    /**
     * Test 4: draft journal is excluded.
     */
    public function test_draft_journal_is_excluded(): void
    {
        $resBefore = $this->getJson('/api/v1/home?year=2026');
        $initCollected = (float) $resBefore->json('finance.total_collected');

        // Create draft journal (status = draft)
        $this->postTestJournal('2026-05-10', $this->bankAccount, $this->waqfRevenueAccount, 2_000_000, 'draft', 'Draft Revenue Journal');

        Cache::flush();
        $resAfter = $this->getJson('/api/v1/home?year=2026');
        $resAfter->assertOk();

        $this->assertEquals($initCollected, (float) $resAfter->json('finance.total_collected'));
    }

    /**
     * Test 5: void journal is excluded.
     */
    public function test_void_journal_is_excluded(): void
    {
        $resBefore = $this->getJson('/api/v1/home?year=2026');
        $initCollected = (float) $resBefore->json('finance.total_collected');

        // Create draft journal, then void it
        $journal = $this->postTestJournal('2026-05-12', $this->bankAccount, $this->waqfRevenueAccount, 750_000, 'draft', 'Void Candidate');
        $journal->update(['status' => 'void']);

        Cache::flush();
        $res = $this->getJson('/api/v1/home?year=2026');
        $res->assertOk();

        $this->assertEquals($initCollected, (float) $res->json('finance.total_collected'));
    }

    /**
     * Test 6: verified donations count remains operational paid count.
     */
    public function test_verified_donations_count_remains_operational_paid_count(): void
    {
        $resBefore = $this->getJson('/api/v1/home?year=2026');
        $initCount = (int) $resBefore->json('finance.verified_donations');

        Donation::create([
            'donation_code'  => 'TEST-PAID-01',
            'amount'         => 100_000,
            'status'         => 'paid',
            'paid_at'        => '2026-06-01 10:00:00',
            'payment_source' => 'manual',
        ]);

        Donation::create([
            'donation_code'  => 'TEST-PENDING-01',
            'amount'         => 50_000,
            'status'         => 'pending',
            'payment_source' => 'manual',
        ]);

        Cache::flush();
        $resAfter = $this->getJson('/api/v1/home?year=2026');
        $resAfter->assertOk();

        $this->assertEquals($initCount + 1, (int) $resAfter->json('finance.verified_donations'));
        $this->assertEquals($initCount + 1, (int) $resAfter->json('stats.verified_donations'));
        $this->assertEquals($initCount + 1, (int) $resAfter->json('stats.total_donations'));
    }

    /**
     * Test 7: program distribution count requires posted journal.
     */
    public function test_program_distribution_count_requires_posted_journal(): void
    {
        $resBefore = $this->getJson('/api/v1/home?year=2026');
        $initCount = (int) $resBefore->json('finance.program_distributions');

        $program = Program::query()->first() ?? Program::create([
            'title'        => 'Program Uji Integrasi',
            'target_amount'=> 5_000_000,
            'status'       => 'active',
        ]);

        // Allocation 1: posted journal via observer
        Allocation::create([
            'user_id'      => $this->user->id,
            'program_id'   => $program->id,
            'amount'       => 200_000,
            'description'  => 'Penyaluran Posted Journal',
            'allocated_at' => '2026-06-05',
        ]);

        // Allocation 2: unjournaled allocation
        Allocation::withoutEvents(function () use ($program) {
            Allocation::create([
                'user_id'      => $this->user->id,
                'program_id'   => $program->id,
                'amount'       => 150_000,
                'description'  => 'Penyaluran Tanpa Jurnal',
                'allocated_at' => '2026-06-06',
            ]);
        });

        Cache::flush();
        $resAfter = $this->getJson('/api/v1/home?year=2026');
        $resAfter->assertOk();

        $this->assertEquals($initCount + 1, (int) $resAfter->json('finance.program_distributions'));
        $this->assertEquals($initCount + 1, (int) $resAfter->json('stats.program_distributions'));
    }

    /**
     * Test 8: monthly realization comes from accounting transaction_date.
     */
    public function test_monthly_realization_comes_from_accounting_transaction_date(): void
    {
        // Post journal with transaction_date in July (month 7)
        $this->postTestJournal('2026-07-20', $this->bankAccount, $this->waqfRevenueAccount, 400_000, 'posted', 'Realisasi Juli');

        Cache::flush();
        $res = $this->getJson('/api/v1/home?year=2026');
        $res->assertOk();

        $monthly = $res->json('finance.monthly_realization');
        $this->assertIsArray($monthly);
        $this->assertCount(12, $monthly);

        $july = $monthly[6]; // index 6 is month 7
        $this->assertEquals(7, $july['month']);
        $this->assertGreaterThanOrEqual(400_000, (float) $july['collected']);
    }

    /**
     * Test 9: synthetic 7% expense is absent.
     */
    public function test_synthetic_7_percent_expense_is_absent(): void
    {
        // Post revenue of 10_000_000
        $this->postTestJournal('2026-08-01', $this->bankAccount, $this->waqfRevenueAccount, 10_000_000, 'posted', 'Aktivitas Besar');

        Cache::flush();
        $res = $this->getJson('/api/v1/home?year=2026');
        $res->assertOk();

        $monthly = $res->json('finance.monthly_realization');
        $august = $monthly[7]; // index 7 is month 8

        $this->assertEquals(0.0, (float) $august['total_expense']);
        $this->assertEquals(0.0, (float) $august['nazhir_expense']);
        $this->assertEquals(0.0, (float) $august['operational_expense']);
    }

    /**
     * Test 10: RoWA is null / unavailable.
     */
    public function test_rowa_is_null_or_unavailable(): void
    {
        $res = $this->getJson('/api/v1/home?year=2026');
        $res->assertOk();

        $this->assertNull($res->json('finance.rowa'));
        $this->assertEquals('productive_asset_base_unavailable', $res->json('finance.rowa_status'));
        $this->assertNull($res->json('stats.average_rowa'));
        $this->assertNull($res->json('stats.rowa'));
    }

    /**
     * Test 11: monthly RoWA is null / unavailable.
     */
    public function test_monthly_rowa_is_null_across_all_months(): void
    {
        $res = $this->getJson('/api/v1/home?year=2026');
        $res->assertOk();

        $monthly = $res->json('finance.monthly_realization');
        foreach ($monthly as $row) {
            $this->assertNull($row['rowa'], "Month {$row['month']} RoWA must be null");
            $this->assertEquals('monthly_asset_basis_unavailable', $row['rowa_status']);
        }

        $monthlyTrends = $res->json('stats.monthly_trends');
        foreach ($monthlyTrends as $trend) {
            $this->assertNull($trend['rowa'], "Monthly trend {$trend['month_key']} RoWA must be null");
        }
    }

    /**
     * Test 12: available balance is computed and available.
     */
    public function test_available_balance_is_null_definition_required(): void
    {
        $res = $this->getJson('/api/v1/home?year=2026');
        $res->assertOk();

        $this->assertNotNull($res->json('finance.available_balance'));
        $this->assertEquals('available', $res->json('finance.available_balance_status'));
        $this->assertNotNull($res->json('stats.available_balance'));
    }

    /**
     * Test 13: no donor names exposed in finance payload.
     */
    public function test_no_donor_names_exposed_in_finance_payload(): void
    {
        Donation::create([
            'donation_code'  => 'DONOR-PRIVATE-01',
            'donor_name'     => 'Hamba Allah Rahasia',
            'donor_email'    => 'secret@example.com',
            'amount'         => 500_000,
            'status'         => 'paid',
            'paid_at'        => '2026-09-01 12:00:00',
            'payment_source' => 'manual',
        ]);

        Cache::flush();
        $res = $this->getJson('/api/v1/home?year=2026');
        $res->assertOk();

        $financeContent = json_encode($res->json('finance'));
        $this->assertStringNotContainsString('Hamba Allah Rahasia', $financeContent);
        $this->assertStringNotContainsString('secret@example.com', $financeContent);
    }

    /**
     * Test 14: no journal/account internal IDs exposed.
     */
    public function test_no_journal_account_internal_ids_exposed(): void
    {
        $res = $this->getJson('/api/v1/home?year=2026');
        $res->assertOk();

        $financeKeys = array_keys($res->json('finance'));
        $forbiddenKeys = ['journal_id', 'account_id', 'journal_number', 'account_code', 'debit', 'credit'];

        foreach ($forbiddenKeys as $fk) {
            $this->assertNotContains($fk, $financeKeys, "Finance payload should not expose internal key {$fk}");
        }
    }

    /**
     * Test 15: existing non-financial /home payload remains available.
     */
    public function test_existing_non_financial_home_payload_remains_available(): void
    {
        Article::create([
            'title'     => 'Artikel Test Literasi Wakaf',
            'slug'      => 'artikel-test-literasi-wakaf',
            'body'      => 'Konten artikel pengujian',
            'status'    => 'published',
            'created_at'=> now(),
        ]);

        Partner::create([
            'name'      => 'Mitra Kerjasama DPF',
            'status'    => 'active',
        ]);

        Cache::flush();
        $res = $this->getJson('/api/v1/home');
        $res->assertOk();

        $this->assertArrayHasKey('highlights', $res->json());
        $this->assertArrayHasKey('latest_articles', $res->json());
        $this->assertArrayHasKey('partners', $res->json());
        $this->assertArrayHasKey('selected_year', $res->json());
        $this->assertArrayHasKey('available_years', $res->json());
        $this->assertArrayHasKey('program_allocations', $res->json('stats'));
    }

    /**
     * Test 16: response remains backward-compatible where safe.
     */
    public function test_response_remains_backward_compatible_where_safe(): void
    {
        $res = $this->getJson('/api/v1/home?year=2026');
        $res->assertOk();

        $stats = $res->json('stats');
        $this->assertArrayHasKey('total_programs', $stats);
        $this->assertArrayHasKey('total_donations', $stats);
        $this->assertArrayHasKey('amount_collected', $stats);
        $this->assertArrayHasKey('total_allocations', $stats);
        $this->assertArrayHasKey('amount_allocated', $stats);
        $this->assertArrayHasKey('total_expense', $stats);
        $this->assertArrayHasKey('average_rowa', $stats);
        $this->assertArrayHasKey('monthly_trends', $stats);

        // Aliased values match verified finance values
        $this->assertEquals($res->json('finance.total_collected'), $stats['amount_collected']);
        $this->assertEquals($res->json('finance.total_distributed'), $stats['amount_allocated']);
    }

    /**
     * Test 17: direct value consistency between PublicFinanceReadService and GET /api/v1/home.
     */
    public function test_direct_value_consistency_between_service_and_api(): void
    {
        // 1. Post recognized waqf revenue
        $this->postTestJournal('2026-03-10', $this->bankAccount, $this->waqfRevenueAccount, 15000000);

        // 2. Post recognized infaq revenue
        $this->postTestJournal('2026-03-11', $this->bankAccount, $this->infaqRevenueAccount, 5000000);

        // 3. Post distribution expense
        $this->postTestJournal('2026-03-15', $this->distributionAccount, $this->bankAccount, 8000000);

        // 4. Create paid donation
        Donation::create([
            'donation_code'  => 'TEST-CONSIST-01',
            'user_id' => $this->user->id,
            'campaign_id' => Program::first()->id,
            'donor_name' => 'Consistent Donor',
            'amount' => 500000,
            'status' => 'paid',
            'paid_at' => '2026-03-10 10:00:00',
            'payment_source' => 'manual',
        ]);

        // 5. Create allocation with posted journal
        Allocation::create([
            'user_id' => $this->user->id,
            'program_id' => Program::first()->id,
            'amount' => 8000000,
            'description' => 'Direct Consistency Allocation',
            'allocated_at' => '2026-03-15',
        ]);

        $service = app(\App\Services\PublicFinanceReadService::class);
        $serviceSummary = $service->getPublicSummary(2026)['summary'];

        Cache::flush();
        $response = $this->getJson('/api/v1/home?year=2026');
        $response->assertOk();
        $apiFinance = $response->json('finance');

        $this->assertEquals($serviceSummary['total_collected'], $apiFinance['total_collected']);
        $this->assertEquals($serviceSummary['total_waqf_collected'], $apiFinance['total_waqf_collected']);
        $this->assertEquals($serviceSummary['total_distributed'], $apiFinance['total_distributed']);
        $this->assertEquals($serviceSummary['verified_donations'], $apiFinance['verified_donations']);
        $this->assertEquals($serviceSummary['program_distributions'], $apiFinance['program_distributions']);
        $this->assertEquals($serviceSummary['nazhir_expense'], $apiFinance['nazhir_expense']);
        $this->assertEquals($serviceSummary['operational_expense'], $apiFinance['operational_expense']);
        $this->assertEquals($serviceSummary['available_balance'], $apiFinance['available_balance']);
        $this->assertEquals($serviceSummary['rowa'], $apiFinance['rowa']);
    }
}

