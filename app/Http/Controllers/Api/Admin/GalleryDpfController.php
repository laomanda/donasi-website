<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GalleryDpfRequest;
use App\Models\GalleryDpf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GalleryDpfController extends Controller
{
    public function index(Request $request)
    {
        $query = GalleryDpf::query();

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

    public function store(GalleryDpfRequest $request)
    {
        $gallery = GalleryDpf::create($request->validated());

        return response()->json($gallery, 201);
    }

    public function show(GalleryDpf $galleryDpf)
    {
        return response()->json($galleryDpf);
    }

    public function update(GalleryDpfRequest $request, GalleryDpf $galleryDpf)
    {
        $previousImage = $galleryDpf->image;
        $galleryDpf->update($request->validated());

        if ($galleryDpf->image !== $previousImage) {
            $this->deleteImageIfUnused($previousImage, $galleryDpf->id);
        }

        return response()->json($galleryDpf->refresh());
    }

    public function destroy(GalleryDpf $galleryDpf)
    {
        $image = $galleryDpf->image;
        $galleryId = $galleryDpf->id;

        $galleryDpf->delete();
        $this->deleteImageIfUnused($image, $galleryId);

        return response()->json(['message' => 'Gallery DPF deleted.']);
    }

    private function deleteImageIfUnused(?string $image, ?int $exceptId = null): void
    {
        if (! $image) {
            return;
        }

        $query = GalleryDpf::where('image', $image);
        if ($exceptId !== null) {
            $query->whereKeyNot($exceptId);
        }

        if (! $query->exists()) {
            Storage::disk('public')->delete($image);
        }
    }
}
