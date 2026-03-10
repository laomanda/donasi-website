<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PickupRequest;
use App\Support\AdminBadgeNotifier;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\PickupFormRequest;
use App\Http\Requests\Admin\UpdatePickupStatusRequest;

class PickupRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = PickupRequest::query();

        $status = $request->string('status')->trim()->toString();
        if ($status !== '') {
            $query->where('status', $status);
        }

        $search = $request->string('q')->trim()->toString();
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('donor_name', 'like', "%{$search}%")
                    ->orWhere('donor_phone', 'like', "%{$search}%");
            });
        }

        $requests = $query->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 15));

        return response()->json($requests);
    }

    public function store(PickupFormRequest $request)
    {
        $data = $request->validated();
        $data['status'] = $data['status'] ?? 'baru';

        $pickup = PickupRequest::create($data);
        AdminBadgeNotifier::dispatchCountForAllAdmins();

        return response()->json($pickup, 201);
    }

    public function show(PickupRequest $pickupRequest)
    {
        return response()->json($pickupRequest);
    }

    public function update(PickupFormRequest $request, PickupRequest $pickupRequest)
    {
        $pickupRequest->update($request->validated());
        AdminBadgeNotifier::dispatchCountForAllAdmins();

        return response()->json($pickupRequest->refresh());
    }

    public function updateStatus(UpdatePickupStatusRequest $request, PickupRequest $pickupRequest)
    {
        $pickupRequest->update($request->validated());
        AdminBadgeNotifier::dispatchCountForAllAdmins();

        return response()->json($pickupRequest->refresh());
    }

    public function destroy(PickupRequest $pickupRequest)
    {
        $pickupRequest->delete();
        AdminBadgeNotifier::dispatchCountForAllAdmins();

        return response()->json(['message' => 'Pickup request deleted.']);
    }
}
