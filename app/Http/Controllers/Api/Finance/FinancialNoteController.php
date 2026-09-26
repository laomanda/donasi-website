<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Services\FinancialNoteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FinancialNoteController extends Controller
{
    public function __construct(
        protected FinancialNoteService $noteService
    ) {}

    /**
     * Display a listing of financial notes (CLK).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'period_id'            => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'accounting_period_id' => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'category'             => ['nullable', 'string', 'max:50'],
            'status'               => ['nullable', 'string', 'in:draft,published'],
        ]);

        $periodId = $request->filled('period_id')
            ? (int) $request->input('period_id')
            : ($request->filled('accounting_period_id') ? (int) $request->input('accounting_period_id') : null);

        $category = $request->input('category');
        $status = $request->input('status');

        $notes = $this->noteService->getNotes($periodId, $category, $status);

        return response()->json([
            'status' => 'success',
            'data'   => $notes,
        ]);
    }

    /**
     * Display summary of financial notes.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function summary(Request $request): JsonResponse
    {
        $request->validate([
            'period_id'            => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'accounting_period_id' => ['nullable', 'integer', 'exists:accounting_periods,id'],
        ]);

        $periodId = $request->filled('period_id')
            ? (int) $request->input('period_id')
            : ($request->filled('accounting_period_id') ? (int) $request->input('accounting_period_id') : null);

        $summary = $this->noteService->getSummary($periodId);

        return response()->json([
            'status' => 'success',
            'data'   => $summary,
        ]);
    }

    /**
     * Store a newly created financial note.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'                => ['required', 'string', 'max:255'],
            'category'             => ['required', 'string', 'max:50'],
            'content'              => ['required', 'string'],
            'period_id'            => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'accounting_period_id' => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'sort_order'           => ['nullable', 'integer', 'min:0'],
            'status'               => ['nullable', 'string', 'in:draft,published'],
        ]);

        if (empty($validated['accounting_period_id']) && !empty($validated['period_id'])) {
            $validated['accounting_period_id'] = $validated['period_id'];
        }

        $userId = $request->user()?->id;
        $note = $this->noteService->createNote($validated, $userId);

        return response()->json([
            'status'  => 'success',
            'message' => 'Catatan keuangan berhasil disimpan.',
            'data'    => $note->fresh(['accountingPeriod', 'creator']),
        ], 201);
    }

    /**
     * Display a specific financial note.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $note = $this->noteService->findNote($id);

        if (!$note) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Catatan keuangan tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $note,
        ]);
    }

    /**
     * Update the specified financial note.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'title'                => ['sometimes', 'required', 'string', 'max:255'],
            'category'             => ['sometimes', 'required', 'string', 'max:50'],
            'content'              => ['sometimes', 'required', 'string'],
            'period_id'            => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'accounting_period_id' => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'sort_order'           => ['nullable', 'integer', 'min:0'],
            'status'               => ['nullable', 'string', 'in:draft,published'],
        ]);

        if (array_key_exists('period_id', $validated) && !array_key_exists('accounting_period_id', $validated)) {
            $validated['accounting_period_id'] = $validated['period_id'];
        }

        $note = $this->noteService->updateNote($id, $validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Catatan keuangan berhasil diperbarui.',
            'data'    => $note->fresh(['accountingPeriod', 'creator']),
        ]);
    }

    /**
     * Remove the specified financial note.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $this->noteService->deleteNote($id);

        return response()->json([
            'status'  => 'success',
            'message' => 'Catatan keuangan berhasil dihapus.',
        ]);
    }
}
