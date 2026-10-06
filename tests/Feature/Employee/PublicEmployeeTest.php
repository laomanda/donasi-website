<?php

namespace Tests\Feature\Employee;

use App\Models\Employee;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PublicEmployeeTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_guest_can_access_public_directory_without_auth(): void
    {
        Employee::factory()->create([
            'is_published'      => true,
            'employment_status' => 'active',
        ]);

        $response = $this->getJson('/api/v1/public/employees');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'employee_code',
                        'slug',
                        'name',
                        'position',
                        'division',
                        'employment_status',
                        'employment_status_label',
                        'id_card_image_url',
                        'public_url',
                    ],
                ],
                'links',
                'meta',
            ]);
    }

    public function test_public_directory_returns_only_active_and_published_and_non_deleted_employees(): void
    {
        // A: active + published (VISIBLE)
        $employeeA = Employee::factory()->create([
            'name'              => 'Employee Active Published',
            'is_published'      => true,
            'employment_status' => 'active',
            'display_order'     => 1,
        ]);

        // B: inactive + published (HIDDEN from directory)
        $employeeB = Employee::factory()->create([
            'name'              => 'Employee Inactive Published',
            'is_published'      => true,
            'employment_status' => 'inactive',
            'display_order'     => 2,
        ]);

        // C: active + unpublished (HIDDEN)
        $employeeC = Employee::factory()->create([
            'name'              => 'Employee Active Unpublished',
            'is_published'      => false,
            'employment_status' => 'active',
            'display_order'     => 3,
        ]);

        // D: soft deleted (HIDDEN)
        $employeeD = Employee::factory()->create([
            'name'              => 'Employee Soft Deleted',
            'is_published'      => true,
            'employment_status' => 'active',
            'display_order'     => 4,
        ]);
        $employeeD->delete();

        $response = $this->getJson('/api/v1/public/employees');

        $response->assertStatus(200);
        $data = $response->json('data');

        $this->assertCount(1, $data);
        $this->assertEquals($employeeA->slug, $data[0]['slug']);
    }

    public function test_public_detail_by_slug_allows_active_and_inactive_published_employees(): void
    {
        $activeEmployee = Employee::factory()->create([
            'slug'              => 'jakkob-aktif',
            'is_published'      => true,
            'employment_status' => 'active',
        ]);

        $inactiveEmployee = Employee::factory()->create([
            'slug'              => 'jakkob-nonaktif',
            'is_published'      => true,
            'employment_status' => 'inactive',
        ]);

        // Active + published detail -> 200
        $this->getJson('/api/v1/public/employees/jakkob-aktif')
            ->assertStatus(200)
            ->assertJsonPath('data.slug', 'jakkob-aktif')
            ->assertJsonPath('data.employment_status', 'active')
            ->assertJsonPath('data.employment_status_label', 'Aktif');

        // Inactive + published detail -> 200 (still accessible for physical ID Card QR)
        $this->getJson('/api/v1/public/employees/jakkob-nonaktif')
            ->assertStatus(200)
            ->assertJsonPath('data.slug', 'jakkob-nonaktif')
            ->assertJsonPath('data.employment_status', 'inactive')
            ->assertJsonPath('data.employment_status_label', 'Tidak Aktif');
    }

    public function test_unpublished_or_deleted_or_nonexistent_slug_returns_404(): void
    {
        $unpublished = Employee::factory()->create([
            'slug'              => 'unpublished-emp',
            'is_published'      => false,
            'employment_status' => 'active',
        ]);

        $deleted = Employee::factory()->create([
            'slug'              => 'deleted-emp',
            'is_published'      => true,
            'employment_status' => 'active',
        ]);
        $deleted->delete();

        // Unpublished -> 404
        $this->getJson('/api/v1/public/employees/unpublished-emp')
            ->assertStatus(404)
            ->assertJsonPath('message', 'Karyawan tidak ditemukan.');

        // Soft-deleted -> 404
        $this->getJson('/api/v1/public/employees/deleted-emp')
            ->assertStatus(404)
            ->assertJsonPath('message', 'Karyawan tidak ditemukan.');

        // Nonexistent -> 404
        $this->getJson('/api/v1/public/employees/random-slug-not-exist')
            ->assertStatus(404)
            ->assertJsonPath('message', 'Karyawan tidak ditemukan.');
    }

    public function test_public_search_q_searches_name_only_not_employee_code(): void
    {
        Employee::factory()->create([
            'employee_code'     => 'CODE9999',
            'name'              => 'Budi Santoso',
            'is_published'      => true,
            'employment_status' => 'active',
            'display_order'     => 1,
        ]);

        Employee::factory()->create([
            'employee_code'     => 'CODE1111',
            'name'              => 'Jakkob Panjaitan',
            'is_published'      => true,
            'employment_status' => 'active',
            'display_order'     => 2,
        ]);

        // Search by name -> finds Budi
        $resName = $this->getJson('/api/v1/public/employees?q=Budi');
        $resName->assertStatus(200);
        $this->assertCount(1, $resName->json('data'));
        $this->assertEquals('Budi Santoso', $resName->json('data.0.name'));

        // Search by employee code 'CODE9999' -> returns EMPTY because q does NOT search code
        $resCode = $this->getJson('/api/v1/public/employees?q=CODE9999');
        $resCode->assertStatus(200);
        $this->assertCount(0, $resCode->json('data'));
    }

    public function test_public_position_and_division_filters(): void
    {
        Employee::factory()->create([
            'name'              => 'Staff A',
            'position'          => 'Programmer',
            'division'          => 'IT',
            'is_published'      => true,
            'employment_status' => 'active',
            'display_order'     => 1,
        ]);

        Employee::factory()->create([
            'name'              => 'Staff B',
            'position'          => 'Akuntan',
            'division'          => 'Keuangan',
            'is_published'      => true,
            'employment_status' => 'active',
            'display_order'     => 2,
        ]);

        // Filter by position
        $resPos = $this->getJson('/api/v1/public/employees?position=Programmer');
        $this->assertCount(1, $resPos->json('data'));
        $this->assertEquals('Staff A', $resPos->json('data.0.name'));

        // Filter by division
        $resDiv = $this->getJson('/api/v1/public/employees?division=Keuangan');
        $this->assertCount(1, $resDiv->json('data'));
        $this->assertEquals('Staff B', $resDiv->json('data.0.name'));
    }

    public function test_public_filter_options_returns_distinct_values_of_active_published_only(): void
    {
        // Active + published
        Employee::factory()->create([
            'position'          => 'Web Developer',
            'division'          => 'Teknologi Informasi',
            'is_published'      => true,
            'employment_status' => 'active',
            'display_order'     => 1,
        ]);

        Employee::factory()->create([
            'position'          => 'Finance Officer',
            'division'          => 'Keuangan',
            'is_published'      => true,
            'employment_status' => 'active',
            'display_order'     => 2,
        ]);

        // Inactive or unpublished should NOT appear in public filter options
        Employee::factory()->create([
            'position'          => 'Ghost Hunter',
            'division'          => 'Secret Division',
            'is_published'      => false,
            'employment_status' => 'active',
            'display_order'     => 3,
        ]);

        Employee::factory()->create([
            'position'          => 'Inactive Role',
            'division'          => 'Inactive Division',
            'is_published'      => true,
            'employment_status' => 'inactive',
            'display_order'     => 4,
        ]);

        $response = $this->getJson('/api/v1/public/employees/filters');

        $response->assertStatus(200);
        $this->assertEquals(['Finance Officer', 'Web Developer'], $response->json('positions'));
        $this->assertEquals(['Keuangan', 'Teknologi Informasi'], $response->json('divisions'));
        $this->assertNotContains('Ghost Hunter', $response->json('positions'));
        $this->assertNotContains('Inactive Division', $response->json('divisions'));
    }

    public function test_public_resource_does_not_expose_private_fields(): void
    {
        $employee = Employee::factory()->create([
            'is_published'      => true,
            'employment_status' => 'active',
        ]);

        $response = $this->getJson("/api/v1/public/employees/{$employee->slug}");

        $response->assertStatus(200);
        $data = $response->json('data');

        $this->assertArrayNotHasKey('id', $data);
        $this->assertArrayNotHasKey('display_order', $data);
        $this->assertArrayNotHasKey('is_published', $data);
        $this->assertArrayNotHasKey('deleted_at', $data);
        $this->assertArrayNotHasKey('id_card_image', $data); // raw storage path must NOT be exposed
        $this->assertArrayHasKey('id_card_image_url', $data); // only public URL
        $this->assertArrayHasKey('public_url', $data);
    }
}
