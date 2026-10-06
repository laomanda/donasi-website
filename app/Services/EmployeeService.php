<?php

namespace App\Services;

use App\Models\Employee;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EmployeeService
{
    /**
     * Paginate employees for the public directory.
     * Rules:
     * - is_published = true
     * - employment_status = 'active'
     * - not soft deleted
     * - q searches name only
     * - exact match on position and division
     * - sorted by display_order ASC, name ASC
     */
    public function paginatePublicDirectory(array $filters = [], int $perPage = 12): LengthAwarePaginator
    {
        $query = Employee::query()->publicDirectory();

        // 1. Name search only
        if (!empty($filters['q'])) {
            $search = trim((string) $filters['q']);
            if ($search !== '') {
                $query->where('name', 'like', "%{$search}%");
            }
        }

        // 2. Exact position filter
        if (!empty($filters['position'])) {
            $pos = trim((string) $filters['position']);
            if ($pos !== '') {
                $query->where('position', $pos);
            }
        }

        // 3. Exact division filter
        if (!empty($filters['division'])) {
            $div = trim((string) $filters['division']);
            if ($div !== '') {
                $query->where('division', $div);
            }
        }

        $perPage = min(max($perPage, 1), 48);

        return $query->orderBy('display_order', 'asc')
            ->orderBy('name', 'asc')
            ->paginate($perPage);
    }

    /**
     * Find a published employee by slug for public detail page.
     * Rules:
     * - is_published = true
     * - not soft deleted
     * - inactive status is STILL allowed for public detail (e.g. printed ID card validity)
     * - unpublished or nonexistent returns null (404)
     */
    public function findPublicBySlug(string $slug): ?Employee
    {
        return Employee::query()
            ->published()
            ->where('slug', trim($slug))
            ->first();
    }

    /**
     * Get distinct positions and divisions for public filter dropdowns.
     * Derived only from active, published, non-deleted employees.
     */
    public function getPublicFilterOptions(): array
    {
        $positions = Employee::query()
            ->publicDirectory()
            ->whereNotNull('position')
            ->where('position', '!=', '')
            ->distinct()
            ->orderBy('position', 'asc')
            ->pluck('position')
            ->values()
            ->all();

        $divisions = Employee::query()
            ->publicDirectory()
            ->whereNotNull('division')
            ->where('division', '!=', '')
            ->distinct()
            ->orderBy('division', 'asc')
            ->pluck('division')
            ->values()
            ->all();

        return [
            'positions' => $positions,
            'divisions' => $divisions,
            'display_orders' => Employee::query()
                ->whereNotNull('display_order')
                ->orderBy('display_order')
                ->pluck('display_order')
                ->map(fn ($order) => (int) $order)
                ->values()
                ->all(),
        ];
    }

    /**
     * Paginate employees for management console.
     * Supports filtering by q (name or code), position, division, status, publication.
     */
    public function paginateManagement(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Employee::query();

        if (!empty($filters['q'])) {
            $search = trim((string) $filters['q']);
            if ($search !== '') {
                $query->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('employee_code', 'like', "%{$search}%");
                });
            }
        }

        if (!empty($filters['position'])) {
            $query->where('position', trim((string) $filters['position']));
        }

        if (!empty($filters['division'])) {
            $query->where('division', trim((string) $filters['division']));
        }

        if (!empty($filters['employment_status'])) {
            $query->where('employment_status', trim((string) $filters['employment_status']));
        }

        if (array_key_exists('is_published', $filters) && $filters['is_published'] !== '' && $filters['is_published'] !== null) {
            $published = filter_var($filters['is_published'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($published !== null) {
                $query->where('is_published', $published);
            }
        }

        $perPage = min(max($perPage, 1), 100);

        return $query->orderBy('display_order', 'asc')
            ->orderBy('name', 'asc')
            ->paginate($perPage);
    }

    /**
     * Get distinct positions and divisions for management filter dropdowns.
     * Derived from all non-deleted employees.
     */
    public function getManagementFilterOptions(): array
    {
        $positions = Employee::query()
            ->whereNotNull('position')
            ->where('position', '!=', '')
            ->distinct()
            ->orderBy('position', 'asc')
            ->pluck('position')
            ->values()
            ->all();

        $divisions = Employee::query()
            ->whereNotNull('division')
            ->where('division', '!=', '')
            ->distinct()
            ->orderBy('division', 'asc')
            ->pluck('division')
            ->values()
            ->all();

        return [
            'positions' => $positions,
            'divisions' => $divisions,
            'display_orders' => Employee::query()
                ->whereNotNull('display_order')
                ->orderBy('display_order')
                ->pluck('display_order')
                ->map(fn ($order) => (int) $order)
                ->values()
                ->all(),
        ];
    }

    /**
     * Create a new employee record with image upload and slug resolution.
     */
    public function createEmployee(array $data, ?UploadedFile $imageFile): Employee
    {
        // 1. Slug resolution
        if (empty($data['slug'])) {
            $data['slug'] = $this->generateUniqueSlug($data['name']);
        } else {
            $data['slug'] = Str::slug($data['slug']);
        }

        // 2. Image upload
        $storedPath = null;
        if ($imageFile) {
            $storedPath = $imageFile->store('employees/id-cards', 'public');
            $data['id_card_image'] = $storedPath;
        }

        try {
            return DB::transaction(function () use ($data) {
                return Employee::create($data);
            });
        } catch (\Throwable $e) {
            if ($storedPath && Storage::disk('public')->exists($storedPath)) {
                Storage::disk('public')->delete($storedPath);
            }
            throw $e;
        }
    }

    /**
     * Update an existing employee with optional replacement image and slug stability.
     */
    public function updateEmployee(Employee $employee, array $data, ?UploadedFile $imageFile = null): Employee
    {
        // 1. Slug stability: Name change must NOT auto-generate a new slug
        if (array_key_exists('slug', $data) && !empty($data['slug'])) {
            $data['slug'] = Str::slug($data['slug']);
        } else {
            // Keep current slug untouched
            unset($data['slug']);
        }

        // 2. Safe replacement of ID Card image
        $oldPath = $employee->id_card_image;
        $newPath = null;

        if ($imageFile) {
            $newPath = $imageFile->store('employees/id-cards', 'public');
            $data['id_card_image'] = $newPath;
        }

        try {
            $updatedEmployee = DB::transaction(function () use ($employee, $data) {
                $employee->update($data);
                return $employee->refresh();
            });
        } catch (\Throwable $e) {
            if ($newPath && Storage::disk('public')->exists($newPath)) {
                Storage::disk('public')->delete($newPath);
            }
            throw $e;
        }

        // 3. Delete old file only after DB update succeeds
        if ($newPath && $oldPath && $oldPath !== $newPath && Storage::disk('public')->exists($oldPath)) {
            Storage::disk('public')->delete($oldPath);
        }

        return $updatedEmployee;
    }

    /**
     * Soft delete an employee record.
     * Note: ID card image on disk is intentionally preserved for future audit / restoration.
     * The display_order is released (set to null) so subsequent employees may reuse the number.
     */
    public function deleteEmployee(Employee $employee): bool
    {
        return DB::transaction(function () use ($employee) {
            $employee->display_order = null;
            $employee->saveQuietly();

            return (bool) $employee->delete();
        });
    }

    /**
     * Generate a unique URL slug based on employee name.
     */
    public function generateUniqueSlug(string $name, ?int $excludeId = null): string
    {
        $baseSlug = Str::slug(trim($name)) ?: 'karyawan';
        $slug = $baseSlug;
        $counter = 2;

        while (
            Employee::withTrashed()
                ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}
