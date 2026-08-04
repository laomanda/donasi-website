<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MitraProductRequest;
use App\Models\MitraProduct;
use App\Models\ProductImage;
use App\Services\MitraProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MitraProductController extends Controller
{
    public function __construct(private MitraProductService $products) {}

    public function index(Request $request)
    {
        $query = MitraProduct::query()->with('images');
        $status = $request->string('status')->trim()->toString();
        $search = $request->string('q')->trim()->toString();

        if ($status !== '') {
            $query->where('status', $status);
        }

        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder->where('title_id', 'like', "%{$search}%")
                    ->orWhere('title_en', 'like', "%{$search}%")
                    ->orWhere('nama_mitra', 'like', "%{$search}%");
            });
        }

        return response()->json($query->latest('updated_at')->paginate($request->integer('per_page', 15)));
    }

    public function store(MitraProductRequest $request)
    {
        return response()->json($this->products->store($request->validated()), 201);
    }

    public function show(MitraProduct $mitraProduct)
    {
        return response()->json($mitraProduct->load('images'));
    }

    public function update(MitraProductRequest $request, MitraProduct $mitraProduct)
    {
        [$product, $removedImages] = $this->products->update($mitraProduct, $request->validated());

        foreach ($removedImages as $image) {
            $this->deleteImageIfUnused($image);
        }

        return response()->json($product);
    }

    public function destroy(MitraProduct $mitraProduct)
    {
        $images = $mitraProduct->images()->pluck('image')->all();
        $mitraProduct->delete();

        foreach ($images as $image) {
            $this->deleteImageIfUnused($image);
        }

        return response()->json(['message' => 'Produk Mitra deleted.']);
    }

    private function deleteImageIfUnused(string $image): void
    {
        if (! ProductImage::where('image', $image)->exists()) {
            Storage::disk('public')->delete($image);
        }
    }
}
