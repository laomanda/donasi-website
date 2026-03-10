<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\BannerRequest;

class BannerController extends Controller
{
    public function index()
    {
        return response()->json(
            Banner::orderBy('display_order')->get()
        );
    }

    public function store(BannerRequest $request)
    {
        $banner = Banner::create($request->validated());
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
        return response()->json(['message' => 'Banner deleted.']);
    }
}
