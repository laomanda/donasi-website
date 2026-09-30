<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Account;
use App\Models\AccountingPeriod;
use App\Models\Allocation;
use App\Models\JournalEntry;
use App\Models\Program;
use App\Models\User;
use Database\Seeders\AccountSeeder;
use Database\Seeders\AccountingPeriodSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class PublicAllocationApiTest extends TestCase
{
    use DatabaseTransactions;

    protected User $user;
    protected Program $program;
    protected AccountingPeriod $period;

    protected function setUp(): void
    {
        parent::setUp();

        if (Account::count() === 0) {
            $this->seed(AccountSeeder::class);
        }
        if (AccountingPeriod::count() === 0) {
            $this->seed(AccountingPeriodSeeder::class);
        }

        $this->user = User::first() ?? User::factory()->create();
        $this->program = Program::first() ?? Program::factory()->create();
        $this->period = AccountingPeriod::first();
    }

    public function test_public_allocation_index_returns_only_posted_allocations(): void
    {
        // 1. Create Allocation with posted journal entry (automatically recorded by observer with status 'posted')
        $postedAlloc = Allocation::create([
            'user_id' => $this->user->id,
            'program_id' => $this->program->id,
            'amount' => 5000000,
            'description' => 'Bantuan Beasiswa Pendidikan Realized',
            'allocated_at' => now()->toDateString(),
        ]);
        $this->assertTrue($postedAlloc->journalEntry()->where('status', 'posted')->exists());

        // 2. Create Allocation whose journal entry is draft (simulating unposted / in-review distribution)
        $draftAlloc = Allocation::create([
            'user_id' => $this->user->id,
            'program_id' => $this->program->id,
            'amount' => 3000000,
            'description' => 'Draft Penyaluran Belum Diposting',
            'allocated_at' => now()->toDateString(),
        ]);
        $draftAlloc->journalEntry()->update(['status' => 'draft']);

        // 3. Create Allocation without any journal entry (orphaned / unposted record)
        $orphanedAlloc = Allocation::create([
            'user_id' => $this->user->id,
            'program_id' => $this->program->id,
            'amount' => 1000000,
            'description' => 'Allocation Without Journal Entry',
            'allocated_at' => now()->toDateString(),
        ]);
        $orphanedAlloc->journalEntry()->delete();

        $response = $this->getJson('/api/v1/allocations');

        $response->assertOk()
            ->assertJsonPath('success', true);

        $returnedIds = collect($response->json('data'))->pluck('id')->all();

        $this->assertContains($postedAlloc->id, $returnedIds, 'Posted allocation must be returned in public API');
        $this->assertNotContains($draftAlloc->id, $returnedIds, 'Draft allocation must NOT be returned in public API');
        $this->assertNotContains($orphanedAlloc->id, $returnedIds, 'Allocation without journal must NOT be returned in public API');
    }
}
