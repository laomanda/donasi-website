<?php

namespace App\Http\Controllers\Api\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Allocation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AllocationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $allocations = Allocation::with(['program:id,title,category,slug'])
            ->orderByDesc('allocated_at')
            ->latest('id')
            ->get(['id', 'program_id', 'amount', 'description', 'allocated_at', 'created_at']);

        return response()->json([
            'success' => true,
            'data' => $allocations,
        ]);
    }
}
