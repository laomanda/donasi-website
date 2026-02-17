<?php

namespace App\Http\Controllers\Api\Mitra;

use App\Http\Controllers\Controller;
use App\Models\Allocation;
use App\Models\Donation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MitraDashboardController extends Controller
{
    /**
     * Get Mitra Dashboard Statistics & History
     */
    public function index()
    {
        $user = Auth::user();

        // 1. Total Kontribusi (Lunas)
        $totalContribution = Donation::where('user_id', $user->id)
            ->where('status', 'paid')
            ->sum('amount');

        // 2. Donasi Pending
        $pendingDonationsCount = Donation::where('user_id', $user->id)
            ->where('status', 'pending')
            ->count();

        // 3. Program Didukung (Unik)
        $supportedProgramsCount = Donation::where('user_id', $user->id)
            ->where('status', 'paid')
            ->whereNotNull('program_id')
            ->distinct('program_id')
            ->count('program_id');

        // 4. Saldo Saat Ini (Total Paid - Total Allocated)
        $totalAllocated = Allocation::where('user_id', $user->id)->sum('amount');
        $currentBalance = $totalContribution - $totalAllocated;

        // 5. Riwayat Donasi Terbaru
        $recentDonations = Donation::with('program')
            ->where('user_id', $user->id)
            ->latest()
            ->take(5)
            ->get();

        // 6. Riwayat Alokasi Dana (Ledger)
        $recentAllocations = Allocation::with('program')
            ->where('user_id', $user->id)
            ->latest()
            ->take(10)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'stats' => [
                    'total_contribution' => (float) $totalContribution,
                    'current_balance'    => (float) $currentBalance,
                    'pending_count'      => $pendingDonationsCount,
                    'programs_count'     => $supportedProgramsCount,
                ],
                'recent_donations'   => $recentDonations,
                'recent_allocations' => $recentAllocations,
            ]
        ]);
    }
}
