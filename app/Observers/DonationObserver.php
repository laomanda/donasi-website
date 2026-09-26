<?php

namespace App\Observers;

use App\Models\Donation;
use App\Services\DonationJournalService;

class DonationObserver
{
    /**
     * Handle the Donation "saved" event.
     */
    public function saved(Donation $donation): void
    {
        if ($donation->status === 'paid') {
            app(DonationJournalService::class)->recordDonationJournal($donation);
        }
    }
}
