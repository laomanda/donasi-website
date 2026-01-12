<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        // Untuk API (React), biasanya kita balikin 401 JSON,
        // jadi cukup return null kalau expect JSON.
        if ($request->expectsJson()) {
            return null;
        }

        // Untuk web (kalau nanti ada halaman login Blade)
        return route('login');
    }
}
