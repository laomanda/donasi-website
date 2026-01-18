<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('editor-tasks.{userId}', function ($user, $userId) {
    if (! $user || ! $user->is_active) {
        return false;
    }

    if (! $user->hasAnyRole(['editor', 'admin', 'superadmin'])) {
        return false;
    }

    return (int) $user->id === (int) $userId;
});
