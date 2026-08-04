<?php

namespace App\Http\Controllers\Api\Frontend;

use App\Http\Controllers\Controller;
use App\Models\MitraProduct;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MitraProductController extends Controller
{
    public function index(Request $request)
    {
        $products = MitraProduct::published()
            ->with('images')
            ->latest('created_at')
            ->paginate($request->integer('per_page', 12));

        $products->getCollection()->transform(fn (MitraProduct $product) => $this->publicProduct($product));

        return response()->json($products);
    }

    public function show(string $slug)
    {
        $product = MitraProduct::published()->with('images')->where('slug', $slug)->firstOrFail();

        return response()->json(['product' => $this->publicProduct($product)]);
    }

    public function contact(string $slug): RedirectResponse
    {
        $product = MitraProduct::published()->where('slug', $slug)->firstOrFail();
        $phone = ltrim($product->whatsapp_number, '+');

        return redirect()->away("https://wa.me/{$phone}");
    }

    private function publicProduct(MitraProduct $product): array
    {
        return [
            'id' => $product->id,
            'slug' => $product->slug,
            'nama_mitra' => $product->nama_mitra,
            'title_id' => $product->title_id,
            'title_en' => $product->title_en,
            'description_id' => $product->description_id,
            'description_en' => $product->description_en,
            'status' => $product->status,
            'created_at' => $product->created_at,
            'updated_at' => $product->updated_at,
            'images' => $product->images->map(fn ($image) => [
                'id' => $image->id,
                'image' => $image->image,
                'sort_order' => $image->sort_order,
            ])->values(),
        ];
    }
}
