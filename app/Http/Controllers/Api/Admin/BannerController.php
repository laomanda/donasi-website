<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BannerController extends Controller
{
    public function index()
    {
        return response()->json(
            Banner::orderBy('display_order')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $this->validatePayload($request);
        $banner = Banner::create($data);

        return response()->json($banner, 201);
    }

    public function update(Request $request, Banner $banner)
    {
        $data = $this->validatePayload($request, $banner);
        $banner->update($data);

        return response()->json($banner->refresh());
    }

    public function destroy(Banner $banner)
    {
        $banner->delete();
        return response()->json(['message' => 'Banner deleted.']);
    }

    private function validatePayload(Request $request, ?Banner $banner = null): array
    {
        $orderRule = Rule::unique('banners', 'display_order');
        if ($banner) {
            $orderRule = $orderRule->ignore($banner->id);
        }

        return $request->validate([
            'image_path'   => [$banner ? 'sometimes' : 'required', 'string', 'max:255'],
            'display_order'=> [$banner ? 'sometimes' : 'required', 'integer', 'min:0', $orderRule],
        ]);
    }
}
