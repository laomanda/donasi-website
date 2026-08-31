<?php

namespace App\Http\Controllers\Api\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Allocation;
use App\Models\Article;
use App\Models\Donation;
use App\Models\Partner;
use App\Models\Program;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{
    public function __invoke(Request $request)
    {
        $data = Cache::remember('frontend.home', 120, function () {
            $highlights = Program::highlight()
                ->orderByDesc(DB::raw('COALESCE(published_at, created_at)'))
                ->limit(6)
                ->get();

            if ($highlights->isEmpty()) {
                $highlights = Program::where('status', 'active')
                    ->orderByDesc(DB::raw('COALESCE(published_at, created_at)'))
                    ->limit(6)
                    ->get();
            }

            $articles = Article::published()->limit(3)->get();

            if ($articles->isEmpty()) {
                $articles = Article::latest('created_at')->limit(3)->get();
            }

            $partners = Partner::active()->limit(12)->get();

            // Total Collection & Allocation
            $totalCollected = (float) Donation::where('status', 'paid')->sum('amount');
            $totalAllocated = (float) Allocation::sum('amount');
            $totalDonationsCount = Donation::where('status', 'paid')->count();
            $totalAllocationsCount = Allocation::count();

            // Single query aggregate for all program allocations (Scalable for thousands of programs)
            $allocAggregates = Allocation::select('program_id', DB::raw('SUM(amount) as total_allocated'), DB::raw('COUNT(id) as allocation_count'))
                ->groupBy('program_id')
                ->get()
                ->keyBy('program_id');

            // Program Allocations Breakdown
            $programAllocations = [];
            $allPrograms = Program::all();
            
            foreach ($allPrograms as $prog) {
                $agg = $allocAggregates->get($prog->id);
                $progAllocSum = $agg ? (float) $agg->total_allocated : 0;
                $progAllocCount = $agg ? (int) $agg->allocation_count : 0;
                $progCollected = (float) $prog->collected_amount;
                $progTarget = (float) $prog->target_amount;
                
                // Include program if it has collected funds or allocations
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

            // General / Unallocated Program Fund
            $generalAgg = $allocAggregates->get(null);
            $generalAllocSum = $generalAgg ? (float) $generalAgg->total_allocated : (float) Allocation::whereNull('program_id')->sum('amount');
            $generalAllocCount = $generalAgg ? (int) $generalAgg->allocation_count : Allocation::whereNull('program_id')->count();
            $generalCollected = (float) Donation::whereNull('program_id')->where('status', 'paid')->sum('amount');
            
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

            // Sort program allocations: highest allocated first, then highest collected
            usort($programAllocations, function ($a, $b) {
                if ($b['allocated_amount'] !== $a['allocated_amount']) {
                    return $b['allocated_amount'] <=> $a['allocated_amount'];
                }
                return $b['collected_amount'] <=> $a['collected_amount'];
            });

            // 6 Months Monthly Trend (Penghimpunan vs Penyaluran)
            $monthlyTrends = [];
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
                    'month_key'  => $date->format('Y-m'),
                    'label'      => $date->translatedFormat('M Y'),
                    'month_name' => $date->translatedFormat('F'),
                    'collected'  => $collected,
                    'allocated'  => $allocated,
                ];
            }

            return [
                'highlights'      => $highlights,
                'latest_articles' => $articles,
                'partners'        => $partners,
                'stats'           => [
                    'total_programs'      => Program::where('status', 'active')->count(),
                    'total_donations'     => $totalDonationsCount,
                    'amount_collected'    => $totalCollected,
                    'total_allocations'   => $totalAllocationsCount,
                    'amount_allocated'    => $totalAllocated,
                    'program_allocations' => $programAllocations,
                    'monthly_trends'      => $monthlyTrends,
                ],
            ];
        });

        return response()->json($data);
    }
}
