<?php

namespace App\Http\Controllers\Api\Mitra;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\MitraDashboardService;

class MitraDashboardController extends Controller
{
    protected MitraDashboardService $dashboardService;

    public function __construct(MitraDashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    /**
     * Get Mitra Dashboard Statistics & History
     */
    public function index()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $data = $this->dashboardService->getDashboardData($user);
        
        return response()->json($data);
    }
}
