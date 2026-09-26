<?php

namespace App\Observers;

use App\Models\Allocation;
use App\Services\AllocationJournalService;

class AllocationObserver
{
    /**
     * Handle the Allocation "saved" event.
     * Triggered when an allocation is created or updated.
     */
    public function saved(Allocation $allocation): void
    {
        $service = app(AllocationJournalService::class);

        if ($service->isAllocationValid($allocation)) {
            $service->recordAllocationJournal($allocation);
        }
    }
}
