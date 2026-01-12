<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Kalau udah login tapi akunnya nonaktif
        if ($user && ! $user->is_active) {
            // Untuk API, balikin JSON aja
            return response()->json([
                'message' => 'Akun Anda telah dinonaktifkan. Silakan hubungi admin.',
            ], 403);
        }

        return $next($request);
    }
}
