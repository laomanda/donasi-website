<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\Admin\ProgramRequest;
use App\Http\Requests\Admin\UpdateProgramStatusRequest;
use App\Services\ProgramService;

class ProgramController extends Controller
{
    public function __construct(private ProgramService $programService)
    {
    }

    /**
     * List programs with filter & pagination.
     */
    public function index(Request $request)
    {
        $query = Program::query();

        $search = $request->string('q')->trim()->toString();
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        $status = $request->string('status')->trim()->toString();
        if ($status !== '') {
            $query->where('status', $status);
        }

        $category = $request->string('category')->trim()->toString();
        if ($category !== '') {
            $query->where('category', $category);
        }

        $programs = $query->orderByDesc(DB::raw('COALESCE(published_at, created_at)'))
            ->paginate($request->integer('per_page', 15));

        return response()->json($programs);
    }

    /**
     * Store a new program.
     */
    public function store(ProgramRequest $request)
    {
        $program = $this->programService->storeProgram($request->validated());
        return response()->json($program, 201);
    }

    /**
     * Show detail for editing.
     */
    public function show(Program $program)
    {
        return response()->json($program);
    }

    /**
     * Update program.
     */
    public function update(ProgramRequest $request, Program $program)
    {
        $updatedProgram = $this->programService->updateProgram($program, $request->validated());
        return response()->json($updatedProgram);
    }

    /**
     * Delete program.
     */
    public function destroy(Program $program)
    {
        if ($program->donations()->exists()) {
            return response()->json([
                'message' => 'Program memiliki donasi dan tidak dapat dihapus.',
            ], 422);
        }

        $program->delete();

        return response()->json([
            'message' => 'Program dihapus.',
        ]);
    }

    /**
     * Update status via simple endpoint.
     */
    public function updateStatus(UpdateProgramStatusRequest $request, Program $program)
    {
        $updatedProgram = $this->programService->updateStatus($program, $request->validated());
        return response()->json($updatedProgram);
    }

    /**
     * Toggle highlight flag.
     */
    public function toggleHighlight(Program $program)
    {
        $updatedProgram = $this->programService->toggleHighlight($program);
        return response()->json($updatedProgram);
    }

    public function categories()
    {
        $categories = Program::query()
            ->select('category', 'category_en')
            ->distinct()
            ->whereNotNull('category')
            ->orderBy('category')
            ->get();

        return response()->json($categories);
    }
}
