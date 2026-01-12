<?php

namespace App\Http\Controllers\Api\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    public function index(Request $request)
    {
        $query = Article::published();

        $category = $request->string('category')->trim()->toString();
        if ($category !== '') {
            $query->where('category', $category);
        }

        $search = $request->string('q')->trim()->toString();
        if ($search !== '') {
            $query->where('title', 'like', "%{$search}%");
        }

        return response()->json(
            $query->paginate($request->integer('per_page', 12))
        );
    }

    public function show(string $slug)
    {
        $article = Article::published()->where('slug', $slug)->firstOrFail();

        $related = Article::published()
            ->where('category', $article->category)
            ->where('id', '!=', $article->id)
            ->limit(3)
            ->get();

        return response()->json([
            'article' => $article,
            'related' => $related,
        ]);
    }
}
