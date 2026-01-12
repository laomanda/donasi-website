<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ArticleController extends Controller
{
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

        // Untuk management UI: tampilkan yang terbaru diubah/dibuat dulu,
        // agar draft baru tidak "hilang" karena published_at null.
        $articles = $query->orderByDesc('updated_at')
            ->paginate($request->integer('per_page', 15));

        return response()->json($articles);
    }

    public function store(Request $request)
    {
        $data = $this->validatePayload($request);

        $data['slug'] = $data['slug'] ?? Str::slug($data['title']);

        $article = Article::create($data);

        return response()->json($article, 201);
    }

    public function show(Article $article)
    {
        return response()->json($article);
    }

    public function update(Request $request, Article $article)
    {
        $data = $this->validatePayload($request, $article->id);

        if (blank($data['slug'] ?? null)) {
            $data['slug'] = Str::slug($data['title']);
        }

        $article->update($data);

        return response()->json($article->refresh());
    }

    public function destroy(Article $article)
    {
        $article->delete();

        return response()->json(['message' => 'Article deleted.']);
    }

    public function publish(Request $request, Article $article)
    {
        $data = $request->validate([
            'status'        => ['sometimes', 'in:draft,review,published'],
            'published_at'  => ['nullable', 'date'],
        ]);

        if (($data['status'] ?? $article->status) === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $article->update($data);

        return response()->json($article->refresh());
    }

    private function validatePayload(Request $request, ?int $articleId = null): array
    {
        return $request->validate([
            'title'          => ['required', 'string', 'max:255'],
            'title_en'       => ['nullable', 'string', 'max:255'],
            'slug'           => ['nullable', 'string', 'max:255', 'unique:articles,slug,' . $articleId],
            'program_id'     => ['nullable', 'exists:programs,id'],
            'category'       => ['required', 'string', 'max:100'],
            'category_en'    => ['nullable', 'string', 'max:100'],
            'thumbnail_path' => ['nullable', 'string', 'max:255'],
            'excerpt'        => ['required', 'string'],
            'excerpt_en'     => ['nullable', 'string'],
            'body'           => ['required', 'string'],
            'body_en'        => ['nullable', 'string'],
            'author_name'    => ['nullable', 'string', 'max:255'],
            'published_at'   => ['nullable', 'date'],
            'status'         => ['required', 'in:draft,review,published'],
        ]);
    }
}
