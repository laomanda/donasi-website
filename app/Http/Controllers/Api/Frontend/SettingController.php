<?php

namespace App\Http\Controllers\Api\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SettingController extends Controller
{
    private const ALLOWED_KEYS = [
        'landing.contact_address',
        'landing.contact_phone',
        'landing.contact_phone_display',
        'landing.contact_phone_link',
        'landing.contact_email',
        'landing.contact_email_link',
        'landing.contact_map_jakarta_embed',
        'landing.contact_map_jakarta_link',
        'landing.contact_map_medan_embed',
        'landing.contact_map_medan_link',
        'landing.social_whatsapp_link',
    ];

    public function index(Request $request)
    {
        $requested = collect(explode(',', (string) $request->input('keys')))->filter();
        $allowed = collect(self::ALLOWED_KEYS);

        $keys = $requested->isNotEmpty()
            ? $requested->intersect($allowed)->values()
            : $allowed;

        if ($keys->isEmpty()) {
            return response()->json([]);
        }

        $allSettings = Cache::remember('frontend.settings', 600, function () use ($allowed) {
            return Setting::whereIn('key', $allowed->all())
                ->orderBy('key')
                ->get()
                ->keyBy('key');
        });

        // Collect requested settings
        $result = $keys->map(function ($key) use ($allSettings) {
            return $allSettings->get($key);
        })->filter()->values();

        return response()->json($result);
    }
}
