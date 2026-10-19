<?php

namespace App\Observers;

use App\Models\Allocation;
use App\Services\AllocationJournalService;
use Illuminate\Support\Facades\Log;

class AllocationObserver
{
    /**
     * Handle the Allocation "saved" event.
     * Triggered when an allocation is created or updated.
     */
    public function saved(Allocation $allocation): void
    {
        try {
            $service = app(AllocationJournalService::class);

            if ($service->isAllocationValid($allocation)) {
                $service->recordAllocationJournal($allocation);
            }
        } catch (\Throwable $e) {
            Log::error("AllocationObserver error recording journal for allocation {$allocation->id}: " . $e->getMessage());
        }
    }
}

