<?php

namespace App\Http\Controllers\Api\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Donation;
use App\Models\Partner;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{
    public function __invoke(Request $request)
    {
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

        $articles = Article::published()->limit(4)->get();

        if ($articles->isEmpty()) {
            $articles = Article::latest('created_at')->limit(4)->get();
        }

        $partners = Partner::active()->limit(12)->get();

        return response()->json([
            'highlights'      => $highlights,
            'latest_articles' => $articles,
            'partners'        => $partners,
            'stats'           => [
                'total_programs'   => Program::where('status', 'active')->count(),
                'total_donations'  => Donation::paid()->count(),
                'amount_collected' => Donation::where('status', 'paid')->sum('amount'),
            ],
        ]);
    }
}
