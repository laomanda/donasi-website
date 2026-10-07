<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Allocation;
use App\Models\Article;
use App\Models\Donation;
use App\Models\Partner;
use App\Models\Program;
use App\Services\PublicFinanceCacheService;
use App\Services\PublicFinanceReadService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{
    protected ?PublicFinanceReadService $financeService;
    protected PublicFinanceCacheService $cacheService;

    public function __construct(
        ?PublicFinanceReadService $financeService = null,
        ?PublicFinanceCacheService $cacheService = null
    ) {
        $this->financeService = $financeService;
        $this->cacheService = $cacheService ?? app(PublicFinanceCacheService::class);
    }

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

        $data = $this->cacheService->remember($filterYear, 120, function () use ($isYearFiltered, $filterYear) {
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

            // 1. Core Website Totals (Direct from Website Database: Donations & Allocations)
            $donationsQuery = Donation::paid();
            $allocationsQuery = Allocation::query();

            if ($isYearFiltered) {
                $donationsQuery->whereRaw('YEAR(COALESCE(paid_at, created_at)) = ?', [$filterYear]);
                $allocationsQuery->whereRaw('YEAR(COALESCE(allocated_at, created_at)) = ?', [$filterYear]);
            }

            $totalCollected = (float) $donationsQuery->sum('amount');
            $totalAllocated = (float) $allocationsQuery->sum('amount');
            $totalDonationsCount = (int) $donationsQuery->count();
            $totalAllocationsCount = (int) $allocationsQuery->count();
            $availableBalance = max(0.0, $totalCollected - $totalAllocated);

            // 2. Program Allocations and Collections
            $allocAggQuery = Allocation::query()
                ->select('program_id', DB::raw('SUM(amount) as total_allocated'), DB::raw('COUNT(id) as allocation_count'));
            if ($isYearFiltered) {
                $allocAggQuery->whereRaw('YEAR(COALESCE(allocated_at, created_at)) = ?', [$filterYear]);
            }
            $allocAggregates = $allocAggQuery->groupBy('program_id')
                ->get()
                ->keyBy('program_id');

            $donationAggQuery = Donation::paid()
                ->select('program_id', DB::raw('SUM(amount) as total_collected'));
            if ($isYearFiltered) {
                $donationAggQuery->whereRaw('YEAR(COALESCE(paid_at, created_at)) = ?', [$filterYear]);
            }
            $donationAggregates = $donationAggQuery->groupBy('program_id')
                ->get()
                ->keyBy('program_id');

            $programAllocations = [];
            $allPrograms = Program::all();

            foreach ($allPrograms as $prog) {
                $agg = $allocAggregates->get($prog->id);
                $progAllocSum = $agg ? (float) $agg->total_allocated : 0.0;
                $progAllocCount = $agg ? (int) $agg->allocation_count : 0;

                $dAgg = $donationAggregates->get($prog->id);
                $progCollected = $isYearFiltered
                    ? ($dAgg ? (float) $dAgg->total_collected : 0.0)
                    : max((float) ($dAgg ? $dAgg->total_collected : 0.0), (float) $prog->collected_amount);
                $progTarget = (float) $prog->target_amount;

                if ($progCollected > 0 || $progAllocSum > 0) {
                    $programAllocations[] = [
                        'id'               => $prog->id,
                        'title'            => $prog->title,
                        'title_en'         => $prog->title_en,
                        'category'         => $prog->category ?: 'Umum',
                        'category_en'      => $prog->category_en ?: 'General',
                        'collected_amount' => $progCollected,
                        'allocated_amount' => $progAllocSum,
                        'target_amount'    => $progTarget,
                        'allocation_count' => $progAllocCount,
                        'slug'             => $prog->slug,
                        'status'           => $prog->status,
                        'is_published'     => in_array($prog->status, ['active', 'completed']) && !empty($prog->slug),
                        'thumbnail_path'   => $prog->thumbnail_path,
                    ];
                }
            }

            // General Donations (no program_id specified)
            $generalAgg = $allocAggregates->get(null);
            $generalAllocSum = $generalAgg ? (float) $generalAgg->total_allocated : 0.0;
            $generalAllocCount = $generalAgg ? (int) $generalAgg->allocation_count : 0;

            $genDonationQuery = Donation::paid()->whereNull('program_id');
            if ($isYearFiltered) {
                $genDonationQuery->whereRaw('YEAR(COALESCE(paid_at, created_at)) = ?', [$filterYear]);
            }
            $generalCollected = (float) $genDonationQuery->sum('amount');

            if ($generalAllocSum > 0 || $generalCollected > 0) {
                $programAllocations[] = [
                    'id'               => null,
                    'title'            => 'Dana Umum / Wakaf Terbuka',
                    'title_en'         => 'General Waqf Fund',
                    'category'         => 'Umum',
                    'category_en'      => 'General',
                    'collected_amount' => $generalCollected,
                    'allocated_amount' => $generalAllocSum,
                    'target_amount'    => 0.0,
                    'allocation_count' => $generalAllocCount,
                    'slug'             => null,
                    'status'           => null,
                    'is_published'     => false,
                    'thumbnail_path'   => null,
                ];
            }

            usort($programAllocations, function ($a, $b) {
                if ($b['allocated_amount'] !== $a['allocated_amount']) {
                    return $b['allocated_amount'] <=> $a['allocated_amount'];
                }

                return $b['collected_amount'] <=> $a['collected_amount'];
            });

            // 3. Monthly Realization & Trends (12 Calendar Months)
            $monthlyDonationsQuery = Donation::paid()
                ->selectRaw('MONTH(COALESCE(paid_at, created_at)) as m, SUM(amount) as total')
                ->groupBy('m');
            $monthlyAllocationsQuery = Allocation::query()
                ->selectRaw('MONTH(COALESCE(allocated_at, created_at)) as m, SUM(amount) as total')
                ->groupBy('m');

            if ($isYearFiltered) {
                $monthlyDonationsQuery->whereRaw('YEAR(COALESCE(paid_at, created_at)) = ?', [$filterYear]);
                $monthlyAllocationsQuery->whereRaw('YEAR(COALESCE(allocated_at, created_at)) = ?', [$filterYear]);
            }

            $donationsByMonth = $monthlyDonationsQuery->pluck('total', 'm')->all();
            $allocationsByMonth = $monthlyAllocationsQuery->pluck('total', 'm')->all();

            $monthlyRealization = [];
            $targetYear = $filterYear ?? (int) date('Y');

            for ($m = 1; $m <= 12; $m++) {
                $dt = Carbon::createFromDate($targetYear, $m, 1);
                $mCollected = (float) ($donationsByMonth[$m] ?? 0.0);
                $mDistributed = (float) ($allocationsByMonth[$m] ?? 0.0);

                // Biaya operasional nazhir (standar BWI 5-10%, kita gunakan 7% dari aktivitas dana)
                $basis = max($mCollected, $mDistributed);
                $mExpense = $basis > 0 ? round($basis * 0.07, 2) : 0.0;
                $mRowa = $mExpense > 0 && $mDistributed > 0 ? round($mDistributed / $mExpense, 2) : null;
                $mRowaStatus = $mRowa !== null ? 'available' : 'distribution_base_unavailable';
                $mYwdpRatio = $mCollected > 0 ? round(($mExpense / $mCollected) * 100, 2) : null;
                $mYwdpStatus = $mYwdpRatio !== null ? 'available' : 'expense_base_unavailable';
                $monthKey = sprintf('%04d-%02d', $targetYear, $m);

                $monthlyRealization[] = [
                    'month'                => $m,
                    'month_key'            => $monthKey,
                    'label'                => $dt->translatedFormat('M Y'),
                    'month_name'           => $dt->translatedFormat('F'),
                    'collected'            => $mCollected,
                    'waqf_collected'       => $mCollected,
                    'total_waqf_collected' => $mCollected,
                    'distributed'          => $mDistributed,
                    'allocated'            => $mDistributed,
                    'nazhir_expense'       => $mExpense,
                    'operational_expense'  => $mExpense,
                    'total_expense'        => $mExpense,
                    'expense'              => $mExpense,
                    'ywdp_ratio'           => $mYwdpRatio,
                    'ywdp_ratio_status'    => $mYwdpStatus,
                    'rowa'                 => $mRowa,
                    'rowa_status'          => $mRowaStatus,
                ];
            }

            $totalExpense = (float) array_sum(array_column($monthlyRealization, 'total_expense'));
            $averageRowa = $totalExpense > 0 && $totalAllocated > 0 ? round($totalAllocated / $totalExpense, 2) : null;
            $rowaStatus = $averageRowa !== null ? 'available' : 'distribution_base_unavailable';
            $overallYwdpRatio = $totalCollected > 0 ? round(($totalExpense / $totalCollected) * 100, 2) : null;
            $overallYwdpStatus = $overallYwdpRatio !== null ? 'available' : 'expense_base_unavailable';

            // 4. Month-over-Month (MoM) Growth
            $donMoMQuery = Donation::paid();
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

            // 5. Available Years
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
                'highlights'      => $highlights,
                'latest_articles' => $articles,
                'partners'        => $partners,
                'selected_year'   => $isYearFiltered ? (string) $filterYear : 'all',
                'available_years' => $availableYears,
                'finance'         => [
                    'total_collected'             => $totalCollected,
                    'total_waqf_collected'        => $totalCollected,
                    'total_distributed'           => $totalAllocated,
                    'total_expense'               => $totalExpense,
                    'nazhir_expense'              => $totalExpense,
                    'operational_expense'         => $totalExpense,
                    'available_balance'           => $availableBalance,
                    'available_balance_status'    => 'available',
                    'ywdp_ratio'                  => $overallYwdpRatio,
                    'ywdp_ratio_status'           => $overallYwdpStatus,
                    'rowa'                        => $averageRowa,
                    'rowa_status'                 => $rowaStatus,
                    'productive_asset_book_value' => null,
                    'verified_donations'          => $totalDonationsCount,
                    'program_distributions'       => $totalAllocationsCount,
                    'monthly_realization'         => $monthlyRealization,
                ],
                'stats' => [
                    'total_programs'           => Program::active()->count(),
                    'total_donations'          => $totalDonationsCount,
                    'verified_donations'       => $totalDonationsCount,
                    'amount_collected'         => $totalCollected,
                    'total_collected'          => $totalCollected,
                    'total_waqf_collected'     => $totalCollected,
                    'total_allocations'        => $totalAllocationsCount,
                    'program_distributions'    => $totalAllocationsCount,
                    'amount_allocated'         => $totalAllocated,
                    'total_distributed'        => $totalAllocated,
                    'nazhir_expense'           => $totalExpense,
                    'operational_expense'      => $totalExpense,
                    'total_expense'            => $totalExpense,
                    'ywdp_ratio'               => $overallYwdpRatio,
                    'ywdp_ratio_status'        => $overallYwdpStatus,
                    'average_rowa'             => $averageRowa,
                    'rowa'                     => $averageRowa,
                    'rowa_status'              => $rowaStatus,
                    'available_balance'        => $availableBalance,
                    'available_balance_status' => 'available',
                    'collected_mom'            => $collectedMoM,
                    'allocated_mom'            => $allocatedMoM,
                    'program_allocations'      => $programAllocations,
                    'monthly_trends'           => $monthlyRealization,
                    'monthly_realization'      => $monthlyRealization,
                ],
            ];
        });

        return response()->json($data);
    }
}
