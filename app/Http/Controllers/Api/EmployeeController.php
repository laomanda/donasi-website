<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Employee\StoreEmployeeRequest;
use App\Http\Requests\Employee\UpdateEmployeeRequest;
use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use App\Services\EmployeeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EmployeeController extends Controller
{
    public function __construct(
        protected EmployeeService $employeeService
    ) {}

    /**
     * Display a paginated list of employees for management console.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['q', 'position', 'division', 'employment_status', 'is_published']);
        $perPage = $request->integer('per_page', 15);

        $employees = $this->employeeService->paginateManagement($filters, $perPage);

        return EmployeeResource::collection($employees);
    }

    /**
     * Get distinct position and division filter options for management dropdowns.
     */
    public function filters(): JsonResponse
    {
        return response()->json($this->employeeService->getManagementFilterOptions());
    }

    /**
     * Store a newly created employee record in storage.
     */
    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        $employee = $this->employeeService->createEmployee(
            $request->validated(),
            $request->file('id_card_image')
        );

        return response()->json([
            'message' => 'Karyawan berhasil ditambahkan.',
            'data'    => new EmployeeResource($employee),
        ], 201);
    }

    /**
     * Display the specified employee details for management console.
     */
    public function show(Employee $employee): JsonResponse
    {
        return response()->json([
            'data' => new EmployeeResource($employee),
        ]);
    }

    /**
     * Update the specified employee record in storage.
     */
    public function update(UpdateEmployeeRequest $request, Employee $employee): JsonResponse
    {
        $updatedEmployee = $this->employeeService->updateEmployee(
            $employee,
            $request->validated(),
            $request->file('id_card_image')
        );

        return response()->json([
            'message' => 'Data karyawan berhasil diperbarui.',
            'data'    => new EmployeeResource($updatedEmployee),
        ]);
    }

    /**
     * Soft delete the specified employee record.
     */
    public function destroy(Employee $employee): JsonResponse
    {
        $this->employeeService->deleteEmployee($employee);

        return response()->json([
            'message' => 'Karyawan berhasil dihapus.',
        ]);
    }
}
