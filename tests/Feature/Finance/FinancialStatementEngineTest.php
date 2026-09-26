<?php

namespace Tests\Feature\Finance;

use App\Models\Account;
use App\Models\AccountingPeriod;
use App\Models\User;
use App\Services\FinancialStatementService;
use App\Services\JournalService;
use Database\Seeders\AccountSeeder;
use Database\Seeders\AccountingPeriodSeeder;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class FinancialStatementEngineTest extends TestCase
{
    protected FinancialStatementService $fsService;
    protected JournalService $journalService;
    protected User $user;
    protected AccountingPeriod $period;
    protected Account $bankAccount;
    protected Account $revenueAccount;
    protected Account $expenseAccount;

    protected function setUp(): void
    {
        parent::setUp();

        $this->fsService = app(FinancialStatementService::class);
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
     * Test 1: Verifikasi Laporan Posisi Keuangan (Balance Sheet) seimbang:
     * Total Aset = Total Liabilitas + Total Aset Neto, is_balanced = true
     */
    public function test_balance_sheet_is_accurate_and_balanced(): void
    {
        // 1. Catat transaksi penerimaan donasi: Debit Bank 20 juta, Credit Revenue 20 juta
        $this->journalService->createJournal([
            'transaction_date'     => '2026-09-01',
            'accounting_period_id' => $this->period->id,
            'description'          => 'Penerimaan Donasi Wakaf 20 Juta',
            'status'               => 'posted',
            'journal_lines'        => [
                [
                    'account_id'  => $this->bankAccount->id,
                    'debit'       => 20000000.00,
                    'credit'      => 0.00,
                ],
                [
                    'account_id'  => $this->revenueAccount->id,
                    'debit'       => 0.00,
                    'credit'      => 20000000.00,
                ],
            ],
        ], $this->user);

        // 2. Catat transaksi penyaluran program: Debit Beban 8 juta, Credit Bank 8 juta
        $this->journalService->createJournal([
            'transaction_date'     => '2026-09-05',
            'accounting_period_id' => $this->period->id,
            'description'          => 'Penyaluran Beasiswa 8 Juta',
            'status'               => 'posted',
            'journal_lines'        => [
                [
                    'account_id'  => $this->expenseAccount->id,
                    'debit'       => 8000000.00,
                    'credit'      => 0.00,
                ],
                [
                    'account_id'  => $this->bankAccount->id,
                    'debit'       => 0.00,
                    'credit'      => 8000000.00,
                ],
            ],
        ], $this->user);

        // 3. Request Balance Sheet
        $bs = $this->fsService->getBalanceSheet($this->period->id);

        $this->assertNotEmpty($bs['assets']);
        $this->assertTrue($bs['is_balanced'], 'Laporan Posisi Keuangan harus seimbang (Total Aset = Liabilitas + Aset Neto).');
        $this->assertEquals($bs['total_assets'], $bs['total_liabilities'] + $bs['total_net_assets']);

        // 4. Verifikasi via API endpoint
        $response = $this->actingAs($this->user)->getJson('/api/v1/finance/balance-sheet?period_id=' . $this->period->id);
        $response->assertStatus(200);
        $response->assertJsonPath('status', 'success');
        $response->assertJsonPath('data.is_balanced', true);
        $response->assertJsonStructure([
            'status',
            'data' => [
                'assets',
                'total_assets',
                'liabilities',
                'total_liabilities',
                'net_assets',
                'total_net_assets',
                'is_balanced',
            ],
        ]);
    }

    /**
     * Test 2: Verifikasi Laporan Aktivitas (Activity Statement):
     * Penerimaan, Beban, dan Surplus/Defisit
     */
    public function test_activity_statement_computes_surplus_accurately(): void
    {
        $uniqueRevCode = '4199-act-' . uniqid();
        $uniqueExpCode = '5199-act-' . uniqid();

        $revAccount = Account::create([
            'code'           => $uniqueRevCode,
            'name'           => 'Pendapatan Aktivitas Khusus',
            'account_type'   => 'revenue',
            'normal_balance' => 'credit',
            'is_active'      => true,
        ]);

        $expAccount = Account::create([
            'code'           => $uniqueExpCode,
            'name'           => 'Beban Aktivitas Khusus',
            'account_type'   => 'expense',
            'normal_balance' => 'debit',
            'is_active'      => true,
        ]);

        // Catat transaksi pendapatan 12 juta
        $this->journalService->createJournal([
            'transaction_date'     => '2026-09-10',
            'accounting_period_id' => $this->period->id,
            'description'          => 'Penerimaan Program Khusus',
            'status'               => 'posted',
            'journal_lines'        => [
                [
                    'account_id'  => $this->bankAccount->id,
                    'debit'       => 12000000.00,
                    'credit'      => 0.00,
                ],
                [
                    'account_id'  => $revAccount->id,
                    'debit'       => 0.00,
                    'credit'      => 12000000.00,
                ],
            ],
        ], $this->user);

        // Catat transaksi beban 5 juta
        $this->journalService->createJournal([
            'transaction_date'     => '2026-09-12',
            'accounting_period_id' => $this->period->id,
            'description'          => 'Beban Operasional Khusus',
            'status'               => 'posted',
            'journal_lines'        => [
                [
                    'account_id'  => $expAccount->id,
                    'debit'       => 5000000.00,
                    'credit'      => 0.00,
                ],
                [
                    'account_id'  => $this->bankAccount->id,
                    'debit'       => 0.00,
                    'credit'      => 5000000.00,
                ],
            ],
        ], $this->user);

        // Request Activity Statement
        $act = $this->fsService->getActivityStatement($this->period->id);

        $revenues = collect($act['revenues']);
        $expenses = collect($act['expenses']);

        $revItem = $revenues->firstWhere('account_id', $revAccount->id);
        $expItem = $expenses->firstWhere('account_id', $expAccount->id);

        $this->assertNotNull($revItem);
        $this->assertEquals(12000000.00, $revItem['amount']);

        $this->assertNotNull($expItem);
        $this->assertEquals(5000000.00, $expItem['amount']);

        $this->assertGreaterThan(0, $act['total_revenues']);
        $this->assertGreaterThan(0, $act['total_expenses']);
        $this->assertEquals($act['total_revenues'] - $act['total_expenses'], $act['surplus_deficit']);

        // Verifikasi via API endpoint
        $response = $this->actingAs($this->user)->getJson('/api/v1/finance/activity-statement?period_id=' . $this->period->id);
        $response->assertStatus(200);
        $response->assertJsonPath('status', 'success');
        $response->assertJsonStructure([
            'status',
            'data' => [
                'period',
                'revenues',
                'total_revenues',
                'expenses',
                'total_expenses',
                'surplus_deficit',
                'is_surplus',
            ],
        ]);
    }

    /**
     * Test 3: Jurnal draft tidak masuk laporan keuangan
     */
    public function test_draft_journal_is_excluded_from_financial_statements(): void
    {
        $draftAccount = Account::create([
            'code'           => '4199-draft-fs-' . uniqid(),
            'name'           => 'Pendapatan Draft FS',
            'account_type'   => 'revenue',
            'normal_balance' => 'credit',
            'is_active'      => true,
        ]);

        $this->journalService->createJournal([
            'transaction_date'     => '2026-09-15',
            'accounting_period_id' => $this->period->id,
            'description'          => 'Draft Tidak Boleh Muncul',
            'status'               => 'draft',
            'journal_lines'        => [
                [
                    'account_id'  => $this->bankAccount->id,
                    'debit'       => 50000000.00,
                    'credit'      => 0.00,
                ],
                [
                    'account_id'  => $draftAccount->id,
                    'debit'       => 0.00,
                    'credit'      => 50000000.00,
                ],
            ],
        ], $this->user);

        $act = $this->fsService->getActivityStatement($this->period->id);
        $revenues = collect($act['revenues']);

        $this->assertNull($revenues->firstWhere('account_id', $draftAccount->id));
    }
}
