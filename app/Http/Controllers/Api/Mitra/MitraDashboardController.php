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

        // 1. Total & Count Stats
        $totalDonations = Donation::where('user_id', $user->id)
            ->where('status', 'paid')
            ->sum('amount');

        $donationCount = Donation::where('user_id', $user->id)
            ->where('status', 'paid')
            ->count();

        $totalAllocations = Allocation::where('user_id', $user->id)->sum('amount');
        $allocationCount = Allocation::where('user_id', $user->id)->count();

        $currentBalance = $totalDonations - $totalAllocations;

        // 2a. Grafik Tren Donasi Bulanan (6 Bulan Terakhir)
        $sixMonthsAgo = now()->subMonths(5)->startOfMonth();
        $monthlyStats = Donation::where('user_id', $user->id)
            ->where('status', 'paid')
            ->where('created_at', '>=', $sixMonthsAgo)
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month_key, SUM(amount) as total_amount')
            ->groupBy('month_key')
            ->orderBy('month_key', 'asc')
            ->get()
            ->keyBy('month_key');

        $monthlyDonations = [];
        $currentMonth = $sixMonthsAgo->copy();
        for ($i = 0; $i < 6; $i++) {
            $key = $currentMonth->format('Y-m');
            $monthLabel = $currentMonth->translatedFormat('M'); // Jan, Feb, etc. based on locale
            
            $monthlyDonations[] = [
                'label' => $monthLabel,
                'amount' => (int) ($monthlyStats[$key]->total_amount ?? 0),
            ];
            $currentMonth->addMonth();
        }

        // 2b. Grafik Tren Mingguan (4 Minggu Terakhir)
        // Group by week for the last 4 weeks
        $fourWeeksAgo = now()->subWeeks(3)->startOfWeek(); // Start of the week 4 weeks ago
        $weeklyStats = Donation::where('user_id', $user->id)
            ->where('status', 'paid')
            ->where('created_at', '>=', $fourWeeksAgo)
            ->selectRaw('YEARWEEK(created_at, 1) as week_key, SUM(amount) as total_amount')
            ->groupBy('week_key')
            ->orderBy('week_key', 'asc')
            ->get()
            ->keyBy('week_key');

        $weeklyDonations = [];
        $currentWeek = $fourWeeksAgo->copy();
        for ($i = 0; $i < 4; $i++) {
            $key = $currentWeek->format('oW'); // Year + Week number (ISO-8601)
            $weekLabel = "W" . ($i + 1); // W1, W2, W3, W4 or "Mgg " . ($i+1)
            
            $weeklyDonations[] = [
                'label' => $weekLabel . " (" . $currentWeek->translatedFormat('d M') . ")",
                'amount' => (int) ($weeklyStats[$key]->total_amount ?? 0),
            ];
            $currentWeek->addWeek();
        }

        // 3. Grafik Distribusi Alokasi (Berdasarkan Program)
        $allocationDistributionRaw = Allocation::with('program')
            ->where('user_id', $user->id)
            ->selectRaw('program_id, SUM(amount) as total_amount')
            ->groupBy('program_id')
            ->orderByDesc('total_amount')
            ->take(5)
            ->get();

        $allocationDistribution = $allocationDistributionRaw->map(function ($item) {
            return [
                'name' => $item->program ? $item->program->title : 'Umum',
                'value' => (int) $item->total_amount,
            ];
        });


        // Jika kosong, beri default agar grafik tidak error (opsional, atau biarkan kosong)
        if ($allocationDistribution->isEmpty() && $totalAllocations > 0) {
             $allocationDistribution = [[
                 'name' => 'Umum',
                 'value' => (int) $totalAllocations
             ]];
        }

        // Hitung persentase jika perlu, tapi Recharts Pie bisa pakai raw value. 
        // Frontend mengharapkan value angka.

        // 4. Riwayat Terbaru
        $recentDonations = Donation::with('user')
            ->where('user_id', $user->id)
            ->latest()
            ->take(7)
            ->get()
            ->map(function ($donation) {
                return [
                    'id' => $donation->id,
                    'amount' => (int) $donation->amount,
                    'status' => $donation->status,
                    'created_at' => $donation->created_at->toIso8601String(),
                    'donatur_name' => $donation->donor_name ?: ($donation->user ? $donation->user->name : 'Hamba Allah'),
                ];
            });


        $recentAllocations = Allocation::where('user_id', $user->id)
            ->latest()
            ->take(7)
            ->get()
            ->map(function ($allocation) {
                return [
                    'id' => $allocation->id,
                    'amount' => (int) $allocation->amount,
                    'title' => $allocation->description,
                    'created_at' => $allocation->created_at->toIso8601String(),
                    'proof_path' => $allocation->proof_path,
                ];
            });

        return response()->json([
            'total_donations' => (int) $totalDonations,
            'total_allocations' => (int) $totalAllocations,
            'remaining_balance' => (int) $currentBalance,
            'donation_count' => $donationCount,
            'allocation_count' => $allocationCount,
            'monthly_donations' => $monthlyDonations,
            'weekly_donations' => $weeklyDonations,
            'allocation_distribution' => $allocationDistribution,
            'recent_donations' => $recentDonations,
            'recent_allocations' => $recentAllocations,
        ]);
    }
}
