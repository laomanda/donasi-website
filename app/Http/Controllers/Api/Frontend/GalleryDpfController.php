<?php

namespace App\Http\Controllers\Api\Frontend;

use App\Http\Controllers\Controller;
use App\Models\GalleryDpf;
use Illuminate\Http\Request;

class GalleryDpfController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 24);

        return response()->json(
            GalleryDpf::published()
                ->latest('created_at')
                ->paginate($perPage)
        );
    }
}
