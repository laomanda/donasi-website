<?php

namespace App\Http\Controllers\Api\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProgramController extends Controller
{
    public function index(Request $request)
    {
        $query = Program::query();

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        } else {
            $query->whereIn('status', ['active', 'draft', 'completed']);
        }

        $category = $request->string('category')->trim()->toString();
        if ($category !== '') {
            $query->where('category', $category);
        }

        if ($request->boolean('highlight')) {
            $query->highlight();
        }

        $perPage = $request->integer('per_page', 12);

        return response()->json(
            $query->orderBy('is_highlight', 'desc')
                ->orderByDesc(DB::raw('COALESCE(published_at, created_at)'))
                ->paginate($perPage)
        );
    }

    public function show(string $slug)
    {
        $program = Program::where('slug', $slug)
            ->whereIn('status', ['active', 'draft', 'completed'])
            ->firstOrFail();

        $recentDonations = $program->donations()->paid()
            ->select(['id', 'donor_name', 'amount', 'is_anonymous', 'paid_at'])
            ->latest('paid_at')
            ->limit(20)
            ->get()
            ->map(function ($donation) {
                if ($donation->is_anonymous) {
                    $donation->donor_name = 'Hamba Allah';
                }

                return $donation;
            });

        $progress = $program->target_amount > 0
            ? round(($program->collected_amount / $program->target_amount) * 100, 2)
            : 0;

        $latestUpdates = Article::published()
            ->where('program_id', $program->id)
            ->orderByDesc('published_at')
            ->limit(10)
            ->get(['id', 'slug', 'title', 'excerpt', 'published_at']);

        return response()->json([
            'program'          => $program,
            'progress_percent' => $progress,
            'recent_donations' => $recentDonations,
            'latest_updates'   => $latestUpdates,
        ]);
    }
}
