<?php

namespace App\Services;

use App\Models\Article;
use Illuminate\Support\Str;

class ArticleService
{
    /**
     * Store a newly created article.
     *
     * @param array $data
     * @return Article
     */
    public function storeArticle(array $data): Article
    {
        $data['slug'] = $this->generateUniqueSlug($data['title'] ?? '', $data['slug'] ?? '');
        return Article::create($data);
    }

    /**
     * Update an existing article.
     *
     * @param Article $article
     * @param array $data
     * @return Article
     */
    public function updateArticle(Article $article, array $data): Article
    {
        $data['slug'] = $this->generateUniqueSlug($data['title'] ?? '', $data['slug'] ?? '', $article);
        $article->update($data);
        return $article->refresh();
    }

    /**
     * Publish an article or handle publication status.
     *
     * @param Article $article
     * @param array $data
     * @return Article
     */
    public function publishArticle(Article $article, array $data): Article
    {
        $status = $data['status'] ?? $article->status;
        $publishedAt = $data['published_at'] ?? null;

        if ($status === 'published' && empty($publishedAt)) {
            $data['published_at'] = now();
        }

        $article->update($data);
        return $article->refresh();
    }

    /**
     * Generate a unique slug for the article.
     *
     * @param string $title
     * @param string $slug
     * @param Article|null $article
     * @return string
     */
    private function generateUniqueSlug(string $title, string $slug, ?Article $article = null): string
    {
        $parsedSlug = trim($slug);

        if ($parsedSlug !== '') {
            return $parsedSlug;
        }

        if (trim($title) === '') {
            return '';
        }

        $baseSlug = Str::slug($title);
        $finalSlug = $baseSlug;
        $counter = 1;

        while (
            Article::where('slug', $finalSlug)
                ->when($article, fn($q) => $q->where('id', '!=', $article->id))
                ->exists()
        ) {
            $finalSlug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $finalSlug;
    }
}
