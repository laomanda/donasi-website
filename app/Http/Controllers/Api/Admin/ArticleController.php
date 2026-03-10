<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\ArticleRequest;
use App\Http\Requests\Admin\PublishArticleRequest;
use App\Services\ArticleService;

class ArticleController extends Controller
{
    public function __construct(private ArticleService $articleService)
    {
    }

    public function index(Request $request)
    {
        $query = Article::query();
        $query->with('program:id,title,slug');

        $status = $request->string('status')->trim()->toString();
        if ($status !== '') {
            $query->where('status', $status);
        }

        $category = $request->string('category')->trim()->toString();
        if ($category !== '') {
            $query->where('category', $category);
        }

        $search = $request->string('q')->trim()->toString();
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        // Untuk management UI: tampilkan yang terbaru diubah/dibuat dulu
        $articles = $query->orderByDesc('updated_at')
            ->paginate($request->integer('per_page', 15));

        return response()->json($articles);
    }

    public function store(ArticleRequest $request)
    {
        $article = $this->articleService->storeArticle($request->validated());
        return response()->json($article, 201);
    }

    public function show(Article $article)
    {
        return response()->json($article);
    }

    public function update(ArticleRequest $request, Article $article)
    {
        $updatedArticle = $this->articleService->updateArticle($article, $request->validated());
        return response()->json($updatedArticle);
    }

    public function destroy(Article $article)
    {
        $article->delete();
        return response()->json(['message' => 'Article deleted.']);
    }

    public function publish(PublishArticleRequest $request, Article $article)
    {
        $publishedArticle = $this->articleService->publishArticle($article, $request->validated());
        return response()->json($publishedArticle);
    }

    public function categories()
    {
        $categories = Article::query()
            ->select('category', 'category_en')
            ->distinct()
            ->whereNotNull('category')
            ->orderBy('category')
            ->get();

        return response()->json($categories);
    }
}
