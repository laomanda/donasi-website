<?php

namespace Tests\Feature\Employee;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class EmployeeBusinessRulesTest extends TestCase
{
    use DatabaseTransactions;

    private User $manager;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');

        Permission::firstOrCreate(['name' => 'manage employees', 'guard_name' => 'sanctum']);

        $this->manager = User::factory()->create(['is_active' => true]);
        $this->manager->givePermissionTo('manage employees');
    }

    public function test_employee_code_preserves_leading_zeros(): void
    {
        $image = UploadedFile::fake()->image('card.png');

        $res = $this->actingAs($this->manager, 'sanctum')->postJson('/api/v1/employees', [
            'employee_code'     => '0108026',
            'name'              => 'Budi Leading Zero',
            'position'          => 'Staff',
            'employment_status' => 'active',
            'display_order'     => 1,
            'is_published'      => true,
            'id_card_image'     => $image,
        ]);

        $res->assertStatus(201);
        $this->assertSame('0108026', $res->json('data.employee_code'));

        $this->assertDatabaseHas('employees', [
            'employee_code' => '0108026',
        ]);
    }

    public function test_duplicate_employee_code_returns_422_with_indonesian_message(): void
    {
        Employee::factory()->create([
            'employee_code' => '0108026',
            'display_order' => 1,
        ]);

        $res = $this->actingAs($this->manager, 'sanctum')->postJson('/api/v1/employees', [
            'employee_code'     => '0108026',
            'name'              => 'Clone Employee',
            'position'          => 'Staff',
            'employment_status' => 'active',
            'display_order'     => 2,
            'is_published'      => true,
            'id_card_image'     => UploadedFile::fake()->image('card.png'),
        ]);

        $res->assertStatus(422)
            ->assertJsonValidationErrors(['employee_code']);

        $this->assertEquals(
            'ID pegawai sudah digunakan.',
            $res->json('errors.employee_code.0')
        );
    }

    public function test_duplicate_display_order_returns_422_with_indonesian_message(): void
    {
        Employee::factory()->create([
            'employee_code' => 'EMP001',
            'display_order' => 10,
        ]);

        $res = $this->actingAs($this->manager, 'sanctum')->postJson('/api/v1/employees', [
            'employee_code'     => 'EMP002',
            'name'              => 'New Employee',
            'position'          => 'Staff',
            'employment_status' => 'active',
            'display_order'     => 10, // DUPLICATE
            'is_published'      => true,
            'id_card_image'     => UploadedFile::fake()->image('card.png'),
        ]);

        $res->assertStatus(422)
            ->assertJsonValidationErrors(['display_order']);

        $this->assertEquals(
            'Nomor urutan tampilan sudah digunakan oleh karyawan lain.',
            $res->json('errors.display_order.0')
        );
    }

    public function test_display_order_enforces_database_level_unique_constraint(): void
    {
        Employee::factory()->create([
            'employee_code' => 'EMP001',
            'slug'          => 'emp-001',
            'display_order' => 5,
        ]);

        $this->expectException(QueryException::class);

        // Attempt direct low-level DB insert with duplicate display_order
        Employee::query()->create([
            'employee_code'     => 'EMP002',
            'slug'              => 'emp-002',
            'name'              => 'Direct DB Duplicate',
            'position'          => 'Staff',
            'employment_status' => 'active',
            'display_order'     => 5, // Duplicate DB unique key
            'is_published'      => true,
            'id_card_image'     => 'path/test.png',
        ]);
    }

    public function test_deleted_employee_releases_display_order_allowing_new_employee_to_reuse_it(): void
    {
        // 1. Employee A created with display_order = 1
        $resA = $this->actingAs($this->manager, 'sanctum')->postJson('/api/v1/employees', [
            'employee_code'     => 'EMP_ORD_A',
            'name'              => 'Employee Order A',
            'position'          => 'Staff',
            'employment_status' => 'active',
            'display_order'     => 1,
            'is_published'      => true,
            'id_card_image'     => UploadedFile::fake()->image('card_a.png'),
        ]);
        $resA->assertStatus(201);
        $empAId = $resA->json('data.id');

        // 2. Soft delete Employee A
        $resDel = $this->actingAs($this->manager, 'sanctum')->deleteJson("/api/v1/employees/{$empAId}");
        $resDel->assertStatus(200);

        // Verify A is trashed and display_order is set to null
        $trashedA = Employee::withTrashed()->find($empAId);
        $this->assertNotNull($trashedA->deleted_at);
        $this->assertNull($trashedA->display_order);

        // 3. Employee B created with display_order = 1 succeeds
        $resB = $this->actingAs($this->manager, 'sanctum')->postJson('/api/v1/employees', [
            'employee_code'     => 'EMP_ORD_B',
            'name'              => 'Employee Order B',
            'position'          => 'Staff',
            'employment_status' => 'active',
            'display_order'     => 1, // Reusing display_order = 1
            'is_published'      => true,
            'id_card_image'     => UploadedFile::fake()->image('card_b.png'),
        ]);
        $resB->assertStatus(201)
            ->assertJsonPath('data.display_order', 1);

        $this->assertDatabaseHas('employees', [
            'id'            => $resB->json('data.id'),
            'display_order' => 1,
            'deleted_at'    => null,
        ]);
    }

    public function test_auto_slug_generation_and_collision_suffix(): void
    {
        // 1. First employee with name "Jakkob Panjaitan"
        $res1 = $this->actingAs($this->manager, 'sanctum')->postJson('/api/v1/employees', [
            'employee_code'     => 'EMP001',
            'name'              => 'Jakkob Panjaitan',
            'position'          => 'Staff',
            'employment_status' => 'active',
            'display_order'     => 1,
            'is_published'      => true,
            'id_card_image'     => UploadedFile::fake()->image('card.png'),
        ]);

        $res1->assertStatus(201);
        $this->assertEquals('jakkob-panjaitan', $res1->json('data.slug'));

        // 2. Second employee with same name -> gets suffix '-2'
        $res2 = $this->actingAs($this->manager, 'sanctum')->postJson('/api/v1/employees', [
            'employee_code'     => 'EMP002',
            'name'              => 'Jakkob Panjaitan',
            'position'          => 'Staff',
            'employment_status' => 'active',
            'display_order'     => 2,
            'is_published'      => true,
            'id_card_image'     => UploadedFile::fake()->image('card.png'),
        ]);

        $res2->assertStatus(201);
        $this->assertEquals('jakkob-panjaitan-2', $res2->json('data.slug'));

        // 3. Third employee with same name -> gets suffix '-3'
        $res3 = $this->actingAs($this->manager, 'sanctum')->postJson('/api/v1/employees', [
            'employee_code'     => 'EMP003',
            'name'              => 'Jakkob Panjaitan',
            'position'          => 'Staff',
            'employment_status' => 'active',
            'display_order'     => 3,
            'is_published'      => true,
            'id_card_image'     => UploadedFile::fake()->image('card.png'),
        ]);

        $res3->assertStatus(201);
        $this->assertEquals('jakkob-panjaitan-3', $res3->json('data.slug'));
    }

    public function test_custom_slug_and_duplicate_rejection(): void
    {
        // Custom slug 'jakkob'
        $res1 = $this->actingAs($this->manager, 'sanctum')->postJson('/api/v1/employees', [
            'employee_code'     => 'EMP001',
            'name'              => 'Jakkob Panjaitan',
            'slug'              => 'jakkob',
            'position'          => 'Staff',
            'employment_status' => 'active',
            'display_order'     => 1,
            'is_published'      => true,
            'id_card_image'     => UploadedFile::fake()->image('card.png'),
        ]);

        $res1->assertStatus(201);
        $this->assertEquals('jakkob', $res1->json('data.slug'));

        // Duplicate custom slug 'jakkob' -> 422 Indonesian error
        $res2 = $this->actingAs($this->manager, 'sanctum')->postJson('/api/v1/employees', [
            'employee_code'     => 'EMP002',
            'name'              => 'Another Jakkob',
            'slug'              => 'jakkob',
            'position'          => 'Staff',
            'employment_status' => 'active',
            'display_order'     => 2,
            'is_published'      => true,
            'id_card_image'     => UploadedFile::fake()->image('card.png'),
        ]);

        $res2->assertStatus(422)
            ->assertJsonValidationErrors(['slug']);
        $this->assertEquals('Slug URL sudah digunakan oleh karyawan lain.', $res2->json('errors.slug.0'));
    }

    public function test_name_update_does_not_change_existing_slug(): void
    {
        $employee = Employee::factory()->create([
            'name'          => 'Jakkob Panjaitan',
            'slug'          => 'jakkob',
            'display_order' => 1,
        ]);

        // Update name to 'Jakkob P. Panjaitan' without sending slug
        $res = $this->actingAs($this->manager, 'sanctum')->putJson("/api/v1/employees/{$employee->id}", [
            'employee_code'     => $employee->employee_code,
            'name'              => 'Jakkob P. Panjaitan',
            'position'          => $employee->position,
            'employment_status' => 'active',
            'display_order'     => 1,
            'is_published'      => true,
        ]);

        $res->assertStatus(200);
        $this->assertEquals('Jakkob P. Panjaitan', $res->json('data.name'));
        // Slug must remain 'jakkob' (STABLE for printed QR codes)
        $this->assertEquals('jakkob', $res->json('data.slug'));
    }

    public function test_explicit_slug_update_changes_slug(): void
    {
        $employee = Employee::factory()->create([
            'name'          => 'Jakkob Panjaitan',
            'slug'          => 'jakkob',
            'display_order' => 1,
        ]);

        // Explicitly update slug to 'jakkob-new'
        $res = $this->actingAs($this->manager, 'sanctum')->putJson("/api/v1/employees/{$employee->id}", [
            'employee_code'     => $employee->employee_code,
            'name'              => $employee->name,
            'slug'              => 'jakkob-new',
            'position'          => $employee->position,
            'employment_status' => 'active',
            'display_order'     => 1,
            'is_published'      => true,
        ]);

        $res->assertStatus(200);
        $this->assertEquals('jakkob-new', $res->json('data.slug'));
    }

    public function test_image_replacement_deletes_old_file_and_stores_new(): void
    {
        // 1. Initial creation
        $oldFile = UploadedFile::fake()->image('old_id_card.png');
        $createRes = $this->actingAs($this->manager, 'sanctum')->postJson('/api/v1/employees', [
            'employee_code'     => 'EMP001',
            'name'              => 'Staff Photo Test',
            'position'          => 'Staff',
            'employment_status' => 'active',
            'display_order'     => 1,
            'is_published'      => true,
            'id_card_image'     => $oldFile,
        ]);

        $employeeId = $createRes->json('data.id');
        $oldPath = $createRes->json('data.id_card_image');
        Storage::disk('public')->assertExists($oldPath);

        // 2. Update with replacement image
        $newFile = UploadedFile::fake()->image('new_id_card.webp');
        $updateRes = $this->actingAs($this->manager, 'sanctum')->putJson("/api/v1/employees/{$employeeId}", [
            'employee_code'     => 'EMP001',
            'name'              => 'Staff Photo Test',
            'position'          => 'Staff',
            'employment_status' => 'active',
            'display_order'     => 1,
            'is_published'      => true,
            'id_card_image'     => $newFile,
        ]);

        $updateRes->assertStatus(200);
        $newPath = $updateRes->json('data.id_card_image');

        $this->assertNotEquals($oldPath, $newPath);
        Storage::disk('public')->assertExists($newPath);
        // Old image MUST be deleted after successful update
        Storage::disk('public')->assertMissing($oldPath);
    }

    public function test_image_validation_rejects_invalid_type_and_oversize(): void
    {
        // Invalid file type (PDF)
        $pdfFile = UploadedFile::fake()->create('document.pdf', 500, 'application/pdf');
        $resType = $this->actingAs($this->manager, 'sanctum')->postJson('/api/v1/employees', [
            'employee_code'     => 'EMP001',
            'name'              => 'Staff',
            'position'          => 'Staff',
            'employment_status' => 'active',
            'display_order'     => 1,
            'is_published'      => true,
            'id_card_image'     => $pdfFile,
        ]);

        $resType->assertStatus(422)->assertJsonValidationErrors(['id_card_image']);

        // Oversized file (> 5MB)
        $oversizedFile = UploadedFile::fake()->image('huge.png')->size(6000); // 6MB
        $resSize = $this->actingAs($this->manager, 'sanctum')->postJson('/api/v1/employees', [
            'employee_code'     => 'EMP002',
            'name'              => 'Staff',
            'position'          => 'Staff',
            'employment_status' => 'active',
            'display_order'     => 2,
            'is_published'      => true,
            'id_card_image'     => $oversizedFile,
        ]);

        $resSize->assertStatus(422)->assertJsonValidationErrors(['id_card_image']);
        $this->assertEquals(
            'Ukuran gambar ID Card melebihi batas maksimum yang diizinkan (5MB).',
            $resSize->json('errors.id_card_image.0')
        );
    }

    public function test_public_url_is_computed_dynamically_and_not_stored_in_database(): void
    {
        $employee = Employee::factory()->create([
            'slug' => 'jakkob-public',
        ]);

        // Verify public_url column does NOT exist in table schema
        $this->assertFalse(Schema::hasColumn('employees', 'public_url'));

        // Verify computed public_url accessor
        $expectedUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', config('app.url') ?? url('/'))), '/') . '/karyawan/jakkob-public';
        $this->assertEquals($expectedUrl, $employee->public_url);
    }
}
