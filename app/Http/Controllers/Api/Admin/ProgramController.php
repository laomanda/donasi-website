<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProgramController extends Controller
{
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

        $programs = $query->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 15));

        return response()->json($programs);
    }

    /**
     * Store a new program.
     */
    public function store(Request $request)
    {
        $data = $this->validatePayload($request);

        $data['slug'] = $data['slug'] ?? Str::slug($data['title']);
        $data['collected_amount'] ??= 0;

        $program = Program::create($data);

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
    public function update(Request $request, Program $program)
    {
        $data = $this->validatePayload($request, $program->id, true);

        if (blank($data['slug'] ?? null)) {
            $data['slug'] = Str::slug($data['title']);
        }

        $program->update($data);

        return response()->json($program->refresh());
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
    public function updateStatus(Request $request, Program $program)
    {
        $data = $request->validate([
            'status' => ['required', 'in:draft,active,completed,archived'],
        ]);

        $program->update($data);

        return response()->json($program);
    }

    /**
     * Toggle highlight flag.
     */
    public function toggleHighlight(Program $program)
    {
        $program->is_highlight = ! $program->is_highlight;
        $program->save();

        return response()->json($program);
    }

    private function validatePayload(Request $request, ?int $programId = null, bool $isUpdate = false): array
    {
        $required = $isUpdate ? 'sometimes' : 'required';

        return $request->validate([
            'title'             => [$required, 'string', 'max:255'],
            'title_en'          => ['nullable', 'string', 'max:255'],
            'slug'              => ['nullable', 'string', 'max:255', 'unique:programs,slug,' . $programId],
            'category'          => [$required, 'string', 'max:100'],
            'category_en'       => ['nullable', 'string', 'max:100'],
            'short_description' => [$required, 'string'],
            'short_description_en' => ['nullable', 'string'],
            'description'       => [$required, 'string'],
            'description_en'    => ['nullable', 'string'],
            'benefits'          => ['nullable', 'string'],
            'benefits_en'       => ['nullable', 'string'],
            'target_amount'     => [$required, 'numeric', 'min:0'],
            'collected_amount'  => ['nullable', 'numeric', 'min:0'],
            'thumbnail_path'    => ['nullable', 'string', 'max:255'],
            'banner_path'       => ['nullable', 'string', 'max:255'],
            'is_highlight'      => ['sometimes', 'boolean'],
            'status'            => [$required, 'in:draft,active,completed,archived'],
            'deadline_days'     => ['nullable', 'integer', 'min:0'],
        ]);
    }
}
