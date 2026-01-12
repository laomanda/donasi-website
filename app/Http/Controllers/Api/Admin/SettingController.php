<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * Return requested keys or all settings.
     */
    public function index(Request $request)
    {
        $keys = collect(explode(',', (string) $request->input('keys')))->filter();

        $query = Setting::query();

        if ($keys->isNotEmpty()) {
            $query->whereIn('key', $keys->all());
        }

        return response()->json($query->orderBy('key')->get());
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'settings'         => ['required', 'array'],
            'settings.*.key'   => ['required', 'string', 'max:255'],
            'settings.*.value' => ['nullable'],
        ]);

        foreach ($data['settings'] as $item) {
            Setting::setValue($item['key'], $item['value']);
        }

        return response()->json(['message' => 'Settings updated.']);
    }
}
