<?php

namespace App\Observers;

use App\Models\Donation;
use App\Services\DonationJournalService;
use Illuminate\Support\Facades\Log;

class DonationObserver
{
    /**
     * Handle the Donation "saved" event.
     */
    public function saved(Donation $donation): void
    {
        if ($donation->status === 'paid') {
            try {
                app(DonationJournalService::class)->recordDonationJournal($donation);
            } catch (\Throwable $e) {
                Log::error("DonationObserver error recording journal for donation {$donation->id}: " . $e->getMessage());
            }
        }
    }
}

