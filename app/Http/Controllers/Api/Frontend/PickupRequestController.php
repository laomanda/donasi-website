<?php

namespace App\Http\Controllers\Api\Frontend;

use App\Http\Controllers\Controller;
use App\Models\PickupRequest;
use App\Support\AdminBadgeNotifier;
use Illuminate\Http\Request;

class PickupRequestController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'donor_name'     => ['required', 'string', 'max:255'],
            'donor_phone'    => ['required', 'string', 'max:30'],
            'address_full'   => ['required', 'string'],
            'city'           => ['required', 'string', 'max:100'],
            'district'       => ['required', 'string', 'max:100'],
            'zakat_type'     => ['required', 'string', 'max:100'],
            'estimation'     => ['nullable', 'string', 'max:255'],
            'preferred_time' => ['nullable', 'string', 'max:255'],
        ]);

        $data['status'] = 'baru';

        $pickup = PickupRequest::create($data);
        AdminBadgeNotifier::dispatchCountForAllAdmins();

        return response()->json($pickup, 201);
    }
}
