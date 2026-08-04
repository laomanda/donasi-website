<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GalleryMitraRequest;
use App\Models\GalleryMitra;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GalleryMitraController extends Controller
{
    public function index(Request $request)
    {
        $query = GalleryMitra::query();

        $status = $request->string('status')->trim()->toString();
        if ($status !== '') {
            $query->where('status', $status);
        }

        $search = $request->string('q')->trim()->toString();
        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder->where('caption_id', 'like', "%{$search}%")
                    ->orWhere('caption_en', 'like', "%{$search}%");
            });
        }

        return response()->json(
            $query->latest('updated_at')->paginate($request->integer('per_page', 15))
        );
    }

    public function store(GalleryMitraRequest $request)
    {
        $gallery = GalleryMitra::create($request->validated());

        return response()->json($gallery, 201);
    }

    public function show(GalleryMitra $galleryMitra)
    {
        return response()->json($galleryMitra);
    }

    public function update(GalleryMitraRequest $request, GalleryMitra $galleryMitra)
    {
        $previousImage = $galleryMitra->image;
        $galleryMitra->update($request->validated());

        if ($galleryMitra->image !== $previousImage) {
            $this->deleteImageIfUnused($previousImage, $galleryMitra->id);
        }

        return response()->json($galleryMitra->refresh());
    }

    public function destroy(GalleryMitra $galleryMitra)
    {
        $image = $galleryMitra->image;
        $galleryId = $galleryMitra->id;

        $galleryMitra->delete();
        $this->deleteImageIfUnused($image, $galleryId);

        return response()->json(['message' => 'Gallery Mitra deleted.']);
    }

    private function deleteImageIfUnused(?string $image, ?int $exceptId = null): void
    {
        if (! $image) {
            return;
        }

        $query = GalleryMitra::where('image', $image);
        if ($exceptId !== null) {
            $query->whereKeyNot($exceptId);
        }

        if (! $query->exists()) {
            Storage::disk('public')->delete($image);
        }
    }
}
