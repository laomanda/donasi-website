<?php

namespace App\Support;

use App\Events\EditorTaskCountUpdated;
use App\Models\EditorTask;
use App\Models\User;

class EditorTaskNotifier
{
    public static function dispatchCountForUser(int $userId): void
    {
        $counts = self::computeCounts([$userId]);
        if (! array_key_exists($userId, $counts)) {
            return;
        }

        event(new EditorTaskCountUpdated($userId, $counts[$userId]));
    }

    public static function dispatchCountForAllEditors(): void
    {
        $listenerIds = User::role(['editor', 'admin', 'superadmin'])
            ->where('is_active', true)
            ->pluck('id')
            ->all();

        if (empty($listenerIds)) {
            return;
        }

        $counts = self::computeCounts($listenerIds);
        foreach ($listenerIds as $listenerId) {
            $id = (int) $listenerId;
            $count = $counts[$id] ?? 0;
            event(new EditorTaskCountUpdated($id, $count));
        }
    }

    private static function computeCounts(array $userIds): array
    {
        $ids = array_values(array_unique(array_map(function ($id) {
            return (int) $id;
        }, array_filter($userIds, function ($id) {
            return $id !== null && $id !== '';
        }))));

        if (empty($ids)) {
            return [];
        }

        $globalCount = EditorTask::query()
            ->whereNull('assigned_to')
            ->where('status', 'open')
            ->count();

        $perUser = EditorTask::query()
            ->whereIn('assigned_to', $ids)
            ->where('status', 'open')
            ->selectRaw('assigned_to, count(*) as total')
            ->groupBy('assigned_to')
            ->pluck('total', 'assigned_to');

        $counts = [];
        foreach ($ids as $id) {
            $counts[$id] = $globalCount + (int) ($perUser[$id] ?? 0);
        }

        return $counts;
    }
}
