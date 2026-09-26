<?php

namespace Tests\Feature\Finance;

use App\Models\Account;
use App\Models\AccountingPeriod;
use App\Models\Allocation;
use App\Models\AuditLog;
use App\Models\Donation;
use App\Models\JournalEntry;
use App\Models\Program;
use App\Models\User;
use Database\Seeders\AccountSeeder;
use Database\Seeders\AccountingPeriodSeeder;
use Tests\TestCase;

class AllocationJournalIntegrationTest extends TestCase
{
    protected User $user;
    protected Program $programPendidikan;
    protected Program $programSosial;
    protected Program $programDakwah;
    protected Program $programKesehatan;
    protected Program $programEkonomi;

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

        $this->programPendidikan = Program::firstOrCreate(
            ['slug' => 'test-program-pendidikan'],
            [
                'title'             => 'Beasiswa & Sarana Pendidikan',
                'category'          => 'Pendidikan',
                'short_description' => 'Program pendidikan wakaf',
                'description'       => 'Deskripsi program pendidikan',
                'target_amount'     => 100000000,
                'collected_amount'  => 50000000,
                'status'            => 'active',
            ]
        );

        $this->programSosial = Program::firstOrCreate(
            ['slug' => 'test-program-sosial'],
            [
                'title'             => 'Bantuan Sosial dan Kemanusiaan',
                'category'          => 'Sosial',
                'short_description' => 'Program sosial dan kemanusiaan',
                'description'       => 'Deskripsi program sosial',
                'target_amount'     => 50000000,
                'collected_amount'  => 20000000,
                'status'            => 'active',
            ]
        );

        $this->programDakwah = Program::firstOrCreate(
            ['slug' => 'test-program-dakwah'],
            [
                'title'             => 'Renovasi Masjid & Dakwah Pelosok',
                'category'          => 'Dakwah',
                'short_description' => 'Program dakwah keagamaan',
                'description'       => 'Deskripsi dakwah',
                'target_amount'     => 75000000,
                'collected_amount'  => 30000000,
                'status'            => 'active',
            ]
        );

        $this->programKesehatan = Program::firstOrCreate(
            ['slug' => 'test-program-kesehatan'],
            [
                'title'             => 'Layanan Kesehatan Gratis Dhuafa',
                'category'          => 'Kesehatan',
                'short_description' => 'Program kesehatan dhuafa',
                'description'       => 'Deskripsi kesehatan',
                'target_amount'     => 60000000,
                'collected_amount'  => 25000000,
                'status'            => 'active',
            ]
        );

