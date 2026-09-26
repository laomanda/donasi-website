<?php

namespace Tests\Feature\Finance;

use App\Models\Account;
use App\Models\AccountingPeriod;
use App\Models\User;
use App\Services\JournalService;
use App\Services\TrialBalanceService;
use Database\Seeders\AccountSeeder;
use Database\Seeders\AccountingPeriodSeeder;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class TrialBalanceEngineTest extends TestCase
{
    protected TrialBalanceService $tbService;
    protected JournalService $journalService;
    protected User $user;
    protected AccountingPeriod $period;
    protected Account $bankAccount;
    protected Account $revenueAccount;
    protected Account $expenseAccount;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tbService = app(TrialBalanceService::class);
        $this->journalService = app(JournalService::class);

        // Ensure COA & Period exist
        if (Account::count() === 0) {
            $this->seed(AccountSeeder::class);
        }
        if (AccountingPeriod::count() === 0) {
            $this->seed(AccountingPeriodSeeder::class);
        }

        $this->user = User::first() ?? User::factory()->create();

        // Assign superadmin role if spatie roles are active
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

        $this->bankAccount = Account::where('code', '1112')->first() ?? Account::create([
            'code'           => '1112',
            'name'           => 'Bank BSI - Rekening Wakaf',
            'account_type'   => 'asset',
            'normal_balance' => 'debit',
            'is_active'      => true,
        ]);

        $this->revenueAccount = Account::where('code', '4110')->first() ?? Account::create([
            'code'           => '4110',
            'name'           => 'Penerimaan Wakaf Uang - Abadi',
            'account_type'   => 'revenue',
            'normal_balance' => 'credit',
            'is_active'      => true,
        ]);

        $this->expenseAccount = Account::where('code', '5110')->first() ?? Account::create([
            'code'           => '5110',
            'name'           => 'Penyaluran Program Pendidikan & Beasiswa',
            'account_type'   => 'expense',
            'normal_balance' => 'debit',
            'is_active'      => true,
        ]);
    }

    /**
     * Test 1: Buat jurnal posted:
     * Debit: Bank 10 juta
     * Credit: Revenue 10 juta
     *
     * Request Trial Balance:
     * Expected: Bank muncul debit 10 juta, Revenue muncul kredit 10 juta.
     */
    public function test_posted_journal_appears_in_trial_balance_debit_and_credit(): void
    {
        // 1. Buat akun terisolasi untuk pengujian spesifik
        $uniqueCode1 = '1118-' . uniqid();
        $uniqueCode2 = '4199-' . uniqid();

        $isolatedBank = Account::create([
            'code'           => $uniqueCode1,
            'name'           => 'Bank Uji Coba TB',
            'account_type'   => 'asset',
            'normal_balance' => 'debit',
            'is_active'      => true,
        ]);

        $isolatedRevenue = Account::create([
            'code'           => $uniqueCode2,
            'name'           => 'Pendapatan Uji Coba TB',
            'account_type'   => 'revenue',
            'normal_balance' => 'credit',
            'is_active'      => true,
        ]);

        // Buat jurnal posted 10 juta
        $this->journalService->createJournal([
            'transaction_date'     => '2026-09-01',
            'accounting_period_id' => $this->period->id,
            'description'          => 'Penerimaan donasi wakaf via Bank Uji Coba',
            'status'               => 'posted',
            'journal_lines'        => [
                [
                    'account_id'  => $isolatedBank->id,
                    'debit'       => 10000000.00,
                    'credit'      => 0.00,
                    'description' => 'Debit Kas Bank',
                ],
                [
                    'account_id'  => $isolatedRevenue->id,
                    'debit'       => 0.00,
                    'credit'      => 10000000.00,
                    'description' => 'Kredit Pendapatan Wakaf',
                ],
            ],
        ], $this->user);

        // 2. Request Trial Balance
        $tb = $this->tbService->getTrialBalance($this->period->id);
        $accounts = collect($tb['accounts']);

        $bankRow = $accounts->firstWhere('account_id', $isolatedBank->id);
        $revenueRow = $accounts->firstWhere('account_id', $isolatedRevenue->id);

        $this->assertNotNull($bankRow, 'Akun Bank harus muncul di Neraca Saldo.');
        $this->assertNotNull($revenueRow, 'Akun Revenue harus muncul di Neraca Saldo.');

        // Bank muncul debit 10 juta
        $this->assertEquals(10000000.00, $bankRow['total_debit']);
        $this->assertEquals(0.00, $bankRow['total_credit']);
        $this->assertEquals(10000000.00, $bankRow['ending_balance']);
        $this->assertEquals(10000000.00, $bankRow['debit_balance']);
        $this->assertEquals(0.00, $bankRow['credit_balance']);

        // Revenue muncul kredit 10 juta
        $this->assertEquals(0.00, $revenueRow['total_debit']);
        $this->assertEquals(10000000.00, $revenueRow['total_credit']);
        $this->assertEquals(10000000.00, $revenueRow['ending_balance']);
        $this->assertEquals(0.00, $revenueRow['debit_balance']);
        $this->assertEquals(10000000.00, $revenueRow['credit_balance']);

        // 3. Verifikasi via API endpoint
        $response = $this->actingAs($this->user)->getJson('/api/v1/finance/trial-balance?period_id=' . $this->period->id);
        $response->assertStatus(200);
        $response->assertJsonPath('status', 'success');
        $response->assertJsonStructure([
            'status',
            'data' => [
                'period',
                'start_date',
                'end_date',
                'total_accounts',
                'total_debit_balance',
                'total_credit_balance',
                'is_balanced',
                'accounts',
            ],
        ]);
    }

    /**
     * Test 2: Jurnal draft -> Tidak dihitung.
     */
    public function test_draft_journal_is_not_counted_in_trial_balance(): void
    {
        $draftBank = Account::create([
            'code'           => '1118-draft-' . uniqid(),
            'name'           => 'Bank Draft Test',
            'account_type'   => 'asset',
            'normal_balance' => 'debit',
            'is_active'      => true,
        ]);

        $draftRevenue = Account::create([
            'code'           => '4199-draft-' . uniqid(),
            'name'           => 'Revenue Draft Test',
            'account_type'   => 'revenue',
            'normal_balance' => 'credit',
            'is_active'      => true,
        ]);

        // Buat jurnal bertipe draft
        $this->journalService->createJournal([
            'transaction_date'     => '2026-09-02',
            'accounting_period_id' => $this->period->id,
            'description'          => 'Jurnal Masih Draft',
            'status'               => 'draft',
            'journal_lines'        => [
                [
                    'account_id'  => $draftBank->id,
                    'debit'       => 5000000.00,
                    'credit'      => 0.00,
                ],
                [
                    'account_id'  => $draftRevenue->id,
                    'debit'       => 0.00,
                    'credit'      => 5000000.00,
                ],
            ],
        ], $this->user);

        $tb = $this->tbService->getTrialBalance($this->period->id);
        $accounts = collect($tb['accounts']);

        $bankRow = $accounts->firstWhere('account_id', $draftBank->id);
        $revenueRow = $accounts->firstWhere('account_id', $draftRevenue->id);

        $this->assertNull($bankRow, 'Akun dengan transaksi draft saja TIDAK boleh muncul di Neraca Saldo.');
        $this->assertNull($revenueRow, 'Akun dengan transaksi draft saja TIDAK boleh muncul di Neraca Saldo.');
    }

    /**
     * Test 3: Trial balance balance check:
     * Expected: is_balanced = true, total_debit_balance == total_credit_balance.
     */
    public function test_trial_balance_is_strictly_balanced(): void
    {
        // Buat transaksi majemuk:
        // 1. Penerimaan donasi: Debit Bank 15.000.000, Credit Revenue 15.000.000
        $this->journalService->createJournal([
            'transaction_date'     => '2026-09-03',
            'accounting_period_id' => $this->period->id,
            'description'          => 'Penerimaan Donasi Kampanye',
            'status'               => 'posted',
            'journal_lines'        => [
                [
                    'account_id'  => $this->bankAccount->id,
                    'debit'       => 15000000.00,
                    'credit'      => 0.00,
                ],
                [
                    'account_id'  => $this->revenueAccount->id,
                    'debit'       => 0.00,
                    'credit'      => 15000000.00,
                ],
            ],
        ], $this->user);

        // 2. Penyaluran program: Debit Beban 6.000.000, Credit Bank 6.000.000
        $this->journalService->createJournal([
            'transaction_date'     => '2026-09-04',
            'accounting_period_id' => $this->period->id,
            'description'          => 'Penyaluran Program Pendidikan Santri',
            'status'               => 'posted',
            'journal_lines'        => [
                [
                    'account_id'  => $this->expenseAccount->id,
                    'debit'       => 6000000.00,
                    'credit'      => 0.00,
                ],
                [
                    'account_id'  => $this->bankAccount->id,
                    'debit'       => 0.00,
                    'credit'      => 6000000.00,
                ],
            ],
        ], $this->user);

        $tb = $this->tbService->getTrialBalance($this->period->id);

        $this->assertTrue($tb['is_balanced'], 'Neraca Saldo harus seimbang (is_balanced = true).');
        $this->assertEquals($tb['total_debit_balance'], $tb['total_credit_balance']);
        $this->assertGreaterThan(0, $tb['total_debit_balance']);
    }

    /**
     * Test 4: Filter tanggal membatasi cakupan transaksi secara presisi
     */
    public function test_trial_balance_filters_by_date_range_accurately(): void
    {
        $filteredBank = Account::create([
            'code'           => '1118-date-' . uniqid(),
            'name'           => 'Bank Date Filter Test',
            'account_type'   => 'asset',
            'normal_balance' => 'debit',
            'is_active'      => true,
        ]);

        $filteredRev = Account::create([
            'code'           => '4199-date-' . uniqid(),
            'name'           => 'Rev Date Filter Test',
            'account_type'   => 'revenue',
            'normal_balance' => 'credit',
            'is_active'      => true,
        ]);

        // Transaksi di bulan Mei (di luar range uji coba)
        $this->journalService->createJournal([
            'transaction_date'     => '2026-05-10',
            'accounting_period_id' => $this->period->id,
            'description'          => 'Transaksi Mei',
            'status'               => 'posted',
            'journal_lines'        => [
                [
                    'account_id'  => $filteredBank->id,
                    'debit'       => 8000000.00,
                    'credit'      => 0.00,
                ],
                [
                    'account_id'  => $filteredRev->id,
                    'debit'       => 0.00,
                    'credit'      => 8000000.00,
                ],
            ],
        ], $this->user);

        // Transaksi di bulan Oktober (dalam range uji coba)
        $this->journalService->createJournal([
            'transaction_date'     => '2026-10-15',
            'accounting_period_id' => $this->period->id,
            'description'          => 'Transaksi Oktober',
            'status'               => 'posted',
            'journal_lines'        => [
                [
                    'account_id'  => $filteredBank->id,
                    'debit'       => 3000000.00,
                    'credit'      => 0.00,
                ],
                [
                    'account_id'  => $filteredRev->id,
                    'debit'       => 0.00,
                    'credit'      => 3000000.00,
                ],
            ],
        ], $this->user);

        // Filter khusus bulan Oktober: 2026-10-01 s.d. 2026-10-31
        $tb = $this->tbService->getTrialBalance(
            $this->period->id,
            '2026-10-01',
            '2026-10-31'
        );

        $accounts = collect($tb['accounts']);
        $bankRow = $accounts->firstWhere('account_id', $filteredBank->id);

        $this->assertNotNull($bankRow);
        // Hanya nominal transaksi Oktober (3.000.000) yang dihitung dalam rentang tanggal
        $this->assertEquals(3000000.00, $bankRow['total_debit']);
        $this->assertEquals(3000000.00, $bankRow['ending_balance']);
        $this->assertTrue($tb['is_balanced']);
    }
}
