<?php

namespace App\Http\Controllers\Api\Frontend;

use App\Http\Controllers\Controller;
use App\Models\PickupRequest;
use App\Support\AdminBadgeNotifier;
use App\Http\Requests\Frontend\StorePickupRequest;

class PickupRequestController extends Controller
{
    public function store(StorePickupRequest $request)
    {
        $data = $request->validated();
        $data['status'] = 'baru';

        $pickup = PickupRequest::create($data);
        AdminBadgeNotifier::dispatchCountForAllAdmins();

        return response()->json($pickup, 201);
    }
}
