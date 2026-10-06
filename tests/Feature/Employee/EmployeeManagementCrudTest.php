<?php

namespace Tests\Feature\Employee;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class EmployeeManagementCrudTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');

        // Ensure permissions exist
        Permission::firstOrCreate(['name' => 'manage employees', 'guard_name' => 'sanctum']);
        Permission::firstOrCreate(['name' => 'view employees', 'guard_name' => 'sanctum']);
    }

    private function createStaffUser(array $permissions = []): User
    {
        $user = User::factory()->create([
            'is_active' => true,
        ]);

        if (!empty($permissions)) {
            $user->givePermissionTo($permissions);
        }

        return $user;
    }

    public function test_guest_is_unauthorized_on_management_endpoints(): void
    {
        $this->getJson('/api/v1/employees')->assertStatus(401);
        $this->getJson('/api/v1/employees/filters')->assertStatus(401);
        $this->postJson('/api/v1/employees', [])->assertStatus(401);
        $this->getJson('/api/v1/employees/1')->assertStatus(401);
        $this->putJson('/api/v1/employees/1', [])->assertStatus(401);
        $this->deleteJson('/api/v1/employees/1')->assertStatus(401);
    }

    public function test_authenticated_user_without_permission_is_forbidden(): void
    {
        $user = $this->createStaffUser([]); // No permissions

        $this->actingAs($user, 'sanctum')->getJson('/api/v1/employees')->assertStatus(403);
        $this->actingAs($user, 'sanctum')->getJson('/api/v1/employees/filters')->assertStatus(403);
        $this->actingAs($user, 'sanctum')->postJson('/api/v1/employees', [])->assertStatus(403);
    }

    public function test_user_with_view_permission_can_list_and_view_but_cannot_mutate(): void
    {
        $viewer = $this->createStaffUser(['view employees']);

        $employee = Employee::factory()->create([
            'employee_code' => 'EMP001',
            'display_order' => 1,
        ]);

        // Can list and view
        $this->actingAs($viewer, 'sanctum')
            ->getJson('/api/v1/employees')
            ->assertStatus(200);

        $this->actingAs($viewer, 'sanctum')
            ->getJson("/api/v1/employees/{$employee->id}")
            ->assertStatus(200);

        $this->actingAs($viewer, 'sanctum')
            ->getJson('/api/v1/employees/filters')
            ->assertStatus(200);

        // Cannot mutate
        $this->actingAs($viewer, 'sanctum')
            ->postJson('/api/v1/employees', [])
            ->assertStatus(403);

        $this->actingAs($viewer, 'sanctum')
            ->putJson("/api/v1/employees/{$employee->id}", [])
            ->assertStatus(403);

        $this->actingAs($viewer, 'sanctum')
            ->deleteJson("/api/v1/employees/{$employee->id}")
            ->assertStatus(403);
    }

    public function test_user_with_manage_permission_has_full_crud_access(): void
    {
        $manager = $this->createStaffUser(['manage employees']);

        $image = UploadedFile::fake()->image('id_card.png', 600, 900);

        // 1. Create
        $createRes = $this->actingAs($manager, 'sanctum')->postJson('/api/v1/employees', [
            'employee_code'     => '0108026',
            'name'              => 'Jakkob Panjaitan',
            'slug'              => 'jakkob',
            'position'          => 'Senior Engineer',
            'division'          => 'Teknologi Informasi',
            'employment_status' => 'active',
            'display_order'     => 1,
            'is_published'      => true,
            'id_card_image'     => $image,
        ]);

        $createRes->assertStatus(201)
            ->assertJsonPath('message', 'Karyawan berhasil ditambahkan.')
            ->assertJsonPath('data.employee_code', '0108026')
            ->assertJsonPath('data.slug', 'jakkob')
            ->assertJsonPath('data.display_order', 1);

        $employeeId = $createRes->json('data.id');
        $storedImagePath = $createRes->json('data.id_card_image');
        Storage::disk('public')->assertExists($storedImagePath);

        // 2. Read / Show
        $showRes = $this->actingAs($manager, 'sanctum')->getJson("/api/v1/employees/{$employeeId}");
        $showRes->assertStatus(200)
            ->assertJsonPath('data.name', 'Jakkob Panjaitan')
            ->assertJsonPath('data.position', 'Senior Engineer');

        // 3. Update without new image
        $updateRes = $this->actingAs($manager, 'sanctum')->putJson("/api/v1/employees/{$employeeId}", [
            'employee_code'     => '0108026',
            'name'              => 'Jakkob P. Panjaitan',
            'position'          => 'Tech Lead',
            'division'          => 'Teknologi Informasi',
            'employment_status' => 'active',
            'display_order'     => 1,
            'is_published'      => true,
        ]);

        $updateRes->assertStatus(200)
            ->assertJsonPath('message', 'Data karyawan berhasil diperbarui.')
            ->assertJsonPath('data.name', 'Jakkob P. Panjaitan')
            ->assertJsonPath('data.position', 'Tech Lead')
            ->assertJsonPath('data.slug', 'jakkob'); // Slug must be preserved!

        // Image should remain intact
        Storage::disk('public')->assertExists($storedImagePath);

        // 4. Delete
        $deleteRes = $this->actingAs($manager, 'sanctum')->deleteJson("/api/v1/employees/{$employeeId}");
        $deleteRes->assertStatus(200)
            ->assertJsonPath('message', 'Karyawan berhasil dihapus.');

        $this->assertSoftDeleted('employees', ['id' => $employeeId]);

        // File must NOT be physically deleted on soft delete
        Storage::disk('public')->assertExists($storedImagePath);
    }

    public function test_management_listing_filter_by_search_status_publication(): void
    {
        $manager = $this->createStaffUser(['manage employees']);

        Employee::factory()->create([
            'employee_code'     => 'EMP001',
            'name'              => 'Alice Programmer',
            'position'          => 'Backend Developer',
            'division'          => 'IT',
            'employment_status' => 'active',
            'is_published'      => true,
            'display_order'     => 1,
        ]);

        Employee::factory()->create([
            'employee_code'     => 'EMP002',
            'name'              => 'Bob Designer',
            'position'          => 'UI/UX',
            'division'          => 'Creative',
            'employment_status' => 'inactive',
            'is_published'      => false,
            'display_order'     => 2,
        ]);

        // Search by code EMP002
        $resCode = $this->actingAs($manager, 'sanctum')->getJson('/api/v1/employees?q=EMP002');
        $this->assertCount(1, $resCode->json('data'));
        $this->assertEquals('Bob Designer', $resCode->json('data.0.name'));

        // Filter by inactive status
        $resStatus = $this->actingAs($manager, 'sanctum')->getJson('/api/v1/employees?employment_status=inactive');
        $this->assertCount(1, $resStatus->json('data'));
        $this->assertEquals('Bob Designer', $resStatus->json('data.0.name'));

        // Filter by published
        $resPub = $this->actingAs($manager, 'sanctum')->getJson('/api/v1/employees?is_published=1');
        $this->assertCount(1, $resPub->json('data'));
        $this->assertEquals('Alice Programmer', $resPub->json('data.0.name'));
    }

    public function test_management_filter_options_includes_all_non_deleted_employees(): void
    {
        $manager = $this->createStaffUser(['manage employees']);

        Employee::factory()->create([
            'position'      => 'Active Position',
            'division'      => 'Active Division',
            'display_order' => 1,
        ]);

        Employee::factory()->create([
            'position'          => 'Draft Position',
            'division'          => 'Draft Division',
            'is_published'      => false,
            'employment_status' => 'inactive',
            'display_order'     => 2,
        ]);

        $res = $this->actingAs($manager, 'sanctum')->getJson('/api/v1/employees/filters');
        $res->assertStatus(200);

        $this->assertContains('Active Position', $res->json('positions'));
        $this->assertContains('Draft Position', $res->json('positions'));
        $this->assertContains('Active Division', $res->json('divisions'));
        $this->assertContains('Draft Division', $res->json('divisions'));
    }
}
