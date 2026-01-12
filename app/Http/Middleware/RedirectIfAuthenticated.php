<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = $guards ?: [null];

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                // Kalau API: balikin JSON kalau user udah login tapi coba akses route guest (misal /login lagi)
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => 'Anda sudah login.',
                    ], 403);
                }

                // Kalau web: redirect ke dashboard / home
                return redirect()->route('dashboard'); // nanti kita bikin route dashboard
            }
        }

        return $next($request);
    }
}
