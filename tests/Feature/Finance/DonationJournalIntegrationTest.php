<?php

namespace Tests\Feature\Finance;

use App\Models\Account;
use App\Models\AccountingPeriod;
use App\Models\Donation;
use App\Models\JournalEntry;
use App\Models\Program;
use App\Models\User;
use Database\Seeders\AccountSeeder;
use Database\Seeders\AccountingPeriodSeeder;
use Tests\TestCase;

class DonationJournalIntegrationTest extends TestCase
{
    protected User $user;
    protected Program $program;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed COA & Period if empty
        if (Account::count() === 0) {
            $this->seed(AccountSeeder::class);
        }
        if (AccountingPeriod::count() === 0) {
            $this->seed(AccountingPeriodSeeder::class);
        }

        $this->user = User::first() ?? User::factory()->create();

        $this->program = Program::first() ?? Program::create([
            'slug'              => 'test-program-pendidikan-wakaf',
            'title'             => 'Wakaf Fasilitas Pendidikan',
            'category'          => 'Pendidikan',
            'short_description' => 'Program wakaf pendidikan',
            'description'       => 'Deskripsi lengkap wakaf pendidikan',
            'target_amount'     => 50000000,
            'collected_amount'  => 0,
            'status'            => 'active',
        ]);
    }

    /**
     * Scenario 1: Donation status berubah menjadi paid -> Journal berhasil dibuat.
     */
    public function test_donation_paid_automatically_generates_journal(): void
    {
        $donation = Donation::create([
            'user_id'          => $this->user->id,
            'program_id'       => $this->program->id,
            'donation_code'    => 'DON-TEST-' . uniqid(),
            'donor_name'       => 'Hamba Allah Dermawan',
            'donor_email'      => 'dermawan@example.com',
            'amount'           => 1000000.00,
            'payment_source'   => 'manual',
            'payment_channel'  => 'bsi',
            'status'           => 'pending',
        ]);

        // Prior to being paid: No journal should exist
        $this->assertNull($donation->journalEntry);
        $this->assertDatabaseMissing('journal_entries', [
            'reference_type' => 'donation',
            'reference_id'   => $donation->id,
        ]);

        // Now update status to paid
        $donation->update([
            'status'  => 'paid',
            'paid_at' => now(),
        ]);

        // Refresh relationship
        $donation->refresh();
        $journal = $donation->journalEntry;

        $this->assertNotNull($journal, 'Jurnal harus otomatis terbuat saat donasi berstatus paid.');
        $this->assertEquals('donation', $journal->reference_type);
        $this->assertEquals($donation->id, $journal->reference_id);
        $this->assertEquals(1000000.00, $journal->total_debit);
        $this->assertEquals(1000000.00, $journal->total_credit);
        $this->assertTrue($journal->is_balanced);
        $this->assertEquals('posted', $journal->status);

        // Verify lines: Debit Bank BSI (1112), Credit Penerimaan (4130)
        $debitLine = $journal->lines()->where('debit', '>', 0)->first();
        $this->assertNotNull($debitLine);
        $this->assertEquals('1112', $debitLine->account->code); // Bank BSI

        $creditLine = $journal->lines()->where('credit', '>', 0)->first();
        $this->assertNotNull($creditLine);
        $this->assertEquals('4130', $creditLine->account->code); // Penerimaan Wakaf Melalui Uang
    }

    /**
     * Scenario 2: Donation paid diproses / disimpan ulang -> Tidak membuat duplicate journal.
     */
    public function test_donation_paid_resave_does_not_create_duplicate_journal(): void
    {
        $donation = Donation::create([
            'user_id'          => $this->user->id,
            'program_id'       => $this->program->id,
            'donation_code'    => 'DON-TEST-' . uniqid(),
            'donor_name'       => 'Donatur Rutin',
            'amount'           => 500000.00,
            'payment_source'   => 'manual',
            'payment_channel'  => 'mandiri',
            'status'           => 'paid',
            'paid_at'          => now(),
        ]);

        $initialJournalCount = JournalEntry::where('reference_type', 'donation')
            ->where('reference_id', $donation->id)
            ->count();

        $this->assertEquals(1, $initialJournalCount);

        // Trigger update on donation again (e.g. updating notes or resaving)
        $donation->update([
            'notes' => 'Catatan diperbarui oleh admin',
        ]);
        $donation->save();

        $afterJournalCount = JournalEntry::where('reference_type', 'donation')
            ->where('reference_id', $donation->id)
            ->count();

        $this->assertEquals(1, $afterJournalCount, 'Tidak boleh ada duplikasi jurnal jika donasi disimpan ulang.');
    }

    /**
     * Scenario 3: Donation pending -> Tidak membuat journal.
     */
    public function test_donation_pending_does_not_create_journal(): void
    {
        $donation = Donation::create([
            'user_id'          => $this->user->id,
            'program_id'       => $this->program->id,
            'donation_code'    => 'DON-TEST-' . uniqid(),
            'donor_name'       => 'Donatur Pending',
            'amount'           => 250000.00,
            'payment_source'   => 'midtrans',
            'status'           => 'pending',
        ]);

        $this->assertNull($donation->journalEntry);
        $this->assertEquals(0, JournalEntry::where('reference_type', 'donation')->where('reference_id', $donation->id)->count());
    }
}
