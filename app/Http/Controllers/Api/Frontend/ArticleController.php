<?php

namespace App\Http\Controllers\Api\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    public function index(Request $request)
    {
        $category = $request->string('category')->trim()->toString();
        $search = $request->string('q')->trim()->toString();
        $perPage = $request->integer('per_page', 12);
        $page = $request->integer('page', 1);

        $cacheKey = "frontend_articles_{$category}_{$search}_{$perPage}_{$page}";

        $data = \Illuminate\Support\Facades\Cache::remember($cacheKey, 600, function () use ($category, $search, $perPage) {
            $query = Article::published()->with('program:id,title,slug');

            if ($category !== '') {
                $query->where('category', $category);
            }

            if ($search !== '') {
                $query->where('title', 'like', "%{$search}%");
            }

            return $query->paginate($perPage)->toArray();
        });

        return response()->json($data);
    }

    public function show(string $slug)
    {
        $cacheKey = "frontend_article_show_{$slug}";

        $data = \Illuminate\Support\Facades\Cache::remember($cacheKey, 600, function () use ($slug) {
            $article = Article::published()->with('program:id,title,slug')->where('slug', $slug)->firstOrFail();

            $related = Article::published()
                ->with('program:id,title,slug')
                ->where('category', $article->category)
                ->where('id', '!=', $article->id)
                ->limit(3)
                ->get();

            return [
                'article' => $article->toArray(),
                'related' => $related->toArray(),
            ];
        });

        return response()->json($data);
    }
}
