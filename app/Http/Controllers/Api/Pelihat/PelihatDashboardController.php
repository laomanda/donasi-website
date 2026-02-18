<?php

namespace App\Http\Controllers\Api\Pelihat;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use App\Models\PickupRequest;
use App\Models\ZiswafConsultation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PelihatDashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $range = $request->query('chart_range', '1W');
        return response()->json($this->buildData($range));
    }

    protected function buildData(string $range = '1W'): array
    {
        $now   = Carbon::now();
        $today = $now->copy()->startOfDay();
        $yesterday = $now->copy()->subDay()->startOfDay();
        $yesterdayEnd = $now->copy()->subDay()->endOfDay();

        // --- Period definitions (30-day windows) ---
        $curStart  = $now->copy()->subDays(30);
        $prevStart = $now->copy()->subDays(60);
        $prevEnd   = $now->copy()->subDays(30);

        // === 1. Total Wakaf (paid donations, 30d vs prev 30d) ===
        $curTotal  = Donation::where('status', 'paid')
            ->where('paid_at', '>=', $curStart)->sum('amount');
        $prevTotal = Donation::where('status', 'paid')
            ->whereBetween('paid_at', [$prevStart, $prevEnd])->sum('amount');

        // === 2. Unique Donors (by donor_phone, 30d vs prev 30d) ===
        $curDonors  = Donation::where('status', 'paid')
            ->where('paid_at', '>=', $curStart)
            ->whereNotNull('donor_phone')
            ->distinct('donor_phone')->count('donor_phone');
        $prevDonors = Donation::where('status', 'paid')
            ->whereBetween('paid_at', [$prevStart, $prevEnd])
            ->whereNotNull('donor_phone')
            ->distinct('donor_phone')->count('donor_phone');

        // === 3. Daily Cash Flow (today vs yesterday) ===
        $todayAmount = Donation::where('status', 'paid')
            ->where('paid_at', '>=', $today)->sum('amount');
        $yesterdayAmount = Donation::where('status', 'paid')
            ->whereBetween('paid_at', [$yesterday, $yesterdayEnd])->sum('amount');

        // === 4. Success Rate (paid / total completed, 30d vs prev 30d) ===
        $curPaid   = Donation::where('status', 'paid')->where('paid_at', '>=', $curStart)->count();
        $curFailed = Donation::whereIn('status', ['failed', 'expired', 'cancelled'])
            ->where('created_at', '>=', $curStart)->count();
        $curRate   = ($curPaid + $curFailed) > 0
            ? round(($curPaid / ($curPaid + $curFailed)) * 100, 1)
            : 100;

        $prevPaid   = Donation::where('status', 'paid')
            ->whereBetween('paid_at', [$prevStart, $prevEnd])->count();
        $prevFailed = Donation::whereIn('status', ['failed', 'expired', 'cancelled'])
            ->whereBetween('created_at', [$prevStart, $prevEnd])->count();
        $prevRate   = ($prevPaid + $prevFailed) > 0
            ? round(($prevPaid / ($prevPaid + $prevFailed)) * 100, 1)
            : 100;

        // === 5. Chart Data (dynamic based on range) ===
        $chartData = $this->buildChartData($now, $range);

        // === 6. Program Distribution (top 4 programs by donation count) ===
        $distribution = Donation::where('status', 'paid')
            ->whereNotNull('program_id')
            ->select('program_id', DB::raw('COUNT(*) as value'))
            ->groupBy('program_id')
            ->orderByDesc('value')
            ->limit(4)
            ->with('program:id,title')
            ->get()
            ->map(fn ($row) => [
                'name'  => optional($row->program)->title ?? 'Lainnya',
                'value' => (int) $row->value,
            ])
            ->values()
            ->toArray();

        // === 7. Recent donations ===
        $recentDonations = Donation::with('program:id,title')
            ->orderByDesc('created_at')
            ->limit(15)
            ->get();

        // === 8. Operational counts ===
        $pickupPending   = PickupRequest::whereIn('status', ['baru', 'dijadwalkan'])->count();
        $consultationNew = ZiswafConsultation::where('status', 'baru')->count();

        return [
            'stats' => [
                'total_revenue'   => (float) $curTotal,
                'active_donors'   => (int) $curDonors,
                'today_donations' => (float) $todayAmount,
                'success_rate'    => $curRate,
            ],
            'trends' => [
                'total_revenue'   => $this->calcTrend($curTotal, $prevTotal),
                'active_donors'   => $this->calcTrend($curDonors, $prevDonors),
                'today_donations' => $this->calcTrend($todayAmount, $yesterdayAmount),
                'success_rate'    => round($curRate - $prevRate, 1),
            ],
            'chart_data'       => $chartData,
            'distribution'     => $distribution,
            'recent_donations' => $recentDonations,
            'pickup_pending'   => $pickupPending,
            'consultation_new' => $consultationNew,
        ];
    }

    private function buildChartData(Carbon $now, string $range): array
    {
        $chart = [];

        switch ($range) {
            case '1Y':
                // Last 12 months, aggregated per month
                for ($i = 11; $i >= 0; $i--) {
                    $monthStart = $now->copy()->subMonths($i)->startOfMonth();
                    $monthEnd   = $now->copy()->subMonths($i)->endOfMonth();

                    $amount = Donation::where('status', 'paid')
                        ->whereBetween('paid_at', [$monthStart, $monthEnd])
                        ->sum('amount');

                    $chart[] = [
                        'name'   => $monthStart->translatedFormat('M'),
                        'date'   => $monthStart->format('M Y'),
                        'amount' => (float) $amount,
                    ];
                }
                break;

            case '1M':
                // Last 30 days, one point per day
                for ($i = 29; $i >= 0; $i--) {
                    $day      = $now->copy()->subDays($i);
                    $dayStart = $day->copy()->startOfDay();
                    $dayEnd   = $day->copy()->endOfDay();

                    $amount = Donation::where('status', 'paid')
                        ->whereBetween('paid_at', [$dayStart, $dayEnd])
                        ->sum('amount');

                    $chart[] = [
                        'name'   => $day->format('d'),
                        'date'   => $day->translatedFormat('d M'),
                        'amount' => (float) $amount,
                    ];
                }
                break;

            case '1W':
            default:
                // Last 7 days, one point per day
                for ($i = 6; $i >= 0; $i--) {
                    $day      = $now->copy()->subDays($i);
                    $dayStart = $day->copy()->startOfDay();
                    $dayEnd   = $day->copy()->endOfDay();

                    $amount = Donation::where('status', 'paid')
                        ->whereBetween('paid_at', [$dayStart, $dayEnd])
                        ->sum('amount');

                    $chart[] = [
                        'name'   => $day->translatedFormat('D'),
                        'date'   => $day->translatedFormat('d M'),
                        'amount' => (float) $amount,
                    ];
                }
                break;
        }

        return $chart;
    }

    private function calcTrend(float $current, float $previous): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100.0 : 0.0;
        }
        return round((($current - $previous) / $previous) * 100, 1);
    }
}
