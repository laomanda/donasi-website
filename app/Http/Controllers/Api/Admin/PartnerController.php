<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use Illuminate\Http\Request;

class PartnerController extends Controller
{
    public function index()
    {
        $partners = Partner::orderBy('order')->get();

        return response()->json($partners);
    }

    public function store(Request $request)
    {
        $data = $this->validatePayload($request);

        $partner = Partner::create($data);

        return response()->json($partner, 201);
    }

    public function update(Request $request, Partner $partner)
    {
        $data = $this->validatePayload($request, false);

        $partner->update($data);

        return response()->json($partner->refresh());
    }

    public function destroy(Partner $partner)
    {
        $partner->delete();

        return response()->json(['message' => 'Partner deleted.']);
    }

    private function validatePayload(Request $request, bool $requireOrder = true): array
    {
        return $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'name_en'     => ['nullable', 'string', 'max:255'],
            'logo_path'   => ['nullable', 'string', 'max:255'],
            'url'         => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'order'       => $requireOrder ? ['required', 'integer', 'min:0'] : ['sometimes', 'integer', 'min:0'],
            'is_active'   => ['required', 'boolean'],
        ]);
    }
}
