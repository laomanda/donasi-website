<?php

namespace App\Services;

use App\Models\AccountingPeriod;
use App\Models\FinancialNote;
use Carbon\Carbon;

class FinancialNoteService
{
    /**
     * Get financial notes (Catatan Atas Laporan Keuangan - CLK).
     *
     * @param int|array|null $periodId
     * @param string|null $category
     * @param string|null $status
     * @return array
     */
    public function getNotes(
        int|array|null $periodId = null,
        ?string $category = null,
        ?string $status = null
    ): array {
        if (is_array($periodId)) {
            $filters = $periodId;
            $periodId = $filters['period_id'] ?? $filters['accounting_period_id'] ?? null;
            $category = $filters['category'] ?? null;
            $status = $filters['status'] ?? null;
        }

        $query = FinancialNote::with(['accountingPeriod', 'creator']);

        if ($periodId) {
            $query->where('accounting_period_id', $periodId);
        }

        if ($category) {
            $query->where('category', $category);
        }

        if ($status) {
            $query->where('status', $status);
        }

        $notes = $query->orderBy('sort_order', 'asc')->orderBy('id', 'asc')->get();

        return $notes->map(function (FinancialNote $note) {
            return [
                'id'                   => $note->id,
                'accounting_period_id' => $note->accounting_period_id,
                'period_id'            => $note->accounting_period_id,
                'period_name'          => $note->accountingPeriod?->name,
                'title'                => $note->title,
                'category'             => $note->category,
                'category_label'       => FinancialNote::CATEGORIES[$note->category] ?? ucfirst(str_replace('_', ' ', $note->category)),
                'content'              => $note->content,
                'sort_order'           => (int) $note->sort_order,
                'status'               => $note->status,
                'created_by'           => $note->created_by,
                'creator_name'         => $note->creator?->name,
                'created_at'           => $note->created_at?->toDateTimeString(),
                'updated_at'           => $note->updated_at?->toDateTimeString(),
            ];
        })->values()->all();
    }

    /**
     * Get summary of financial notes.
     *
     * @param int|array|null $periodId
     * @return array
     */
    public function getSummary(
        int|array|null $periodId = null
    ): array {
        if (is_array($periodId)) {
            $filters = $periodId;
            $periodId = $filters['period_id'] ?? $filters['accounting_period_id'] ?? null;
        }

        $query = FinancialNote::query();
        if ($periodId) {
            $query->where('accounting_period_id', $periodId);
        }

        $allNotes = $query->get();
        $totalCount = $allNotes->count();

        // Summary by category
        $byCategory = [];
        foreach (FinancialNote::CATEGORIES as $key => $label) {
            $count = $allNotes->where('category', $key)->count();
            $byCategory[] = [
                'category' => $key,
                'label'    => $label,
                'count'    => $count,
            ];
        }

        // Custom categories if any
        $customCategories = $allNotes->pluck('category')->unique()->diff(array_keys(FinancialNote::CATEGORIES));
        foreach ($customCategories as $cat) {
            $byCategory[] = [
                'category' => $cat,
                'label'    => ucfirst(str_replace('_', ' ', $cat)),
                'count'    => $allNotes->where('category', $cat)->count(),
            ];
        }

        // Summary by status
        $byStatus = [
            'draft'     => $allNotes->where('status', FinancialNote::STATUS_DRAFT)->count(),
            'published' => $allNotes->where('status', FinancialNote::STATUS_PUBLISHED)->count(),
        ];

        return [
            'period_id'   => $periodId,
            'total_notes' => $totalCount,
            'by_category' => $byCategory,
            'by_status'   => $byStatus,
        ];
    }

    /**
     * Create a new financial note.
     *
     * @param array $data
     * @param int|null $userId
     * @return FinancialNote
     */
    public function createNote(array $data, ?int $userId = null): FinancialNote
    {
        $periodId = $data['accounting_period_id'] ?? $data['period_id'] ?? null;

        return FinancialNote::create([
            'accounting_period_id' => $periodId,
            'title'                => $data['title'],
            'category'             => $data['category'] ?? FinancialNote::CATEGORY_GENERAL_NOTE,
            'content'              => $data['content'],
            'sort_order'           => (int) ($data['sort_order'] ?? 0),
            'status'               => $data['status'] ?? FinancialNote::STATUS_DRAFT,
            'created_by'           => $userId ?? $data['created_by'] ?? null,
        ]);
    }

    /**
     * Update an existing financial note.
     *
     * @param int $id
     * @param array $data
     * @return FinancialNote
     */
    public function updateNote(int $id, array $data): FinancialNote
    {
        $note = FinancialNote::findOrFail($id);

        $attributes = [];
        if (array_key_exists('accounting_period_id', $data) || array_key_exists('period_id', $data)) {
            $attributes['accounting_period_id'] = $data['accounting_period_id'] ?? $data['period_id'] ?? null;
        }
        if (isset($data['title'])) {
            $attributes['title'] = $data['title'];
        }
        if (isset($data['category'])) {
            $attributes['category'] = $data['category'];
        }
        if (isset($data['content'])) {
            $attributes['content'] = $data['content'];
        }
        if (isset($data['sort_order'])) {
            $attributes['sort_order'] = (int) $data['sort_order'];
        }
        if (isset($data['status'])) {
            $attributes['status'] = $data['status'];
        }

        $note->update($attributes);

        return $note;
    }

    /**
     * Delete a financial note.
     *
     * @param int $id
     * @return bool
     */
    public function deleteNote(int $id): bool
    {
        $note = FinancialNote::findOrFail($id);
        return (bool) $note->delete();
    }

    /**
     * Find a single note by id.
     *
     * @param int $id
     * @return FinancialNote|null
     */
    public function findNote(int $id): ?FinancialNote
    {
        return FinancialNote::with(['accountingPeriod', 'creator'])->find($id);
    }
}
