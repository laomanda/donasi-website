<?php

declare(strict_types=1);

namespace Tests\Feature\Finance;

use App\Models\Account;
use App\Models\AccountingPeriod;
use App\Models\Allocation;
use App\Models\Donation;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\Program;
use App\Models\User;
use App\Models\Wakif;
use App\Models\WaqfAsset;
use App\Models\WaqfAssetCategory;
use App\Services\JournalService;
use App\Services\PublicFinanceCacheService;
use Carbon\Carbon;
use Database\Seeders\AccountingPeriodSeeder;
use Database\Seeders\AccountSeeder;
use Database\Seeders\WaqfAssetCategorySeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PublicFinanceDataFreshnessTest extends TestCase
{
    use DatabaseTransactions;

    protected User $user;
    protected AccountingPeriod $period2025;
    protected AccountingPeriod $period2026;
    protected AccountingPeriod $period2030;
    protected Account $bankAccount;
    protected Account $waqfRevenueAccount;
    protected Account $infaqTerikatAccount;
    protected Account $hasilPengelolaanAccount;
    protected Account $distributionAccount;
    protected Account $nazhirExpenseAccount;
    protected Account $operationalExpenseAccount;
    protected Account $liabilityAccount;
    protected JournalService $journalService;
    protected PublicFinanceCacheService $cacheService;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();
        PublicFinanceCacheService::$forceImmediate = true;

        if (Account::count() === 0) {
            $this->seed(AccountSeeder::class);
        }
        if (AccountingPeriod::count() === 0) {
            $this->seed(AccountingPeriodSeeder::class);
        }
        if (WaqfAssetCategory::count() === 0) {
            $this->seed(WaqfAssetCategorySeeder::class);
        }

        $this->user = User::first() ?? User::factory()->create();
        $this->journalService = app(JournalService::class);
        $this->cacheService = app(PublicFinanceCacheService::class);

        $this->period2025 = AccountingPeriod::firstOrCreate(
            ['name' => 'Tahun Buku 2025'],
            [
                'start_date' => '2025-01-01',
                'end_date'   => '2025-12-31',
                'status'     => 'open',
                'is_closed'  => 0,
            ]
        );

        $this->period2026 = AccountingPeriod::firstOrCreate(
            ['name' => 'Tahun Buku 2026'],
            [
                'start_date' => '2026-01-01',
                'end_date'   => '2026-12-31',
                'status'     => 'open',
                'is_closed'  => 0,
            ]
        );

        $this->period2030 = AccountingPeriod::firstOrCreate(
            ['name' => 'Tahun Buku 2030'],
            [
                'start_date' => '2030-01-01',
                'end_date'   => '2030-12-31',
                'status'     => 'open',
                'is_closed'  => 0,
            ]
        );

        $this->bankAccount = Account::where('code', '1111')->firstOrFail();
        $this->waqfRevenueAccount = Account::where('code', '4110')->firstOrFail();
        $this->infaqTerikatAccount = Account::where('code', '4310')->firstOrFail();
        $this->hasilPengelolaanAccount = Account::where('code', '4200')->firstOrFail();
        $this->distributionAccount = Account::where('code', '5100')->firstOrFail();
        $this->nazhirExpenseAccount = Account::where('code', '5200')->firstOrFail();
        $this->operationalExpenseAccount = Account::where('code', '5300')->firstOrFail();
        $this->liabilityAccount = Account::where('code', '2120')->firstOrFail();
    }

    protected function tearDown(): void
    {
        PublicFinanceCacheService::$forceImmediate = false;
        Cache::flush();
        parent::tearDown();
    }

    /**
     * Test 1: Posted journal immediately invalidates public finance cache.
     */
    public function test_posted_journal_invalidates_public_finance_cache(): void
    {
        // 1. Initial request caches response
        $res1 = $this->getJson('/api/v1/home?year=2026');
        $res1->assertStatus(200);
        $initialCollected = (float) $res1->json('finance.total_collected');

        $this->assertTrue(Cache::has('frontend.home.year_2026'));

        // 2. Post a new authoritative journal in 2026
        $journal = $this->journalService->createJournal([
            'transaction_date'     => '2026-03-15',
            'accounting_period_id' => $this->period2026->id,
            'description'          => 'Penerimaan Donasi Baru Freshness Test',
            'status'               => 'draft',
            'journal_lines'        => [
                ['account_id' => $this->bankAccount->id, 'debit' => 15000000, 'credit' => 0],
                ['account_id' => $this->waqfRevenueAccount->id, 'debit' => 0, 'credit' => 15000000],
            ],
        ], $this->user);

        $this->journalService->postJournal($journal, $this->user);

        // 3. Cache must be cleared for 2026
        $this->assertFalse(Cache::has('frontend.home.year_2026'));

        // 4. Immediate second request must return new value
        $res2 = $this->getJson('/api/v1/home?year=2026');
        $res2->assertStatus(200);
        $newCollected = (float) $res2->json('finance.total_collected');

        $this->assertEquals($initialCollected + 15000000, $newCollected);
    }

    /**
     * Test 2: Targeted year isolation preserves cache for unaffected years.
     */
    public function test_year_isolation_preserves_unrelated_year_cache(): void
    {
        // 1. Cache both 2025 and 2026
        $this->getJson('/api/v1/home?year=2025')->assertStatus(200);
        $this->getJson('/api/v1/home?year=2026')->assertStatus(200);

        $this->assertTrue(Cache::has('frontend.home.year_2025'));
        $this->assertTrue(Cache::has('frontend.home.year_2026'));

        // 2. Post a 2026 journal
        $journal = $this->journalService->createJournal([
            'transaction_date'     => '2026-05-10',
            'accounting_period_id' => $this->period2026->id,
            'description'          => '2026 Isolated Transaction',
            'status'               => 'draft',
            'journal_lines'        => [
                ['account_id' => $this->bankAccount->id, 'debit' => 5000000, 'credit' => 0],
                ['account_id' => $this->waqfRevenueAccount->id, 'debit' => 0, 'credit' => 5000000],
            ],
        ], $this->user);

        $this->journalService->postJournal($journal, $this->user);

        // 3. 2026 cache must be invalidated, 2025 cache must remain preserved
        $this->assertFalse(Cache::has('frontend.home.year_2026'));
        $this->assertTrue(Cache::has('frontend.home.year_2025'));
    }

    /**
     * Test 3: Donation status paid immediately updates verified_donations counter.
     */
    public function test_donation_counter_invalidates_cache_immediately_when_paid(): void
    {
        // 1. Cache public home
        $res1 = $this->getJson('/api/v1/home');
        $res1->assertStatus(200);
        $initialCount = (int) $res1->json('finance.verified_donations');

        // 2. Create and pay a donation
        $donation = Donation::create([
            'donation_code'  => 'DN-FRESH-001',
            'donor_name'     => 'Donatur Freshness',
            'donor_phone'    => '081234567890',
            'amount'         => 250000,
            'payment_method' => 'bank_transfer',
            'payment_source' => 'manual',
            'payment_status' => 'pending',
            'status'         => 'pending',
        ]);

        $donation->update([
            'status'  => 'paid',
            'paid_at' => now(),
        ]);

        // 3. Immediate next request reflects new verified donations count
        $res2 = $this->getJson('/api/v1/home');
        $res2->assertStatus(200);
        $newCount = (int) $res2->json('finance.verified_donations');

        $this->assertEquals($initialCount + 1, $newCount);
    }

    /**
     * Test 4: Program distribution counter invalidates cache immediately.
     */
    public function test_allocation_counter_invalidates_cache_immediately(): void
    {
        $program = Program::first() ?? Program::create([
            'title'             => 'Program Freshness',
            'slug'              => 'program-freshness',
            'short_description' => 'Test Freshness',
            'description'       => 'Test Freshness',
            'status'            => 'active',
            'target_amount'     => 10000000,
        ]);

        // 1. Cache public home
        $res1 = $this->getJson('/api/v1/home');
        $res1->assertStatus(200);
        $initialDistCount = (int) $res1->json('finance.program_distributions');

        // 2. Create allocation with posted journal
        $allocation = Allocation::create([
            'program_id'      => $program->id,
            'user_id'         => $this->user->id,
            'amount'          => 2000000,
            'allocation_date' => '2026-06-01',
            'description'     => 'Penyaluran Freshness',
        ]);

        // Create linked posted journal for allocation
        $journal = $this->journalService->createJournal([
            'transaction_date'     => '2026-06-01',
            'accounting_period_id' => $this->period2026->id,
            'reference_type'       => 'allocation',
            'reference_id'         => $allocation->id,
            'program_id'           => $program->id,
            'description'          => 'Journal for Allocation Freshness',
            'status'               => 'draft',
            'journal_lines'        => [
                ['account_id' => $this->distributionAccount->id, 'debit' => 2000000, 'credit' => 0],
                ['account_id' => $this->bankAccount->id, 'debit' => 0, 'credit' => 2000000],
            ],
        ], $this->user);

        $this->journalService->postJournal($journal, $this->user);

        // 3. Immediate request reflects new program distributions count
        $res2 = $this->getJson('/api/v1/home');
        $res2->assertStatus(200);
        $newDistCount = (int) $res2->json('finance.program_distributions');

        $this->assertGreaterThanOrEqual($initialDistCount + 1, $newDistCount);
    }

    /**
     * Test 5: Posted distribution journal recalculates RoWA and invalidates cache.
     */
    /**
     * Test 5: Posted distribution journal recalculates RoWA and invalidates cache.
     */
    public function test_posted_distribution_recalculates_rowa_and_invalidates_cache(): void
    {
        // 1. Post waqf journal: 200m in 2030
        $waqfJournal = $this->journalService->createJournal([
            'transaction_date'     => '2030-02-10',
            'accounting_period_id' => $this->period2030->id,
            'description'          => 'Initial Waqf for RoWA Cache Test',
            'status'               => 'draft',
            'journal_lines'        => [
                ['account_id' => $this->bankAccount->id, 'debit' => 200000000, 'credit' => 0],
                ['account_id' => $this->waqfRevenueAccount->id, 'debit' => 0, 'credit' => 200000000],
            ],
        ], $this->user);
        $this->journalService->postJournal($waqfJournal, $this->user);

        // 2. Initial request caches response: total_distributed is 0, so rowa is null
        $res1 = $this->getJson('/api/v1/home?year=2030');
        $res1->assertStatus(200);
        $this->assertEquals('distribution_base_unavailable', $res1->json('finance.rowa_status'));
        $this->assertNull($res1->json('finance.rowa'));
        $this->assertTrue(Cache::has('frontend.home.year_2030'));

        // 3. Post distribution journal: 100m in 2030
        $distJournal = $this->journalService->createJournal([
            'transaction_date'     => '2030-02-15',
            'accounting_period_id' => $this->period2030->id,
            'description'          => 'Distribution for RoWA Cache Test',
            'status'               => 'draft',
            'journal_lines'        => [
                ['account_id' => $this->distributionAccount->id, 'debit' => 100000000, 'credit' => 0],
                ['account_id' => $this->bankAccount->id, 'debit' => 0, 'credit' => 100000000],
            ],
        ], $this->user);
        $this->journalService->postJournal($distJournal, $this->user);

        // 4. Cache must be cleared
        $this->assertFalse(Cache::has('frontend.home.year_2030'));

        // 5. Immediate second request recomputes RoWA = 200m / 100m = 2.0
        $res2 = $this->getJson('/api/v1/home?year=2030');
        $res2->assertStatus(200);
        $this->assertEquals('available', $res2->json('finance.rowa_status'));
        $this->assertEquals(2.0, (float) $res2->json('finance.rowa'));
    }

    /**
     * Test 6: Additional posted waqf journal recalculates RoWA immediately.
     */
    public function test_posted_waqf_recalculates_rowa_immediately(): void
    {
        // 1. Post initial waqf (200m) and distribution (100m) in 2030
        $waqfJournal = $this->journalService->createJournal([
            'transaction_date'     => '2030-03-01',
            'accounting_period_id' => $this->period2030->id,
            'description'          => 'Initial Waqf Test 6',
            'status'               => 'draft',
            'journal_lines'        => [
                ['account_id' => $this->bankAccount->id, 'debit' => 200000000, 'credit' => 0],
                ['account_id' => $this->waqfRevenueAccount->id, 'debit' => 0, 'credit' => 200000000],
            ],
        ], $this->user);
        $this->journalService->postJournal($waqfJournal, $this->user);

        $distJournal = $this->journalService->createJournal([
            'transaction_date'     => '2030-03-05',
            'accounting_period_id' => $this->period2030->id,
            'description'          => 'Initial Distribution Test 6',
            'status'               => 'draft',
            'journal_lines'        => [
                ['account_id' => $this->distributionAccount->id, 'debit' => 100000000, 'credit' => 0],
                ['account_id' => $this->bankAccount->id, 'debit' => 0, 'credit' => 100000000],
            ],
        ], $this->user);
        $this->journalService->postJournal($distJournal, $this->user);

        // Cache initial RoWA (2.0)
        $res1 = $this->getJson('/api/v1/home?year=2030');
        $res1->assertStatus(200);
        $this->assertEquals(2.0, (float) $res1->json('finance.rowa'));

        // 2. Post additional waqf of 100m (total 300m) in 2030
        $waqfJournal2 = $this->journalService->createJournal([
            'transaction_date'     => '2030-03-10',
            'accounting_period_id' => $this->period2030->id,
            'description'          => 'Additional Waqf Test 6',
            'status'               => 'draft',
            'journal_lines'        => [
                ['account_id' => $this->bankAccount->id, 'debit' => 100000000, 'credit' => 0],
                ['account_id' => $this->waqfRevenueAccount->id, 'debit' => 0, 'credit' => 100000000],
            ],
        ], $this->user);
        $this->journalService->postJournal($waqfJournal2, $this->user);

        // 3. Cache must be cleared
        $this->assertFalse(Cache::has('frontend.home.year_2030'));

        // 4. Immediate request returns updated RoWA = 300m / 100m = 3.0
        $res2 = $this->getJson('/api/v1/home?year=2030');
        $res2->assertStatus(200);
        $this->assertEquals(3.0, (float) $res2->json('finance.rowa'));
    }

    /**
     * Test 7: InvalidateAll successfully clears all tracked and recent year caches.
     */
    public function test_invalidate_all_clears_all_caches(): void
    {
        Cache::put('frontend.home', ['test' => 'all_time'], 120);
        Cache::put('frontend.home.year_2025', ['test' => '2025'], 120);
        Cache::put('frontend.home.year_2026', ['test' => '2026'], 120);
        Cache::put('frontend_donation_summary', ['test' => 'summary'], 120);

        $this->assertTrue(Cache::has('frontend.home'));
        $this->assertTrue(Cache::has('frontend.home.year_2025'));
        $this->assertTrue(Cache::has('frontend.home.year_2026'));
        $this->assertTrue(Cache::has('frontend_donation_summary'));

        $this->cacheService->invalidateAll();

        $this->assertFalse(Cache::has('frontend.home'));
        $this->assertFalse(Cache::has('frontend.home.year_2025'));
        $this->assertFalse(Cache::has('frontend.home.year_2026'));
        $this->assertFalse(Cache::has('frontend_donation_summary'));
    }

    /**
     * Test 8: Accounting period update invalidates affected year cache.
     */
    public function test_accounting_period_update_invalidates_cache(): void
    {
        Cache::put('frontend.home.year_2026', ['test' => 'cached'], 120);
        $this->assertTrue(Cache::has('frontend.home.year_2026'));

        $this->period2026->update(['status' => 'closed']);

        $this->assertFalse(Cache::has('frontend.home.year_2026'));
    }

    /**
     * Test 9: Failed database transaction rolls back without publishing partial state.
     */
    public function test_failed_database_transaction_rolls_back_safely(): void
    {
        $initialCount = JournalEntry::count();

        try {
            DB::transaction(function () {
                JournalEntry::create([
                    'accounting_period_id' => $this->period2026->id,
                    'journal_number'       => 'JU-FAIL-999',
                    'transaction_date'     => '2026-07-01',
                    'status'               => 'draft',
                    'description'          => 'Should be rolled back',
                    'created_by'           => $this->user->id,
                ]);

                throw new \RuntimeException('Simulated failure during transaction');
            });
        } catch (\RuntimeException) {
            // Expected
        }

        $this->assertEquals($initialCount, JournalEntry::count());
    }
}

