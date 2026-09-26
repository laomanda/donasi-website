<?php

namespace App\Services;

use App\Models\AccountingPeriod;
use App\Models\WaqfAsset;
use Carbon\Carbon;

class WaqfAssetReportService
{
    /**
     * Generate Waqf Asset Register (Laporan Rincian Aset Wakaf - LRAW).
     *
     * @param int|array|null $categoryId
     * @param int|null $periodId
     * @param string|null $status
     * @return array
     */
    public function getAssetRegister(
        int|array|null $categoryId = null,
        ?int $periodId = null,
        ?string $status = null
    ): array {
        if (is_array($categoryId)) {
            $filters = $categoryId;
            $categoryId = $filters['category_id'] ?? null;
            $periodId = $filters['period_id'] ?? $filters['accounting_period_id'] ?? null;
            $status = $filters['status'] ?? null;
        }

        $query = WaqfAsset::with(['category', 'wakif', 'sources', 'depreciations']);

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        $assets = $query->orderBy('asset_code', 'asc')->get();

        $register = [];

        foreach ($assets as $asset) {
            $accumulatedDepreciation = 0.0;
            $bookValue = (float) $asset->acquisition_value;

            if ($periodId) {
                // Look for depreciation in this specific period
                $depreciation = $asset->depreciations->firstWhere('period_id', $periodId);

                if ($depreciation) {
                    $accumulatedDepreciation = (float) $depreciation->accumulated_depreciation;
                    $bookValue = (float) $depreciation->book_value;
                } else {
                    // Check if there are earlier depreciations up to this period's end date
                    $period = AccountingPeriod::find($periodId);
                    if ($period && $period->end_date) {
                        $periodEndDate = Carbon::parse($period->end_date)->toDateString();
                        $priorDepreciation = $asset->depreciations()
                            ->join('accounting_periods', 'asset_depreciations.period_id', '=', 'accounting_periods.id')
                            ->where('accounting_periods.end_date', '<=', $periodEndDate)
                            ->orderBy('accounting_periods.end_date', 'desc')
                            ->select('asset_depreciations.*')
                            ->first();

                        if ($priorDepreciation) {
                            $accumulatedDepreciation = (float) $priorDepreciation->accumulated_depreciation;
                            $bookValue = (float) $priorDepreciation->book_value;
                        }
                    }
                }
            } else {
                // If no period specified, take latest recorded depreciation
                $latestDepreciation = $asset->depreciations->sortByDesc('id')->first();
                if ($latestDepreciation) {
                    $accumulatedDepreciation = (float) $latestDepreciation->accumulated_depreciation;
                    $bookValue = (float) $latestDepreciation->book_value;
                } elseif ($asset->current_value > 0 && $asset->current_value < $asset->acquisition_value) {
                    $accumulatedDepreciation = (float) ($asset->acquisition_value - $asset->current_value);
                    $bookValue = (float) $asset->current_value;
                }
            }

            // Sources list
            $sourcesList = $asset->sources->map(function ($s) {
                return [
                    'id'          => $s->id,
                    'source_type' => $s->source_type,
                    'amount'      => (float) $s->amount,
                    'description' => $s->description,
                ];
            })->values()->all();

            $register[] = [
                'id'                       => $asset->id,
                'asset_code'               => $asset->asset_code,
                'asset_name'               => $asset->asset_name,
                'category_id'              => $asset->category_id,
                'category'                 => $asset->category?->name ?? '-',
                'wakif_id'                 => $asset->wakif_id,
                'wakif'                    => $asset->wakif?->name ?? 'Hamba Allah',
                'acquisition_date'         => $asset->acquisition_date ? Carbon::parse($asset->acquisition_date)->toDateString() : null,
                'quantity'                 => (float) $asset->quantity,
                'useful_life_month'        => (int) $asset->useful_life_month,
                'acquisition_value'        => (float) $asset->acquisition_value,
                'accumulated_depreciation' => (float) $accumulatedDepreciation,
                'book_value'               => (float) $bookValue,
                'location'                 => $asset->location,
                'condition'                => $asset->condition,
                'status'                   => $asset->status,
                'sources'                  => $sourcesList,
            ];
        }

        return $register;
    }

