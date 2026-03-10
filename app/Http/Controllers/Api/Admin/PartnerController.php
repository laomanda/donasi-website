<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\PartnerRequest;

class PartnerController extends Controller
{
    public function index()
    {
        $partners = Partner::orderBy('order')->get();
        return response()->json($partners);
    }

    public function store(PartnerRequest $request)
    {
        $partner = Partner::create($request->validated());
        return response()->json($partner, 201);
    }

    public function update(PartnerRequest $request, Partner $partner)
    {
        $partner->update($request->validated());
        return response()->json($partner->refresh());
    }

    public function destroy(Partner $partner)
    {
        $partner->delete();
        return response()->json(['message' => 'Partner deleted.']);
    }
}
