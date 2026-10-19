<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\BannerRequest;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BannerController extends Controller
{
    public function index(Request $request)
    {
        $query = Banner::orderBy('display_order');
        if ($request->filled('status') && in_array($request->query('status'), ['published', 'draft'])) {
            $query->where('status', $request->query('status'));
        }

        return response()->json($query->get());
    }

    public function store(BannerRequest $request)
    {
        $data = $request->validated();
        if (!isset($data['status'])) {
            $data['status'] = 'published';
        }
        if (!isset($data['media_type'])) {
            $data['media_type'] = !empty($data['video_path']) ? 'video' : 'image';
        }
        $banner = Banner::create($data);
        return response()->json($banner, 201);
    }

    public function update(BannerRequest $request, Banner $banner)
    {
        $data = $request->validated();
        $banner->update($data);
        return response()->json($banner->refresh());
    }

    public function destroy(Banner $banner)
    {
        if ($banner->image_path && !Str::startsWith($banner->image_path, ['http://', 'https://'])) {
            Storage::disk('public')->delete($banner->image_path);
        }
        if ($banner->video_path && !Str::startsWith($banner->video_path, ['http://', 'https://'])) {
            Storage::disk('public')->delete($banner->video_path);
        }
        $banner->delete();
        return response()->json(['message' => 'Banner berhasil dihapus.']);
    }
}
