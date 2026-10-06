<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PublicEmployeeResource;
use App\Services\EmployeeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PublicEmployeeController extends Controller
{
    public function __construct(
        protected EmployeeService $employeeService
    ) {}

    /**
     * Display a paginated list of active and published employees for public directory.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['q', 'position', 'division']);
        $perPage = $request->integer('per_page', 12);

        $employees = $this->employeeService->paginatePublicDirectory($filters, $perPage);

        return PublicEmployeeResource::collection($employees);
    }

    /**
     * Display a public employee profile by slug.
     * Accessible for active or inactive published employees.
     * Returns 404 if unpublished, deleted, or nonexistent.
     */
    public function show(string $slug): PublicEmployeeResource|JsonResponse
    {
        $employee = $this->employeeService->findPublicBySlug($slug);

        if (!$employee) {
            return response()->json([
                'message' => 'Karyawan tidak ditemukan.',
            ], 404);
        }

        return new PublicEmployeeResource($employee);
    }

    /**
     * Get distinct position and division filter options from active published employees.
     */
    public function filters(): JsonResponse
    {
        return response()->json($this->employeeService->getPublicFilterOptions());
    }
}
