<?php

namespace App\Services;

use App\Models\MitraProduct;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MitraProductService
{
    public function store(array $data): MitraProduct
    {
        return DB::transaction(function () use ($data) {
            $images = $this->imagesFrom($data);
            $data['slug'] = $this->uniqueSlug($data['title_id'] ?? '', $data['slug'] ?? '');
            unset($data['images']);

            $product = MitraProduct::create($data);
            $this->syncImages($product, $images);

            return $product->load('images');
        });
    }

    public function update(MitraProduct $product, array $data): array
    {
        return DB::transaction(function () use ($product, $data) {
            $previousImages = $product->images()->pluck('image')->all();
            $images = $this->imagesFrom($data);
            $data['slug'] = $this->uniqueSlug($data['title_id'] ?? '', $data['slug'] ?? '', $product);
            unset($data['images']);

            $product->update($data);
            $product->images()->delete();
            $this->syncImages($product, $images);

            return [$product->fresh('images'), array_values(array_diff($previousImages, $images))];
        });
    }

    private function syncImages(MitraProduct $product, array $images): void
    {
        foreach ($images as $sortOrder => $image) {
            $product->images()->create(['image' => $image, 'sort_order' => $sortOrder]);
        }
    }

    private function imagesFrom(array $data): array
    {
        return collect($data['images'] ?? [])
            ->pluck('image')
            ->map(fn ($image) => trim((string) $image))
            ->filter()
            ->unique()
            ->take(5)
            ->values()
            ->all();
    }

    private function uniqueSlug(string $title, string $slug, ?MitraProduct $product = null): string
    {
        $baseSlug = Str::slug(trim($slug) ?: trim($title));
        $baseSlug = $baseSlug !== '' ? $baseSlug : 'produk-mitra';
        $finalSlug = $baseSlug;
        $counter = 1;

        while (MitraProduct::query()->where('slug', $finalSlug)->when($product, fn ($query) => $query->whereKeyNot($product->id))->exists()) {
            $finalSlug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $finalSlug;
    }
}
