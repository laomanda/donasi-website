<?php

namespace Tests\Feature\Finance;

use App\Models\Account;
use App\Models\AccountingPeriod;
use App\Models\AuditLog;
use App\Models\JournalEntry;
use App\Models\User;
use App\Services\JournalService;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class JournalEngineTest extends TestCase
{
    protected JournalService $journalService;
    protected User $user;
    protected AccountingPeriod $period;
    protected Account $debitAccount;
    protected Account $creditAccount;

    protected function setUp(): void
    {
        parent::setUp();

        $this->journalService = app(JournalService::class);

        // Ensure user exists
        $this->user = User::first() ?? User::factory()->create();

        // Ensure period exists
        $this->period = AccountingPeriod::where('status', 'open')->first() ?? AccountingPeriod::create([
            'name'       => '2026',
            'start_date' => '2026-01-01',
            'end_date'   => '2026-12-31',
            'status'     => 'open',
        ]);

        // Find or create Bank BSI & Penerimaan Wakaf
        $this->debitAccount = Account::where('code', '1112')->first() ?? Account::create([
            'code'           => '1112',
            'name'           => 'Bank BSI - Rekening Wakaf',
            'account_type'   => 'asset',
            'normal_balance' => 'debit',
        ]);

        $this->creditAccount = Account::where('code', '4110')->first() ?? Account::create([
            'code'           => '4110',
            'name'           => 'Penerimaan Wakaf Uang - Abadi',
            'account_type'   => 'revenue',
            'normal_balance' => 'credit',
        ]);
    }

    /**
     * Test 1: Jurnal seimbang (Debit == Kredit) -> Success
     */
    public function test_balanced_journal_creation_and_posting_succeeds(): void
    {
        $data = [
            'transaction_date'     => '2026-03-15',
            'accounting_period_id' => $this->period->id,
            'description'          => 'Penerimaan wakaf tunai via Bank BSI',
            'journal_lines'        => [
                [
                    'account_id'  => $this->debitAccount->id,
                    'debit'       => 1000000.00,
                    'credit'      => 0.00,
                    'description' => 'Debit Kas Bank BSI',
                ],
                [
                    'account_id'  => $this->creditAccount->id,
                    'debit'       => 0.00,
                    'credit'      => 1000000.00,
                    'description' => 'Kredit Penerimaan Wakaf Uang',
                ],
            ],
        ];

        $journal = $this->journalService->createJournal($data, $this->user);

        $this->assertInstanceOf(JournalEntry::class, $journal);
        $this->assertEquals('draft', $journal->status);
        $this->assertEquals(1000000.00, $journal->total_debit);
        $this->assertEquals(1000000.00, $journal->total_credit);
        $this->assertTrue($journal->is_balanced);

        // Test posting
        $postedJournal = $this->journalService->postJournal($journal, $this->user);
        $this->assertEquals('posted', $postedJournal->status);

        // Test Audit Log exists
        $auditLog = AuditLog::where('module', 'journal')
            ->where('reference_id', $journal->id)
            ->where('action', 'post_journal')
            ->first();

        $this->assertNotNull($auditLog);
    }

    /**
     * Test 2: Jurnal tidak seimbang (Debit != Kredit) -> Rejected
     */
    public function test_unbalanced_journal_is_rejected(): void
    {
        $this->expectException(ValidationException::class);

        $data = [
            'transaction_date'     => '2026-03-15',
            'accounting_period_id' => $this->period->id,
            'description'          => 'Uji coba jurnal tidak seimbang',
            'journal_lines'        => [
                [
                    'account_id'  => $this->debitAccount->id,
                    'debit'       => 1000000.00,
                    'credit'      => 0.00,
                ],
                [
                    'account_id'  => $this->creditAccount->id,
                    'debit'       => 0.00,
                    'credit'      => 900000.00, // Selisih 100.000
                ],
            ],
        ];

        $this->journalService->createJournal($data, $this->user);
    }

    /**
     * Test 3: Jurnal posted tidak dapat di-post ulang / diedit langsung
     */
    public function test_posted_journal_cannot_be_reposted_or_modified_directly(): void
    {
        $data = [
            'transaction_date'     => '2026-03-15',
            'accounting_period_id' => $this->period->id,
            'description'          => 'Uji coba posting ganda',
            'journal_lines'        => [
                [
                    'account_id'  => $this->debitAccount->id,
                    'debit'       => 500000.00,
                    'credit'      => 0.00,
                ],
                [
                    'account_id'  => $this->creditAccount->id,
                    'debit'       => 0.00,
                    'credit'      => 500000.00,
                ],
            ],
        ];

        $journal = $this->journalService->createJournal($data, $this->user);
        $this->journalService->postJournal($journal, $this->user);

        // Attempting to post an already posted journal must throw ValidationException
        $this->expectException(ValidationException::class);
        $this->journalService->postJournal($journal, $this->user);
    }

    /**
     * Test 4: Jurnal pembalik (Reversal) bekerja dengan membalik Debit & Kredit
     */
    public function test_reversal_journal_swaps_debit_and_credit(): void
    {
        $data = [
            'transaction_date'     => '2026-03-15',
            'accounting_period_id' => $this->period->id,
            'description'          => 'Transaksi awal sebelum di-reverse',
            'journal_lines'        => [
                [
                    'account_id'  => $this->debitAccount->id,
                    'debit'       => 750000.00,
                    'credit'      => 0.00,
                ],
                [
                    'account_id'  => $this->creditAccount->id,
                    'debit'       => 0.00,
                    'credit'      => 750000.00,
                ],
            ],
        ];

        $journal = $this->journalService->createJournal($data, $this->user);
        $posted = $this->journalService->postJournal($journal, $this->user);

        $reversal = $this->journalService->reverseJournal($posted, 'Salah alokasi rekening', $this->user);

        $this->assertInstanceOf(JournalEntry::class, $reversal);
        $this->assertStringStartsWith('REV-', $reversal->journal_number);
        $this->assertEquals(750000.00, $reversal->total_debit);
        $this->assertEquals(750000.00, $reversal->total_credit);

        // The line that was Debit in original should now be Credit in reversal
        $revDebitLine = $reversal->lines()->where('account_id', $this->creditAccount->id)->first();
        $this->assertEquals(750000.00, (float) $revDebitLine->debit);

        $revCreditLine = $reversal->lines()->where('account_id', $this->debitAccount->id)->first();
        $this->assertEquals(750000.00, (float) $revCreditLine->credit);
    }
}
