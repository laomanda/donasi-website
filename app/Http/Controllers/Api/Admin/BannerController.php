<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\BannerRequest;

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
        $banner = Banner::create($data);
        return response()->json($banner, 201);
    }

    public function update(BannerRequest $request, Banner $banner)
    {
        $banner->update($request->validated());
        return response()->json($banner->refresh());
    }

    public function destroy(Banner $banner)
    {
        $banner->delete();
        return response()->json(['message' => 'Banner berhasil dihapus.']);
    }
}
