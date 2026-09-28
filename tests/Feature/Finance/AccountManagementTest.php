<?php

namespace Tests\Feature\Finance;

use App\Models\Account;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AccountManagementTest extends TestCase
{
    use DatabaseTransactions;

    protected User $financeUser;
    protected User $unauthorizedUser;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Setup authorized finance user with sanctum guard
        $this->financeUser = User::first() ?? User::factory()->create();
        $financeRole = Role::firstOrCreate(['name' => 'keuangan', 'guard_name' => 'sanctum']);
        if (!$this->financeUser->hasRole('keuangan', 'sanctum')) {
            $this->financeUser->assignRole($financeRole);
        }

        // 2. Setup unauthorized user
        $this->unauthorizedUser = User::factory()->create();
    }

    public function test_unauthorized_user_cannot_access_accounts_api(): void
    {
        $response = $this->actingAs($this->unauthorizedUser, 'sanctum')
            ->getJson('/api/v1/finance/accounts');
        $response->assertStatus(403);
    }

    public function test_authorized_user_can_list_accounts_with_summary(): void
    {
        $response = $this->actingAs($this->financeUser, 'sanctum')
            ->getJson('/api/v1/finance/accounts');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data',
            'summary' => [
                'total',
                'active',
                'inactive',
                'asset',
                'liability',
                'net_asset',
                'revenue',
                'expense',
            ],
        ]);
    }

    public function test_search_accounts_by_code_and_name(): void
    {
        // Search by code
        $response = $this->actingAs($this->financeUser, 'sanctum')
            ->getJson('/api/v1/finance/accounts?q=1000');
        $response->assertStatus(200);
        $data = $response->json('data.data') ?? $response->json('data');
        $this->assertNotEmpty($data);

        // Search by name
        $responseName = $this->actingAs($this->financeUser, 'sanctum')
            ->getJson('/api/v1/finance/accounts?q=Aset');
        $responseName->assertStatus(200);
        $dataName = $responseName->json('data.data') ?? $responseName->json('data');
        $this->assertNotEmpty($dataName);
    }

    public function test_filter_accounts_by_type_and_status(): void
    {
        // Filter by account_type
        $response = $this->actingAs($this->financeUser, 'sanctum')
            ->getJson('/api/v1/finance/accounts?account_type=asset');
        $response->assertStatus(200);
        $items = $response->json('data.data') ?? $response->json('data');
        foreach ($items as $item) {
            $this->assertEquals('asset', $item['account_type']);
        }

        // Filter by is_active
        $responseActive = $this->actingAs($this->financeUser, 'sanctum')
            ->getJson('/api/v1/finance/accounts?is_active=1');
        $responseActive->assertStatus(200);
    }

    public function test_get_single_account_detail(): void
    {
        $account = Account::first();
        $this->assertNotNull($account);

        $response = $this->actingAs($this->financeUser, 'sanctum')
            ->getJson("/api/v1/finance/accounts/{$account->id}");
        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data'    => [
                'id'   => $account->id,
                'code' => $account->code,
                'name' => $account->name,
            ],
        ]);
    }

    public function test_create_sub_account_calculates_correct_level(): void
    {
        $parent = Account::where('level', 1)->first() ?? Account::first();
        $newCode = 'TEST-' . uniqid();

        $payload = [
            'code'            => $newCode,
            'name'            => 'Akun Uji Coba Otomatis',
            'account_type'    => $parent->account_type,
            'normal_balance'  => $parent->normal_balance,
            'parent_id'       => $parent->id,
            'report_category' => 'Uji Coba',
            'is_active'       => true,
        ];

        $response = $this->actingAs($this->financeUser, 'sanctum')
            ->postJson('/api/v1/finance/accounts', $payload);
        $response->assertStatus(201);
        $response->assertJson([
            'success' => true,
            'data'    => [
                'code'      => $newCode,
                'level'     => $parent->level + 1,
                'parent_id' => $parent->id,
            ],
        ]);

        $this->assertDatabaseHas('accounts', [
            'code'  => $newCode,
            'level' => $parent->level + 1,
        ]);
    }

    public function test_update_account_metadata(): void
    {
        $account = Account::create([
            'code'            => 'TEST-UPDATE-' . uniqid(),
            'name'            => 'Akun Asli',
            'account_type'    => 'asset',
            'normal_balance'  => 'debit',
            'level'           => 1,
            'is_active'       => true,
        ]);

        $updatedPayload = [
            'code'            => $account->code,
            'name'            => 'Akun Telah Diperbarui',
            'account_type'    => 'asset',
            'normal_balance'  => 'debit',
            'parent_id'       => null,
            'report_category' => 'Kategori Baru',
            'is_active'       => false,
        ];

        $response = $this->actingAs($this->financeUser, 'sanctum')
            ->putJson("/api/v1/finance/accounts/{$account->id}", $updatedPayload);
        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data'    => [
                'name'      => 'Akun Telah Diperbarui',
                'is_active' => false,
            ],
        ]);
    }

    public function test_cannot_delete_account_with_children(): void
    {
        // Find an account that has children
        $parentWithChildren = Account::has('children')->first();
        if ($parentWithChildren) {
            $response = $this->actingAs($this->financeUser, 'sanctum')
                ->deleteJson("/api/v1/finance/accounts/{$parentWithChildren->id}");
            $response->assertStatus(422);
            $response->assertJson([
                'success' => false,
            ]);
            $this->assertStringContainsString('sub-akun', $response->json('message'));
        }
    }
}
