<?php

namespace App\Support;

use App\Events\AdminBadgeCountsUpdated;
use App\Models\PickupRequest;
use App\Models\WakafConsultation;
use App\Models\Suggestion;
use App\Models\User;

class AdminBadgeNotifier
{
    public static function dispatchCountForAllAdmins(): void
    {
        $listenerIds = User::role(['admin', 'superadmin'])
            ->where('is_active', true)
            ->pluck('id')
            ->all();

        if (empty($listenerIds)) {
            return;
        }

        $pickupCount = PickupRequest::where('status', 'baru')->count();
        $consultationCount = WakafConsultation::where('status', 'baru')->count();
        $suggestionCount = Suggestion::where('status', 'baru')->count();

        foreach ($listenerIds as $listenerId) {
            $id = (int) $listenerId;
            event(new AdminBadgeCountsUpdated($id, $pickupCount, $consultationCount, $suggestionCount));
        }
    }
}

