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
    protected PublicFinanceReadService $financeService;
    protected PublicFinanceCacheService $cacheService;

    public function __construct(
        ?PublicFinanceReadService $financeService = null,
        ?PublicFinanceCacheService $cacheService = null
    ) {
        $this->financeService = $financeService ?? app(PublicFinanceReadService::class);
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

            // 1. Authoritative Public Finance Metrics from PublicFinanceReadService
            $financeSummary = $this->financeService->getPublicSummary($filterYear);
            $fin = $financeSummary['summary'];

            $targetYearForMonthly = $filterYear ?? (int) date('Y');
            $monthlyRealization = $this->financeService->getMonthlyRealization($targetYearForMonthly);

            // If posted journal expenses are 0, integrate operational website data (Donations & Allocations)
            // using the standard 7% operational/amil cost basis
            $hasJournalExpenses = ((float) $fin['total_expense']) > 0;

            if (!$hasJournalExpenses) {
                // Fetch monthly donations and allocations from website operational tables
                $donationsMonthlyQuery = Donation::paid()
                    ->selectRaw("DATE_FORMAT(COALESCE(paid_at, created_at), '%Y-%m') as m_key, SUM(amount) as total");
                $allocationsMonthlyQuery = Allocation::query()
                    ->selectRaw("DATE_FORMAT(COALESCE(allocated_at, created_at), '%Y-%m') as m_key, SUM(amount) as total");

                if ($isYearFiltered) {
                    $donationsMonthlyQuery->whereRaw('YEAR(COALESCE(paid_at, created_at)) = ?', [$filterYear]);
                    $allocationsMonthlyQuery->whereRaw('YEAR(COALESCE(allocated_at, created_at)) = ?', [$filterYear]);
                }

                $monthlyDonationsMap = $donationsMonthlyQuery->groupBy('m_key')->pluck('total', 'm_key')->all();
                $monthlyAllocationsMap = $allocationsMonthlyQuery->groupBy('m_key')->pluck('total', 'm_key')->all();

                $computedMonthlyTotalExpense = 0.0;
                foreach ($monthlyRealization as &$mReal) {
                    $mKey = $mReal['month_key'];
                    $opColl = (float) ($monthlyDonationsMap[$mKey] ?? 0.0);
                    $opAlloc = (float) ($monthlyAllocationsMap[$mKey] ?? 0.0);

                    $effectiveColl = max((float) $mReal['collected'], $opColl);
                    $effectiveAlloc = max((float) $mReal['distributed'], $opAlloc);
                    $basis = max($effectiveColl, $effectiveAlloc);
                    $opExpense = $basis > 0 ? round($basis * 0.07, 2) : 0.0;

                    if ($opExpense > 0) {
                        $mReal['expense'] = $opExpense;
                        $mReal['total_expense'] = $opExpense;
                        $mReal['operational_expense'] = $opExpense;
                        $computedMonthlyTotalExpense += $opExpense;

                        if ($effectiveAlloc > 0) {
                            $mReal['rowa'] = round($effectiveAlloc / $opExpense, 2);
                            $mReal['rowa_status'] = 'available';
                        }

                        $effectiveWaqf = max((float) $mReal['waqf_collected'], (float) $mReal['total_waqf_collected'], $opColl);
                        if ($effectiveWaqf > 0) {
                            $mReal['ywdp_ratio'] = round(($effectiveWaqf / $opExpense) * 100.0, 2);
                            $mReal['ywdp_ratio_status'] = 'available';
                        }
                    }
                }
                unset($mReal);

                if ($isYearFiltered) {
                    if ($computedMonthlyTotalExpense > 0) {
                        $fin['total_expense'] = round($computedMonthlyTotalExpense, 2);
                        $fin['operational_expense'] = round($computedMonthlyTotalExpense, 2);
                    }
                } else {
                    // For all-time, calculate total operational activity across all years
                    $allTimeOpRows = DB::select("
                        SELECT m, SUM(c) as c, SUM(a) as a FROM (
                            SELECT DATE_FORMAT(COALESCE(paid_at, created_at), '%Y-%m') as m, amount as c, 0 as a FROM donations WHERE status = 'paid'
                            UNION ALL
                            SELECT DATE_FORMAT(COALESCE(allocated_at, created_at), '%Y-%m') as m, 0 as c, amount as a FROM allocations
                        ) raw_m GROUP BY m
                    ");

                    $allTimeOpExpense = 0.0;
                    foreach ($allTimeOpRows as $row) {
                        $b = max((float) $row->c, (float) $row->a);
                        if ($b > 0) {
                            $allTimeOpExpense += round($b * 0.07, 2);
                        }
                    }

                    if ($allTimeOpExpense > 0) {
                        $fin['total_expense'] = round($allTimeOpExpense, 2);
                        $fin['operational_expense'] = round($allTimeOpExpense, 2);
                    }
                }
            }

            // Calculate operational RoWA multiplier when RoWA is not yet determined by accounting asset base
            $opRowa = null;
            if ((float) $fin['total_expense'] > 0) {
                $effectiveDistributed = (float) $fin['total_distributed'];
                if ($effectiveDistributed <= 0) {
                    $effectiveDistributed = (float) Allocation::query()
                        ->when($isYearFiltered, fn($q) => $q->whereRaw('YEAR(COALESCE(allocated_at, created_at)) = ?', [$filterYear]))
                        ->sum('amount');
                }
                if ($effectiveDistributed > 0) {
                    $opRowa = round($effectiveDistributed / (float) $fin['total_expense'], 2);
                }
            }

            // Calculate overall YWDP Ratio when not yet provided
            if ($fin['ywdp_ratio'] === null && (float) $fin['total_expense'] > 0) {
                $effectiveWaqf = (float) $fin['total_waqf_collected'];
                if ($effectiveWaqf <= 0) {
                    $effectiveWaqf = (float) Donation::paid()
                        ->when($isYearFiltered, fn($q) => $q->whereRaw('YEAR(COALESCE(paid_at, created_at)) = ?', [$filterYear]))
                        ->sum('amount');
                }
                if ($effectiveWaqf > 0) {
                    $fin['ywdp_ratio'] = round(($effectiveWaqf / (float) $fin['total_expense']) * 100.0, 2);
                    $fin['ywdp_ratio_status'] = 'available';
                }
            }

            // Backward-compatible Monthly Trend representation
            $monthlyTrends = [];
            foreach ($monthlyRealization as $mReal) {
                $dt = Carbon::createFromFormat('Y-m', $mReal['month_key'])->startOfMonth();
                $monthlyTrends[] = [
                    'month_key'           => $mReal['month_key'],
                    'label'               => $dt->translatedFormat('M Y'),
                    'month_name'          => $dt->translatedFormat('F'),
                    'collected'           => $mReal['collected'],
                    'allocated'           => $mReal['distributed'],
                    'nazhir_expense'      => $mReal['nazhir_expense'],
                    'operational_expense' => $mReal['operational_expense'],
                    'total_expense'       => $mReal['total_expense'],
                    'expense'             => $mReal['expense'],
                    'ywdp_ratio'          => $mReal['ywdp_ratio'],
                    'ywdp_ratio_status'   => $mReal['ywdp_ratio_status'],
                    'waqf_collected'      => $mReal['waqf_collected'],
                    'total_waqf_collected'=> $mReal['total_waqf_collected'],
                    'rowa'                => $mReal['rowa'],
                    'rowa_status'         => $mReal['rowa_status'] ?? null,
                ];
            }

            // Month-over-Month (MoM) Growth percentage from verified monthly realization
            $collectedMoM = null;
            $allocatedMoM = null;

            $currentMonth = (int) date('n');
            $targetMonth = ($isYearFiltered && $filterYear !== (int) date('Y')) ? 12 : $currentMonth;

            if ($targetMonth >= 2 && isset($monthlyRealization[$targetMonth - 1], $monthlyRealization[$targetMonth - 2])) {
                $currCollected = (float) $monthlyRealization[$targetMonth - 1]['collected'];
                $prevCollected = (float) $monthlyRealization[$targetMonth - 2]['collected'];
                if ($prevCollected > 0) {
                    $collectedMoM = round((($currCollected - $prevCollected) / $prevCollected) * 100, 1);
                } elseif ($currCollected > 0) {
                    $collectedMoM = 100.0;
                }

                $currAlloc = (float) $monthlyRealization[$targetMonth - 1]['distributed'];
                $prevAlloc = (float) $monthlyRealization[$targetMonth - 2]['distributed'];
                if ($prevAlloc > 0) {
                    $allocatedMoM = round((($currAlloc - $prevAlloc) / $prevAlloc) * 100, 1);
                } elseif ($currAlloc > 0) {
                    $allocatedMoM = 100.0;
                }
            }

            // 2. Operational Program Narratives and Allocation Breakdown
            $allocAggQuery = Allocation::query()->select('program_id', DB::raw('SUM(amount) as total_allocated'), DB::raw('COUNT(id) as allocation_count'));
            if ($isYearFiltered) {
                $allocAggQuery->whereRaw('YEAR(COALESCE(allocated_at, created_at)) = ?', [$filterYear], 'and');
            }
            $allocAggregates = $allocAggQuery->groupBy('program_id')
                ->get()
                ->keyBy('program_id');

            $donationAggQuery = Donation::paid()
                ->select('program_id', DB::raw('SUM(amount) as total_collected'));
            if ($isYearFiltered) {
                $donationAggQuery->whereRaw('YEAR(COALESCE(paid_at, created_at)) = ?', [$filterYear], 'and');
            }
            $donationAggregates = $donationAggQuery->groupBy('program_id')
                ->get()
                ->keyBy('program_id');

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
                        'thumbnail_path'   => $prog->thumbnail_path,
                    ];
                }
            }

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
                    'id'               => null,
                    'title'            => 'Dana Umum / Wakaf Terbuka',
                    'title_en'         => 'General Waqf Fund',
                    'category'         => 'Umum',
                    'category_en'      => 'General',
                    'collected_amount' => $generalCollected,
                    'allocated_amount' => $generalAllocSum,
                    'target_amount'    => 0,
                    'allocation_count' => $generalAllocCount,
                    'slug'             => null,
                    'thumbnail_path'   => null,
                ];
            }

            usort($programAllocations, function ($a, $b) {
                if ($b['allocated_amount'] !== $a['allocated_amount']) {
                    return $b['allocated_amount'] <=> $a['allocated_amount'];
                }

                return $b['collected_amount'] <=> $a['collected_amount'];
            });

            // 3. Operational Filter Metadata
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
                    'total_collected'             => $fin['total_collected'],
                    'total_waqf_collected'        => $fin['total_waqf_collected'],
                    'total_distributed'           => $fin['total_distributed'],
                    'total_expense'               => $fin['total_expense'],
                    'nazhir_expense'              => $fin['nazhir_expense'],
                    'operational_expense'         => $fin['operational_expense'],
                    'available_balance'           => $fin['available_balance'],
                    'available_balance_status'    => $fin['available_balance_status'],
                    'ywdp_ratio'                  => $fin['ywdp_ratio'],
                    'ywdp_ratio_status'           => $fin['ywdp_ratio_status'],
                    'rowa'                        => $fin['rowa'],
                    'rowa_status'                 => $fin['rowa_status'],
                    'productive_asset_book_value' => $fin['productive_asset_book_value'],
                    'verified_donations'          => $fin['verified_donations'],
                    'program_distributions'       => $fin['program_distributions'],
                    'monthly_realization'         => $monthlyRealization,
                ],
                'stats' => [
                    'total_programs'           => Program::active()->count(),
                    'total_donations'          => $fin['verified_donations'],
                    'verified_donations'       => $fin['verified_donations'],
                    'amount_collected'         => $fin['total_collected'],
                    'total_collected'          => $fin['total_collected'],
                    'total_waqf_collected'     => $fin['total_waqf_collected'],
                    'total_allocations'        => $fin['program_distributions'],
                    'program_distributions'    => $fin['program_distributions'],
                    'amount_allocated'         => $fin['total_distributed'],
                    'total_distributed'        => $fin['total_distributed'],
                    'nazhir_expense'           => $fin['nazhir_expense'],
                    'operational_expense'      => $fin['operational_expense'],
                    'total_expense'            => $fin['total_expense'],
                    'ywdp_ratio'               => $fin['ywdp_ratio'],
                    'ywdp_ratio_status'        => $fin['ywdp_ratio_status'],
                    'average_rowa'             => $opRowa ?? $fin['rowa'],
                    'rowa'                     => $opRowa ?? $fin['rowa'],
                    'rowa_status'              => $fin['rowa_status'],
                    'available_balance'        => $fin['available_balance'],
                    'available_balance_status' => $fin['available_balance_status'],
                    'collected_mom'            => $collectedMoM,
                    'allocated_mom'            => $allocatedMoM,
                    'program_allocations'      => $programAllocations,
                    'monthly_trends'           => $monthlyTrends,
                    'monthly_realization'      => $monthlyRealization,
                ],
            ];
        });

        return response()->json($data);
    }
}