    /**
     * Get aggregate summary of waqf assets.
     *
     * @param int|array|null $categoryId
     * @param int|null $periodId
     * @param string|null $status
     * @return array
     */
    public function getSummary(
        int|array|null $categoryId = null,
        ?int $periodId = null,
        ?string $status = null
    ): array {
        $assets = $this->getAssetRegister($categoryId, $periodId, $status);
        $collection = collect($assets);

        $totalAcquisition = (float) $collection->sum('acquisition_value');
        $totalAccumulatedDepreciation = (float) $collection->sum('accumulated_depreciation');
        $totalBookValue = (float) $collection->sum('book_value');

        // Group by category
        $byCategory = $collection->groupBy('category')->map(function ($items, $categoryName) {
            return [
                'category'                 => $categoryName,
                'count'                    => $items->count(),
                'acquisition_value'        => (float) $items->sum('acquisition_value'),
                'accumulated_depreciation' => (float) $items->sum('accumulated_depreciation'),
                'book_value'               => (float) $items->sum('book_value'),
            ];
        })->values()->all();

        // Group by condition
        $byCondition = $collection->groupBy('condition')->map(function ($items, $conditionName) {
            return [
                'condition'  => $conditionName,
                'count'      => $items->count(),
                'book_value' => (float) $items->sum('book_value'),
            ];
        })->values()->all();

        // Group by status
        $byStatus = $collection->groupBy('status')->map(function ($items, $statusName) {
            return [
                'status'     => $statusName,
                'count'      => $items->count(),
                'book_value' => (float) $items->sum('book_value'),
            ];
        })->values()->all();

        return [
            'total_assets'                   => $collection->count(),
            'total_acquisition_value'        => $totalAcquisition,
            'total_accumulated_depreciation' => $totalAccumulatedDepreciation,
            'total_book_value'               => $totalBookValue,
            'by_category'                    => $byCategory,
            'by_condition'                   => $byCondition,
            'by_status'                      => $byStatus,
        ];
    }

    /**
     * Get complete LRAW report with period info, summary, and asset register.
     *
     * @param int|array|null $categoryId
     * @param int|null $periodId
     * @param string|null $status
     * @return array
     */
    public function getReport(
        int|array|null $categoryId = null,
        ?int $periodId = null,
        ?string $status = null
    ): array {
        if (is_array($categoryId)) {
            $filters = $categoryId;
            $categoryId = $filters['category_id'] ?? null;
            $periodId = $filters['period_id'] ?? $filters['accounting_period_id'] ?? null;
            $status = $filters['status'] ?? null;
        }

        $period = $periodId ? AccountingPeriod::find($periodId) : null;
        $assets = $this->getAssetRegister($categoryId, $periodId, $status);
        $summary = $this->getSummary($categoryId, $periodId, $status);

        return [
            'period'  => $period ? [
                'id'         => $period->id,
                'name'       => $period->name,
                'start_date' => $period->start_date ? Carbon::parse($period->start_date)->toDateString() : null,
                'end_date'   => $period->end_date ? Carbon::parse($period->end_date)->toDateString() : null,
                'status'     => $period->status,
            ] : null,
            'filters' => [
                'category_id' => $categoryId,
                'period_id'   => $periodId,
                'status'      => $status,
            ],
            'summary' => $summary,
            'assets'  => $assets,
        ];
    }

    /**
     * Get detail of a specific waqf asset with sources and depreciation schedule.
     *
     * @param int $assetId
     * @param int|null $periodId
     * @return array|null
     */
    public function getAssetDetail(int $assetId, ?int $periodId = null): ?array
    {
        $asset = WaqfAsset::with(['category', 'wakif', 'sources', 'depreciations.period'])->find($assetId);

        if (!$asset) {
            return null;
        }

        $registerData = $this->getAssetRegister(null, $periodId, null);
        $item = collect($registerData)->firstWhere('id', $assetId);

        $depreciationHistory = $asset->depreciations->map(function ($d) {
            return [
                'id'                       => $d->id,
                'period_id'                => $d->period_id,
                'period_name'              => $d->period?->name,
                'period_end_date'          => $d->period?->end_date ? Carbon::parse($d->period->end_date)->toDateString() : null,
                'depreciation_expense'     => (float) $d->depreciation_expense,
                'accumulated_depreciation' => (float) $d->accumulated_depreciation,
                'book_value'               => (float) $d->book_value,
            ];
        })->values()->all();

        return array_merge($item ?? [], [
            'depreciation_history' => $depreciationHistory,
        ]);
    }
}
