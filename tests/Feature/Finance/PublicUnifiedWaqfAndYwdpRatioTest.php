<?php

namespace Tests\Feature\Finance;

use App\Models\Account;
use App\Models\AccountingPeriod;
use App\Models\Donation;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\Program;
use App\Models\User;
use App\Models\Wakif;
use App\Models\WaqfAssetCategory;
use App\Services\PublicFinanceCacheService;
use App\Services\PublicFinanceReadService;
use Database\Seeders\AccountingPeriodSeeder;
use Database\Seeders\AccountSeeder;
use Database\Seeders\WaqfAssetCategorySeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class PublicUnifiedWaqfAndYwdpRatioTest extends TestCase
{
    use DatabaseTransactions;

    protected PublicFinanceReadService $service;
    protected PublicFinanceCacheService $cacheService;
    protected AccountingPeriod $period2025;
    protected AccountingPeriod $period2026;
    protected Account $bankAccount;
    protected Account $wakafAbadiAccount;
    protected Account $wakafTemporerAccount;
    protected Account $wakafMelaluiUangAccount;
    protected Account $hasilPengelolaanAccount;
    protected Account $infaqTerikatAccount;
    protected Account $bebanNazhirAccount;
    protected Account $bebanOperasionalAccount;
    protected Account $penyaluranAccount;
    protected Account $equityAccount;
    protected Wakif $wakif;

    protected function setUp(): void
    {
        parent::setUp();

        if (Account::count() === 0) {
            $this->seed(AccountSeeder::class);
        }
        if (AccountingPeriod::count() === 0) {
            $this->seed(AccountingPeriodSeeder::class);
        }
        if (WaqfAssetCategory::count() === 0) {
            $this->seed(WaqfAssetCategorySeeder::class);
        }

        $this->service = app(PublicFinanceReadService::class);
        $this->cacheService = app(PublicFinanceCacheService::class);

        $this->bankAccount = Account::where('code', '1112')->firstOrFail();
        $this->wakafAbadiAccount = Account::where('code', '4110')->firstOrFail();
        $this->wakafTemporerAccount = Account::where('code', '4120')->firstOrFail();
        $this->wakafMelaluiUangAccount = Account::where('code', '4130')->firstOrFail();
        $this->hasilPengelolaanAccount = Account::where('code', '4210')->firstOrFail();
        $this->infaqTerikatAccount = Account::where('code', '4310')->firstOrFail();
        $this->bebanNazhirAccount = Account::where('code', '5210')->firstOrFail();
        $this->bebanOperasionalAccount = Account::where('code', '5310')->firstOrFail();
        $this->penyaluranAccount = Account::where('code', '5110')->firstOrFail();
        $this->equityAccount = Account::where('code', '3110')->first() ?? Account::where('account_type', 'equity')->firstOrFail();

        $this->wakif = Wakif::firstOrCreate(
            ['email' => 'wakif.unified.test@example.com'],
            ['name' => 'Wakif Unified Test', 'phone' => '0812345678', 'type' => 'individual']
        );

        $this->period2025 = AccountingPeriod::firstOrCreate(
            ['name' => 'Tahun 2025 Test Unified'],
            [
                'start_date' => '2025-01-01',
                'end_date'   => '2025-12-31',
                'status'     => 'closed',
            ]
        );

        $this->period2026 = AccountingPeriod::firstOrCreate(
            ['name' => 'Tahun 2026 Test Unified'],
            [
                'start_date' => '2026-01-01',
                'end_date'   => '2026-12-31',
                'status'     => 'open',
            ]
        );
    }

    protected function createPostedJournal(Account $debitAcc, Account $creditAcc, float $amount, string $date, string $status = 'posted'): JournalEntry
    {
        $year = (int) substr($date, 0, 4);
        $period = $year === 2025 ? $this->period2025 : $this->period2026;

        $entry = JournalEntry::create([
            'accounting_period_id' => $period->id,
            'journal_number'       => 'JRN-' . uniqid(),
            'transaction_date'     => $date,
            'description'          => "Test Journal Entry {$status}",
            'source_type'          => 'manual',
            'status'               => $status,
            'created_by'           => User::first()?->id ?? 1,
            'posted_at'            => $status === 'posted' ? $date . ' 10:00:00' : null,
            'posted_by'            => $status === 'posted' ? (User::first()?->id ?? 1) : null,
        ]);

        JournalEntryLine::create([
            'journal_entry_id' => $entry->id,
            'account_id'       => $debitAcc->id,
            'debit'            => $amount,
            'credit'           => 0,
            'description'      => 'Debit line',
        ]);

        JournalEntryLine::create([
            'journal_entry_id' => $entry->id,
            'account_id'       => $creditAcc->id,
            'debit'            => 0,
            'credit'           => $amount,
            'description'      => 'Credit line',
        ]);

        return $entry;
    }

    /**
     * Test 1: Website and Imported Waqf converge into a single Total Wakaf Terhimpun without double-counting.
     */
    public function test_website_and_imported_waqf_converge_into_single_total_wakaf_terhimpun(): void
    {
        $initialWaqf = $this->service->getTotalWaqfCollected(2026);

        // 1. Website donation recorded in accounting (e.g. 4110)
        $this->createPostedJournal($this->bankAccount, $this->wakafAbadiAccount, 10_000_000.0, '2026-03-01');

        // 2. Excel imported waqf transaction recorded in accounting (e.g. 4120)
        $this->createPostedJournal($this->bankAccount, $this->wakafTemporerAccount, 15_000_000.0, '2026-03-15');

        // 3. Both must converge into getTotalWaqfCollected
        $currentWaqf = $this->service->getTotalWaqfCollected(2026);
        $this->assertEquals($initialWaqf + 25_000_000.0, $currentWaqf);
    }

    /**
     * Test 2: Operational Donation row and Journal Entry representing the same transaction are NOT counted twice.
     */
    public function test_operational_donation_and_journal_do_not_double_count(): void
    {
        $initialWaqf = $this->service->getTotalWaqfCollected(2026);

        // 1. Operational Donation row created
        $program = Program::first() ?? Program::create([
            'title'             => 'Program Test Waqf',
            'slug'              => 'program-test-waqf',
            'short_description' => 'Test Waqf Short Desc',
            'description'       => 'Test Waqf Desc',
            'target_amount'     => 100_000_000,
            'collected_amount'  => 0,
            'status'            => 'active',
        ]);

        // 1. Operational Donation row created with 'paid' status
        // DonationObserver automatically triggers DonationJournalService to create an authoritative posted journal entry
        $donation = Donation::create([
            'donation_code'  => 'DON-' . uniqid(),
            'order_id'       => 'ORD-TEST-' . uniqid(),
            'wakif_id'       => $this->wakif->id,
            'donor_name'     => 'Donor Test',
            'donor_phone'    => '0812345678',
            'donor_email'    => 'donor@example.com',
            'program_id'     => $program->id,
            'amount'         => 5_000_000.0,
            'status'         => 'paid',
            'payment_method' => 'bank_transfer',
            'payment_source' => 'website',
            'paid_at'        => '2026-04-10 10:00:00',
        ]);

        // Verify the journal entry was indeed created for this donation
        $this->assertDatabaseHas('journal_entries', [
            'reference_type' => 'donation',
            'reference_id'   => $donation->id,
            'status'         => 'posted',
        ]);

        // 2. Both Donation table and JournalEntry table now have this 5M record.
        // PublicFinanceReadService queries ONLY authoritative posted journal entries.
        // It must NOT do Donation::sum() + JournalLine::sum() (which would be 10M).
        // It must count exactly 5_000_000.0 once.
        $currentWaqf = $this->service->getTotalWaqfCollected(2026);
        $this->assertEquals($initialWaqf + 5_000_000.0, $currentWaqf);
    }


    /**
     * Test 3: Non-waqf revenue accounts are strictly EXCLUDED from Total Wakaf Terhimpun.
     */
    public function test_non_waqf_revenue_is_excluded_from_total_wakaf_terhimpun(): void
    {
        $initialWaqf = $this->service->getTotalWaqfCollected(2026);
        $initialCollected = $this->service->getTotalCollected(2026);

        // Waqf receipt (4110)
        $this->createPostedJournal($this->bankAccount, $this->wakafAbadiAccount, 50_000_000.0, '2026-05-01');

        // Hasil Pengelolaan Wakaf Produktif (4210) -> non-waqf revenue
        $this->createPostedJournal($this->bankAccount, $this->hasilPengelolaanAccount, 10_000_000.0, '2026-05-02');

        // Infaq/Sedekah Terikat (4310) -> non-waqf revenue
        $this->createPostedJournal($this->bankAccount, $this->infaqTerikatAccount, 5_000_000.0, '2026-05-03');

        $currentWaqf = $this->service->getTotalWaqfCollected(2026);
        $currentCollected = $this->service->getTotalCollected(2026);

        // Total Wakaf Terhimpun only increased by the 4110 waqf receipt
        $this->assertEquals($initialWaqf + 50_000_000.0, $currentWaqf);

        // Total Collected (all revenue) increased by all three: 50M + 10M + 5M = 65M
        $this->assertEquals($initialCollected + 65_000_000.0, $currentCollected);
    }

    /**
     * Test 4: Opening balance on balance sheet does NOT count as a new waqf receipt.
     */
    public function test_opening_balance_does_not_affect_total_wakaf_terhimpun(): void
    {
        $initialWaqf = $this->service->getTotalWaqfCollected(2026);

        // Opening balance journal: Debit Bank (1112), Credit Equity (3110)
        $this->createPostedJournal($this->bankAccount, $this->equityAccount, 100_000_000.0, '2026-01-01');

        $currentWaqf = $this->service->getTotalWaqfCollected(2026);

        // Inflow of waqf revenue remains unchanged
        $this->assertEquals($initialWaqf, $currentWaqf);
    }

    /**
     * Test 5: YWDP Ratio normal formula: (Total Wakaf Terhimpun / Biaya Pengeluaran) * 100%.
     */
    public function test_ywdp_ratio_normal_formula(): void
    {
        // 1. Post waqf = 1,000,000
        $this->createPostedJournal($this->bankAccount, $this->wakafAbadiAccount, 1_000_000.0, '2026-06-01');

        // 2. Post expense = 100,000 (Nazhir 60,000 + Operasional 40,000)
        $this->createPostedJournal($this->bebanNazhirAccount, $this->bankAccount, 60_000.0, '2026-06-05');
        $this->createPostedJournal($this->bebanOperasionalAccount, $this->bankAccount, 40_000.0, '2026-06-06');

        $ratioData = $this->service->getYwdpRatio(2026);

        $this->assertEquals('available', $ratioData['ywdp_ratio_status']);
        $this->assertNotNull($ratioData['ywdp_ratio']);

        // Expected ratio: (Total Wakaf / Total Expense) * 100%
        $expectedRatio = round(($this->service->getTotalWaqfCollected(2026) / $this->service->getTotalExpense(2026)) * 100.0, 2);
        $this->assertEquals($expectedRatio, $ratioData['ywdp_ratio']);
    }

    /**
     * Test 6: Zero or negative expense returns null ratio and 'expense_base_unavailable' status.
     */
    public function test_ywdp_ratio_zero_expense_returns_null_and_unavailable_status(): void
    {
        // For a period with 0 expense, e.g. 2024 where no expenses exist
        $ratioData = $this->service->getYwdpRatio(2024);

        $this->assertNull($ratioData['ywdp_ratio']);
        $this->assertEquals('expense_base_unavailable', $ratioData['ywdp_ratio_status']);
    }

    /**
     * Test 7: Period consistency: Numerator and denominator strictly share the requested period.
     */
    public function test_ywdp_ratio_period_consistency(): void
    {
        // 2025: Wakaf 500,000, Expense 100,000 -> (500,000 / 100,000) * 100 = 500.00%
        $this->createPostedJournal($this->bankAccount, $this->wakafAbadiAccount, 500_000.0, '2025-07-01');
        $this->createPostedJournal($this->bebanNazhirAccount, $this->bankAccount, 100_000.0, '2025-07-02');

        // 2026: Wakaf 1,000,000, Expense 250,000 -> (1,000,000 / 250,000) * 100 = 400.00%
        $this->createPostedJournal($this->bankAccount, $this->wakafAbadiAccount, 1_000_000.0, '2026-07-01');
        $this->createPostedJournal($this->bebanOperasionalAccount, $this->bankAccount, 250_000.0, '2026-07-02');

        $ratio2025 = $this->service->getYwdpRatio(2025);
        $ratio2026 = $this->service->getYwdpRatio(2026);

        $this->assertEquals('available', $ratio2025['ywdp_ratio_status']);
        $this->assertEquals('available', $ratio2026['ywdp_ratio_status']);

        // Verify independent periods
        $expected2025 = round(($this->service->getTotalWaqfCollected(2025) / $this->service->getTotalExpense(2025)) * 100.0, 2);
        $expected2026 = round(($this->service->getTotalWaqfCollected(2026) / $this->service->getTotalExpense(2026)) * 100.0, 2);

        $this->assertEquals($expected2025, $ratio2025['ywdp_ratio']);
        $this->assertEquals($expected2026, $ratio2026['ywdp_ratio']);
        $this->assertNotEquals($ratio2025['ywdp_ratio'], $ratio2026['ywdp_ratio']);
    }

    /**
     * Test 8: Monthly YWDP Ratio uses posted monthly facts honestly.
     */
    public function test_monthly_ywdp_ratio_uses_posted_facts_honestly(): void
    {
        // January 2026: Wakaf 500,000, Expense 100,000 -> 500.00%
        $this->createPostedJournal($this->bankAccount, $this->wakafAbadiAccount, 500_000.0, '2026-01-10');
        $this->createPostedJournal($this->bebanNazhirAccount, $this->bankAccount, 100_000.0, '2026-01-15');

        // February 2026: Wakaf 300,000, Expense 0 -> null, 'expense_base_unavailable'
        $this->createPostedJournal($this->bankAccount, $this->wakafTemporerAccount, 300_000.0, '2026-02-10');

        $monthly = $this->service->getMonthlyRealization(2026);
        $jan = $monthly[0]; // month 1
        $feb = $monthly[1]; // month 2

        $this->assertEquals(1, $jan['month']);
        $this->assertEquals('available', $jan['ywdp_ratio_status']);
        $this->assertEquals(round(($jan['total_waqf_collected'] / $jan['total_expense']) * 100.0, 2), $jan['ywdp_ratio']);

        $this->assertEquals(2, $feb['month']);
        $this->assertEquals('expense_base_unavailable', $feb['ywdp_ratio_status']);
        $this->assertNull($feb['ywdp_ratio']);
    }

    /**
     * Test 9: Public API GET /api/v1/home returns canonical finance payload with ywdp_ratio.
     */
    public function test_public_api_home_payload_structure_and_values(): void
    {
        $this->createPostedJournal($this->bankAccount, $this->wakafAbadiAccount, 2_000_000.0, '2026-08-01');
        $this->createPostedJournal($this->bebanNazhirAccount, $this->bankAccount, 500_000.0, '2026-08-05');

        $res = $this->getJson('/api/v1/home?year=2026');
        $res->assertOk();

        // 1. Canonical finance payload assertions
        $res->assertJsonStructure([
            'finance' => [
                'total_waqf_collected',
                'total_distributed',
                'total_expense',
                'nazhir_expense',
                'operational_expense',
                'available_balance',
                'available_balance_status',
                'ywdp_ratio',
                'ywdp_ratio_status',
                'verified_donations',
                'program_distributions',
                'monthly_realization',
            ],
            'stats' => [
                'total_waqf_collected',
                'total_distributed',
                'total_expense',
                'ywdp_ratio',
                'ywdp_ratio_status',
            ],
        ]);

        $this->assertNotNull($res->json('finance.ywdp_ratio'));
        $this->assertEquals('available', $res->json('finance.ywdp_ratio_status'));

        // Monthly realization item structure
        $firstMonth = $res->json('finance.monthly_realization.0');
        $this->assertArrayHasKey('total_waqf_collected', $firstMonth);
        $this->assertArrayHasKey('ywdp_ratio', $firstMonth);
        $this->assertArrayHasKey('ywdp_ratio_status', $firstMonth);
    }

    /**
     * Test 10: Cache freshness: New posted journal updates total_waqf_collected and ywdp_ratio immediately.
     */
    public function test_cache_invalidation_updates_total_wakaf_and_ywdp_ratio(): void
    {
        // 1. Initial request to prime cache
        $res1 = $this->getJson('/api/v1/home?year=2026');
        $res1->assertOk();
        $initialWaqf = (float) $res1->json('finance.total_waqf_collected');

        // 2. Post new waqf transaction
        $this->createPostedJournal($this->bankAccount, $this->wakafAbadiAccount, 10_000_000.0, '2026-09-01');

        // Invalidate cache through authoritative cache service
        $this->cacheService->invalidateYear(2026);

        // 3. Second request must immediately receive updated values
        $res2 = $this->getJson('/api/v1/home?year=2026');
        $res2->assertOk();
        $newWaqf = (float) $res2->json('finance.total_waqf_collected');

        $this->assertEquals($initialWaqf + 10_000_000.0, $newWaqf);
    }
}