        $this->programEkonomi = Program::firstOrCreate(
            ['slug' => 'test-program-ekonomi'],
            [
                'title'             => 'Permodalan UMKM & Pemberdayaan Ekonomi',
                'category'          => 'Ekonomi',
                'short_description' => 'Program pemberdayaan ekonomi',
                'description'       => 'Deskripsi ekonomi',
                'target_amount'     => 80000000,
                'collected_amount'  => 40000000,
                'status'            => 'active',
            ]
        );
    }

    /**
     * Test 1: Allocation valid dibuat -> Journal otomatis dibuat.
     * Debit: Beban Penyaluran (sesuai kategori program)
     * Credit: Bank/Kas
     */
    public function test_valid_allocation_automatically_creates_journal_entry(): void
    {
        $allocation = Allocation::create([
            'user_id'      => $this->user->id,
            'program_id'   => $this->programPendidikan->id,
            'amount'       => 5000000.00,
            'description'  => 'Penyaluran beasiswa santri binaan termin 1',
            'allocated_at' => now()->toDateString(),
        ]);

        $journal = $allocation->journalEntry;

        $this->assertNotNull($journal, 'Jurnal harus otomatis terbuat saat allocation valid disimpan.');
        $this->assertEquals('allocation', $journal->reference_type);
        $this->assertEquals($allocation->id, $journal->reference_id);
        $this->assertEquals(5000000.00, $journal->total_debit);
        $this->assertEquals(5000000.00, $journal->total_credit);
        $this->assertTrue($journal->is_balanced);
        $this->assertEquals('posted', $journal->status);

        // Verify Debit: 5110 (Penyaluran Program Pendidikan & Beasiswa)
        $debitLine = $journal->lines()->where('debit', '>', 0)->first();
        $this->assertNotNull($debitLine);
        $this->assertEquals('5110', $debitLine->account->code);

        // Verify Credit: 1112 (Bank BSI Rekening Wakaf)
        $creditLine = $journal->lines()->where('credit', '>', 0)->first();
        $this->assertNotNull($creditLine);
        $this->assertEquals('1112', $creditLine->account->code);

        // Verify Audit Log
        $auditLog = AuditLog::where('module', 'allocation')
            ->where('action', 'create_journal')
            ->where('reference_id', $allocation->id)
            ->first();

        $this->assertNotNull($auditLog, 'Audit log untuk pembuatan jurnal alokasi harus tercatat.');
    }

    /**
     * Test 1b: Verify mapping across other categories: Dakwah, Kesehatan, Ekonomi, Sosial
     */
    public function test_allocation_maps_different_categories_correctly(): void
    {
        // Dakwah -> 5130
        $allocDakwah = Allocation::create([
            'user_id'      => $this->user->id,
            'program_id'   => $this->programDakwah->id,
            'amount'       => 2000000.00,
            'description'  => 'Biaya operasional dai pelosok',
            'allocated_at' => now()->toDateString(),
        ]);
        $debitDakwah = $allocDakwah->journalEntry->lines()->where('debit', '>', 0)->first();
        $this->assertEquals('5130', $debitDakwah->account->code);

        // Kesehatan -> 5140
        $allocSehat = Allocation::create([
            'user_id'      => $this->user->id,
            'program_id'   => $this->programKesehatan->id,
            'amount'       => 3500000.00,
            'description'  => 'Pengadaan obat-obatan dhuafa',
            'allocated_at' => now()->toDateString(),
        ]);
        $debitSehat = $allocSehat->journalEntry->lines()->where('debit', '>', 0)->first();
        $this->assertEquals('5140', $debitSehat->account->code);

        // Ekonomi -> 5150
        $allocEkonomi = Allocation::create([
            'user_id'      => $this->user->id,
            'program_id'   => $this->programEkonomi->id,
            'amount'       => 4000000.00,
            'description'  => 'Pemberian modal usaha produktif gerobak berkah',
            'allocated_at' => now()->toDateString(),
        ]);
        $debitEkonomi = $allocEkonomi->journalEntry->lines()->where('debit', '>', 0)->first();
        $this->assertEquals('5150', $debitEkonomi->account->code);

        // Sosial -> 5120 & Mandiri bank source -> 1113
        $allocSosial = Allocation::create([
            'user_id'      => $this->user->id,
            'program_id'   => $this->programSosial->id,
            'amount'       => 1500000.00,
            'description'  => 'Penyaluran sembako dhuafa via Mandiri',
            'allocated_at' => now()->toDateString(),
        ]);
        $debitSosial = $allocSosial->journalEntry->lines()->where('debit', '>', 0)->first();
        $this->assertEquals('5120', $debitSosial->account->code);
        $creditSosial = $allocSosial->journalEntry->lines()->where('credit', '>', 0)->first();
        $this->assertEquals('1113', $creditSosial->account->code); // Bank Mandiri
    }

    /**
     * Test 2: Allocation diproses / disimpan ulang -> Tidak membuat journal kedua (Duplicate Protection).
     */
    public function test_allocation_reprocess_does_not_create_duplicate_journal(): void
    {
        $allocation = Allocation::create([
            'user_id'      => $this->user->id,
            'program_id'   => $this->programSosial->id,
            'amount'       => 1000000.00,
            'description'  => 'Penyaluran santunan yatim',
            'allocated_at' => now()->toDateString(),
        ]);

        $initialJournalCount = JournalEntry::where('reference_type', 'allocation')
            ->where('reference_id', $allocation->id)
            ->count();

        $this->assertEquals(1, $initialJournalCount);

        // Resave / update allocation
        $allocation->update([
            'description' => 'Penyaluran santunan yatim piatu - diperbarui',
        ]);
        $allocation->save();

        $afterJournalCount = JournalEntry::where('reference_type', 'allocation')
            ->where('reference_id', $allocation->id)
            ->count();

        $this->assertEquals(1, $afterJournalCount, 'Tidak boleh ada duplikasi jurnal jika allocation disimpan ulang.');
    }

    /**
     * Test 3: Allocation belum valid -> Tidak membuat journal.
     */
    public function test_invalid_allocation_does_not_create_journal(): void
    {
        // 3a. Amount 0 or negative
        $invalidAllocation = new Allocation([
            'user_id'      => $this->user->id,
            'program_id'   => $this->programSosial->id,
            'amount'       => 0.00,
            'description'  => 'Draft alokasi belum terisi nominal',
            'allocated_at' => now()->toDateString(),
        ]);

        $this->assertFalse($invalidAllocation->isValidForJournal());

        // Save using withoutEvents or directly to test observer logic
        $invalidAllocation->save();

        $this->assertNull($invalidAllocation->journalEntry);
        $this->assertEquals(0, JournalEntry::where('reference_type', 'allocation')->where('reference_id', $invalidAllocation->id)->count());

        // 3b. Amount negative
        $negativeAllocation = new Allocation([
            'user_id'      => $this->user->id,
            'program_id'   => $this->programSosial->id,
            'amount'       => -500000.00,
            'description'  => 'Nilai negatif tidak valid',
            'allocated_at' => now()->toDateString(),
        ]);
        $this->assertFalse($negativeAllocation->isValidForJournal());
        $negativeAllocation->save();

        $this->assertEquals(0, JournalEntry::where('reference_type', 'allocation')->where('reference_id', $negativeAllocation->id)->count());
    }
}
