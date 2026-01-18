<?php

namespace App\Http\Controllers\Api\Editor;

use App\Http\Controllers\Controller;
use App\Models\EditorTask;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class EditorTaskStreamController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            $token = $request->query('token');
            if ($token) {
                $accessToken = PersonalAccessToken::findToken($token);
                $user = $accessToken?->tokenable;
            }
        }

        if (! $user) {
            return response()->json(['message' => 'Token tidak valid.'], 401);
        }

        if (! $user->is_active || ! $user->hasAnyRole(['editor', 'admin', 'superadmin'])) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $userId = $user->id;

        return response()->stream(function () use ($userId) {
            @ini_set('zlib.output_compression', '0');
            @ini_set('implicit_flush', '1');
            while (ob_get_level() > 0) {
                ob_end_flush();
            }

            echo "retry: 15000\n\n";
            @ob_flush();
            @flush();

            $lastCount = null;
            $startedAt = time();
            $ttlSeconds = 55;
            $sleepSeconds = 5;

            while (time() - $startedAt < $ttlSeconds) {
                if (connection_aborted()) {
                    break;
                }

                $count = EditorTask::query()
                    ->where(function ($q) use ($userId) {
                        $q->whereNull('assigned_to')
                            ->orWhere('assigned_to', $userId);
                    })
                    ->where('status', 'open')
                    ->count();

                if ($lastCount === null || $count !== $lastCount) {
                    $payload = json_encode(['count' => $count]);
                    echo "event: tasks\n";
                    echo "data: {$payload}\n\n";
                    $lastCount = $count;
                } else {
                    echo ": ping\n\n";
                }

                @ob_flush();
                @flush();
                sleep($sleepSeconds);
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}
