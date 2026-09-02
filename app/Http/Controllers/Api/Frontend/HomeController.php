<?php

namespace App\Http\Controllers\Api\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Allocation;
use App\Models\Article;
use App\Models\Donation;
use App\Models\Partner;
use App\Models\Program;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        return $this->index($request);
    }

    public function index(?Request $request = null): JsonResponse
    {
        $req = $request ?: request();
        $yearParam = $req ? $req->query('year') : null;
        $isYearFiltered = !empty($yearParam) && $yearParam !== 'all';
        $filterYear = $isYearFiltered ? (int) $yearParam : null;

        $cacheKey = $isYearFiltered ? "frontend.home.year_{$filterYear}" : 'frontend.home';

        $data = Cache::remember($cacheKey, 120, function () use ($isYearFiltered, $filterYear) {
            $highlights = Program::highlight()
                ->orderByDesc(DB::raw('COALESCE(published_at, created_at)'))
                ->limit(6)
                ->get();

            if ($highlights->isEmpty()) {
                $highlights = Program::active()
                    ->orderByDesc(DB::raw('COALESCE(published_at, created_at)'))
                    ->limit(6)
                    ->get();
            }

            $articles = Article::published()->limit(3)->get();

            if ($articles->isEmpty()) {
                $articles = Article::query()->latest('created_at')->limit(3)->get();
            }

            $partners = Partner::active()->limit(12)->get();

            // Total Collection & Allocation
            $donationsQuery = Donation::paid();
            $allocationsQuery = Allocation::query();

            if ($isYearFiltered) {
                $donationsQuery->whereRaw('YEAR(COALESCE(paid_at, created_at)) = ?', [$filterYear], 'and');
                $allocationsQuery->whereRaw('YEAR(COALESCE(allocated_at, created_at)) = ?', [$filterYear], 'and');
            }

            $totalCollected = (float) $donationsQuery->sum('amount');
            $totalAllocated = (float) $allocationsQuery->sum('amount');
            $totalDonationsCount = $donationsQuery->count();
            $totalAllocationsCount = $allocationsQuery->count();

            // Single query aggregate for all program allocations
            $allocAggQuery = Allocation::query()->select('program_id', DB::raw('SUM(amount) as total_allocated'), DB::raw('COUNT(id) as allocation_count'));
            if ($isYearFiltered) {
                $allocAggQuery->whereRaw('YEAR(COALESCE(allocated_at, created_at)) = ?', [$filterYear], 'and');
            }
            $allocAggregates = $allocAggQuery->groupBy('program_id')
                ->get()
                ->keyBy('program_id');

            // Program donation aggregates for year
            $donationAggQuery = Donation::paid()
                ->select('program_id', DB::raw('SUM(amount) as total_collected'));
            if ($isYearFiltered) {
                $donationAggQuery->whereRaw('YEAR(COALESCE(paid_at, created_at)) = ?', [$filterYear], 'and');
            }
            $donationAggregates = $donationAggQuery->groupBy('program_id')
                ->get()
                ->keyBy('program_id');

            // Program Allocations Breakdown
            $programAllocations = [];
            $allPrograms = Program::all();

            foreach ($allPrograms as $prog) {
                $agg = $allocAggregates->get($prog->id);
                $progAllocSum = $agg ? (float) $agg->total_allocated : 0;
                $progAllocCount = $agg ? (int) $agg->allocation_count : 0;

                $dAgg = $donationAggregates->get($prog->id);
                $progCollected = $isYearFiltered
                    ? ($dAgg ? (float) $dAgg->total_collected : 0)
                    : (float) $prog->collected_amount;
                $progTarget = (float) $prog->target_amount;

                // Include program if it has collected funds or allocations
                if ($progCollected > 0 || $progAllocSum > 0) {
                    $programAllocations[] = [
                        'id' => $prog->id,
                        'title' => $prog->title,
                        'title_en' => $prog->title_en,
                        'category' => $prog->category ?: 'Umum',
                        'category_en' => $prog->category_en ?: 'General',
                        'collected_amount' => $progCollected,
                        'allocated_amount' => $progAllocSum,
                        'target_amount' => $progTarget,
                        'allocation_count' => $progAllocCount,
                        'slug' => $prog->slug,
                        'thumbnail_path' => $prog->thumbnail_path,
                    ];
                }
            }

            // General / Unallocated Program Fund
            $generalAgg = $allocAggregates->get(null);
            $generalAllocSum = $generalAgg ? (float) $generalAgg->total_allocated : 0;
            $generalAllocCount = $generalAgg ? (int) $generalAgg->allocation_count : 0;

            $genDonationQuery = Donation::query()->whereNull('program_id')->where('status', 'paid');
            if ($isYearFiltered) {
                $genDonationQuery->whereRaw('YEAR(COALESCE(paid_at, created_at)) = ?', [$filterYear]);
            }
            $generalCollected = (float) $genDonationQuery->sum('amount');

            if ($generalAllocSum > 0 || $generalCollected > 0) {
                $programAllocations[] = [
                    'id' => null,
                    'title' => 'Dana Umum / Wakaf Terbuka',
                    'title_en' => 'General Waqf Fund',
                    'category' => 'Umum',
                    'category_en' => 'General',
                    'collected_amount' => $generalCollected,
                    'allocated_amount' => $generalAllocSum,
                    'target_amount' => 0,
                    'allocation_count' => $generalAllocCount,
                    'slug' => null,
                    'thumbnail_path' => null,
                ];
            }

            // Sort program allocations: highest allocated first, then highest collected
            usort($programAllocations, function ($a, $b) {
                if ($b['allocated_amount'] !== $a['allocated_amount']) {
                    return $b['allocated_amount'] <=> $a['allocated_amount'];
                }

                return $b['collected_amount'] <=> $a['collected_amount'];
            });

            // Monthly Trend (Penghimpunan vs Penyaluran)
            $monthlyTrends = [];
            if ($isYearFiltered) {
                $now = Carbon::now();
                $isCurrentYear = $filterYear === (int) $now->format('Y');
                $maxMonth = $isCurrentYear ? (int) $now->format('n') : 12;

                for ($m = 1; $m <= $maxMonth; $m++) {
                    $date = Carbon::createFromDate($filterYear, $m, 1);
                    $startDate = $date->copy()->startOfMonth()->toDateTimeString();
                    $endDate = $date->copy()->endOfMonth()->toDateTimeString();

                    $collected = (float) Donation::where('status', 'paid')
                        ->whereBetween(DB::raw('COALESCE(paid_at, created_at)'), [$startDate, $endDate])
                        ->sum('amount');

                    $allocated = (float) Allocation::whereBetween(DB::raw('COALESCE(allocated_at, created_at)'), [$startDate, $endDate])
                        ->sum('amount');

                    $monthlyTrends[] = [
                        'month_key' => $date->format('Y-m'),
                        'label' => $date->translatedFormat('M Y'),
                        'month_name' => $date->translatedFormat('F'),
                        'collected' => $collected,
                        'allocated' => $allocated,
                    ];
                }
            } else {
                $now = Carbon::now();
                for ($i = 5; $i >= 0; $i--) {
                    $date = $now->copy()->firstOfMonth()->subMonths($i);
                    $startDate = $date->copy()->startOfMonth()->toDateTimeString();
                    $endDate = $date->copy()->endOfMonth()->toDateTimeString();

                    $collected = (float) Donation::where('status', 'paid')
                        ->whereBetween(DB::raw('COALESCE(paid_at, created_at)'), [$startDate, $endDate])
                        ->sum('amount');

                    $allocated = (float) Allocation::whereBetween(DB::raw('COALESCE(allocated_at, created_at)'), [$startDate, $endDate])
                        ->sum('amount');

                    $monthlyTrends[] = [
                        'month_key' => $date->format('Y-m'),
                        'label' => $date->translatedFormat('M Y'),
                        'month_name' => $date->translatedFormat('F'),
                        'collected' => $collected,
                        'allocated' => $allocated,
                    ];
                }
            }

            // Calculate MoM (Month-over-Month) Growth Percentage
            $donMoMQuery = Donation::where('status', 'paid');
            if ($isYearFiltered) {
                $donMoMQuery->whereRaw('YEAR(COALESCE(paid_at, created_at)) = ?', [$filterYear]);
            }
            $lastTwoDonationMonths = $donMoMQuery
                ->selectRaw('DATE_FORMAT(COALESCE(paid_at, created_at), "%Y-%m") as m, sum(amount) as total')
                ->groupBy('m')
                ->orderByDesc('m')
                ->limit(2)
                ->get();

            $collectedMoM = null;
            if ($lastTwoDonationMonths->count() >= 2) {
                $latest = (float) $lastTwoDonationMonths[0]->total;
                $previous = (float) $lastTwoDonationMonths[1]->total;
                $collectedMoM = $previous > 0 ? round((($latest - $previous) / $previous) * 100, 1) : 100.0;
            } elseif ($lastTwoDonationMonths->count() === 1) {
                $collectedMoM = 100.0;
            }

            $allocMoMQuery = Allocation::query();
            if ($isYearFiltered) {
                $allocMoMQuery->whereRaw('YEAR(COALESCE(allocated_at, created_at)) = ?', [$filterYear]);
            }
            $lastTwoAllocMonths = $allocMoMQuery
                ->selectRaw('DATE_FORMAT(COALESCE(allocated_at, created_at), "%Y-%m") as m, sum(amount) as total')
                ->groupBy('m')
                ->orderByDesc('m')
                ->limit(2)
                ->get();

            $allocatedMoM = null;
            if ($lastTwoAllocMonths->count() >= 2) {
                $latestA = (float) $lastTwoAllocMonths[0]->total;
                $previousA = (float) $lastTwoAllocMonths[1]->total;
                $allocatedMoM = $previousA > 0 ? round((($latestA - $previousA) / $previousA) * 100, 1) : 100.0;
            } elseif ($lastTwoAllocMonths->count() === 1) {
                $allocatedMoM = 100.0;
            }

            // Available years for dropdown
            $currentYear = (int) date('Y');
            $startYear = 2020;
            $latestDonationYear = Donation::paid()->selectRaw('MAX(YEAR(COALESCE(paid_at, created_at))) as max_y')->value('max_y');
            $latestAllocYear = Allocation::query()->selectRaw('MAX(YEAR(COALESCE(allocated_at, created_at))) as max_y')->value('max_y');
            $maxYearInData = max($currentYear, (int) $latestDonationYear, (int) $latestAllocYear, 2026);

            $availableYears = [];
            for ($y = $maxYearInData; $y >= $startYear; $y--) {
                $availableYears[] = $y;
            }

            return [
                'highlights' => $highlights,
                'latest_articles' => $articles,
                'partners' => $partners,
                'selected_year' => $isYearFiltered ? (string) $filterYear : 'all',
                'available_years' => $availableYears,
                'stats' => [
                    'total_programs' => Program::active()->count(),
                    'total_donations' => $totalDonationsCount,
                    'amount_collected' => $totalCollected,
                    'total_allocations' => $totalAllocationsCount,
                    'amount_allocated' => $totalAllocated,
                    'collected_mom' => $collectedMoM,
                    'allocated_mom' => $allocatedMoM,
                    'program_allocations' => $programAllocations,
                    'monthly_trends' => $monthlyTrends,
                ],
            ];
        });

        return response()->json($data);
    }
}
