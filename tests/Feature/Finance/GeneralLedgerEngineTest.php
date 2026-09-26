<?php

namespace Tests\Feature\Finance;

use App\Models\Account;
use App\Models\AccountingPeriod;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\User;
use App\Services\GeneralLedgerService;
use App\Services\JournalService;
use Database\Seeders\AccountSeeder;
use Database\Seeders\AccountingPeriodSeeder;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class GeneralLedgerEngineTest extends TestCase
{
    protected GeneralLedgerService $glService;
    protected JournalService $journalService;
    protected User $user;
    protected AccountingPeriod $period;
    protected Account $bankAccount;
    protected Account $revenueAccount;

    protected function setUp(): void
    {
        parent::setUp();

        $this->glService = app(GeneralLedgerService::class);
        $this->journalService = app(JournalService::class);

        // Ensure COA & Period exist
        if (Account::count() === 0) {
            $this->seed(AccountSeeder::class);
        }
        if (AccountingPeriod::count() === 0) {
            $this->seed(AccountingPeriodSeeder::class);
        }

        $this->user = User::first() ?? User::factory()->create();

        // Assign superadmin or keuangan role if spatie roles are used
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
    }

    /**
     * Test 1: Buat jurnal posted (Debit Bank 10 juta, Credit Revenue 10 juta) -> Request ledger akun Bank.
     * Expected: Debit bertambah 10 juta.
     */
    public function test_posted_journal_increases_ledger_debit_and_balance(): void
    {
        // 1. Ambil saldo awal eksisting bank jika ada data sebelumnya
        $initialLedger = $this->glService->getLedger($this->bankAccount->id);
        $initialClosing = $initialLedger['account']['closing_balance'] ?? 0.0;
        $initialDebit = $initialLedger['account']['total_debit'] ?? 0.0;

        // 2. Buat jurnal 10 juta dan langsung dipost
        $journal = $this->journalService->createJournal([
            'transaction_date'     => '2026-09-01',
            'accounting_period_id' => $this->period->id,
            'description'          => 'Penerimaan Wakaf Tunai Rp 10 Juta',
            'status'               => 'posted',
            'journal_lines'        => [
                [
                    'account_id'  => $this->bankAccount->id,
                    'debit'       => 10000000.00,
                    'credit'      => 0.00,
                    'description' => 'Debit Kas Bank BSI',
                ],
                [
                    'account_id'  => $this->revenueAccount->id,
                    'debit'       => 0.00,
                    'credit'      => 10000000.00,
                    'description' => 'Kredit Penerimaan Wakaf Uang',
                ],
            ],
        ], $this->user);

        $this->assertEquals('posted', $journal->status);

        // 3. Request ledger akun Bank
        $ledger = $this->glService->getLedger($this->bankAccount->id);
        $accountData = $ledger['account'];

        $this->assertNotNull($accountData);
        $this->assertEquals('1112', $accountData['code']);
        $this->assertEquals($initialDebit + 10000000.00, $accountData['total_debit']);
        $this->assertEquals($initialClosing + 10000000.00, $accountData['closing_balance']);

        // Verifikasi transaksi spesifik ada di list
        $foundTransaction = collect($accountData['transactions'])->firstWhere('journal_entry_id', $journal->id);
        $this->assertNotNull($foundTransaction, 'Transaksi jurnal posted harus ada dalam buku besar.');
        $this->assertEquals(10000000.00, $foundTransaction['debit']);
        $this->assertEquals(0.00, $foundTransaction['credit']);

        // Verifikasi juga via API endpoint
        $response = $this->actingAs($this->user)->getJson("/api/v1/finance/general-ledger?account_id={$this->bankAccount->id}");
        $response->assertStatus(200);
        $response->assertJsonPath('status', 'success');
        $response->assertJsonPath('data.account.code', '1112');
    }

    /**
     * Test 2: Buat jurnal draft -> Tidak muncul di ledger.
     */
    public function test_draft_and_void_journals_do_not_appear_in_ledger(): void
    {
        // 1. Buat jurnal draft
        $draftJournal = $this->journalService->createJournal([
            'transaction_date'     => '2026-09-02',
            'accounting_period_id' => $this->period->id,
            'description'          => 'Draft Jurnal Belum Diposting',
            'status'               => 'draft',
            'journal_lines'        => [
                [
                    'account_id'  => $this->bankAccount->id,
                    'debit'       => 5000000.00,
                    'credit'      => 0.00,
                    'description' => 'Draft debit',
                ],
                [
                    'account_id'  => $this->revenueAccount->id,
                    'debit'       => 0.00,
                    'credit'      => 5000000.00,
                    'description' => 'Draft kredit',
                ],
            ],
        ], $this->user);

        // 2. Buat jurnal yang kemudian di-void
        $voidableJournal = $this->journalService->createJournal([
            'transaction_date'     => '2026-09-03',
            'accounting_period_id' => $this->period->id,
            'description'          => 'Jurnal Dibatalkan (Void)',
            'status'               => 'draft',
            'journal_lines'        => [
                [
                    'account_id'  => $this->bankAccount->id,
                    'debit'       => 2000000.00,
                    'credit'      => 0.00,
                ],
                [
                    'account_id'  => $this->revenueAccount->id,
                    'debit'       => 0.00,
                    'credit'      => 2000000.00,
                ],
            ],
        ], $this->user);
        $this->journalService->voidJournal($voidableJournal, 'Kesalahan input dokumen', $this->user);

        // 3. Request ledger
        $ledger = $this->glService->getLedger($this->bankAccount->id);
        $transactions = collect($ledger['account']['transactions']);

        // Pastikan draft dan void TIDAK ADA
        $draftFound = $transactions->firstWhere('journal_entry_id', $draftJournal->id);
        $this->assertNull($draftFound, 'Jurnal draft TIDAK boleh muncul di buku besar.');

        $voidFound = $transactions->firstWhere('journal_entry_id', $voidableJournal->id);
        $this->assertNull($voidFound, 'Jurnal void TIDAK boleh muncul di buku besar.');
    }

    /**
     * Test 3: Filter periode -> Hanya transaksi periode tersebut yang masuk daftar transaksi,
     * transaksi periode sebelumnya masuk ke Saldo Awal (Opening Balance).
     */
    public function test_filter_period_and_dates_accurately_scopes_transactions_and_opening_balance(): void
    {
        // Buat akun kas uji coba khusus agar terisolasi dari data lain
        $testCashAccount = Account::create([
            'code'           => '1119-' . uniqid(),
            'name'           => 'Kas Khusus Uji Coba Periode',
            'account_type'   => 'asset',
            'normal_balance' => 'debit',
            'is_active'      => true,
        ]);

        // Periode 1: Transaksi 2026-03-10 Rp 7.000.000
        $this->journalService->createJournal([
            'transaction_date'     => '2026-03-10',
            'accounting_period_id' => $this->period->id,
            'description'          => 'Transaksi Kuartal 1',
            'status'               => 'posted',
            'journal_lines'        => [
                [
                    'account_id'  => $testCashAccount->id,
                    'debit'       => 7000000.00,
                    'credit'      => 0.00,
                ],
                [
                    'account_id'  => $this->revenueAccount->id,
                    'debit'       => 0.00,
                    'credit'      => 7000000.00,
                ],
            ],
        ], $this->user);

        // Periode 2: Transaksi 2026-08-15 Rp 3.000.000
        $this->journalService->createJournal([
            'transaction_date'     => '2026-08-15',
            'accounting_period_id' => $this->period->id,
            'description'          => 'Transaksi Kuartal 3',
            'status'               => 'posted',
            'journal_lines'        => [
                [
                    'account_id'  => $testCashAccount->id,
                    'debit'       => 3000000.00,
                    'credit'      => 0.00,
                ],
                [
                    'account_id'  => $this->revenueAccount->id,
                    'debit'       => 0.00,
                    'credit'      => 3000000.00,
                ],
            ],
        ], $this->user);

        // Filter dari tanggal 2026-07-01 s.d. 2026-12-31
        $ledgerQ3 = $this->glService->getLedger(
            $testCashAccount->id,
            $this->period->id,
            '2026-07-01',
            '2026-12-31'
        );

        $accountData = $ledgerQ3['account'];

        // Saldo awal harus 7 juta (dari transaksi Maret)
        $this->assertEquals(7000000.00, $accountData['opening_balance']);

        // Transaksi di periode ini hanya 1 (transaksi Agustus 3 juta)
        $this->assertCount(1, $accountData['transactions']);
        $this->assertEquals(3000000.00, $accountData['total_debit']);
        $this->assertEquals(0.00, $accountData['total_credit']);

        // Saldo akhir harus 7 juta + 3 juta = 10 juta
        $this->assertEquals(10000000.00, $accountData['closing_balance']);
        $this->assertEquals(10000000.00, $accountData['transactions'][0]['running_balance']);
    }

    /**
     * Test 4: Verifikasi normal balance kredit (Revenue / Pendapatan)
     */
    public function test_credit_normal_balance_rule(): void
    {
        $testRevenueAccount = Account::create([
            'code'           => '4999-' . uniqid(),
            'name'           => 'Pendapatan Khusus Uji Coba',
            'account_type'   => 'revenue',
            'normal_balance' => 'credit',
            'is_active'      => true,
        ]);

        $this->journalService->createJournal([
            'transaction_date'     => '2026-09-05',
            'accounting_period_id' => $this->period->id,
            'description'          => 'Penerimaan Pendapatan',
            'status'               => 'posted',
            'journal_lines'        => [
                [
                    'account_id'  => $this->bankAccount->id,
                    'debit'       => 4000000.00,
                    'credit'      => 0.00,
                ],
                [
                    'account_id'  => $testRevenueAccount->id,
                    'debit'       => 0.00,
                    'credit'      => 4000000.00,
                ],
            ],
        ], $this->user);

        $ledger = $this->glService->getLedger($testRevenueAccount->id);
        $accountData = $ledger['account'];

        $this->assertEquals('credit', $accountData['normal_balance']);
        $this->assertEquals(4000000.00, $accountData['total_credit']);
        $this->assertEquals(0.00, $accountData['total_debit']);
        $this->assertEquals(4000000.00, $accountData['closing_balance']);
    }
}
