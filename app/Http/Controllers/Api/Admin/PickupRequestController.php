<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PickupRequest;
use App\Support\AdminBadgeNotifier;
use Illuminate\Http\Request;

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

    public function store(Request $request)
    {
        $data = $this->validatePayload($request);
        $data['status'] = $data['status'] ?? 'baru';

        $pickup = PickupRequest::create($data);
        AdminBadgeNotifier::dispatchCountForAllAdmins();

        return response()->json($pickup, 201);
    }

    public function show(PickupRequest $pickupRequest)
    {
        return response()->json($pickupRequest);
    }

    public function update(Request $request, PickupRequest $pickupRequest)
    {
        $data = $this->validatePayload($request, false);

        $pickupRequest->update($data);
        AdminBadgeNotifier::dispatchCountForAllAdmins();

        return response()->json($pickupRequest->refresh());
    }

    public function updateStatus(Request $request, PickupRequest $pickupRequest)
    {
        $data = $request->validate([
            'status'           => ['required', 'in:baru,dijadwalkan,selesai,dibatalkan'],
            'assigned_officer' => ['nullable', 'string', 'max:255'],
            'notes'            => ['nullable', 'string'],
        ]);

        $pickupRequest->update($data);
        AdminBadgeNotifier::dispatchCountForAllAdmins();

        return response()->json($pickupRequest->refresh());
    }

    public function destroy(PickupRequest $pickupRequest)
    {
        $pickupRequest->delete();
        AdminBadgeNotifier::dispatchCountForAllAdmins();

        return response()->json(['message' => 'Pickup request deleted.']);
    }

    private function validatePayload(Request $request, bool $requireStatus = true): array
    {
        $rules = [
            'donor_name'      => ['required', 'string', 'max:255'],
            'donor_phone'     => ['required', 'string', 'max:30'],
            'address_full'    => ['required', 'string'],
            'city'            => ['required', 'string', 'max:100'],
            'district'        => ['required', 'string', 'max:100'],
            'zakat_type'      => ['required', 'string', 'max:100'],
            'estimation'      => ['nullable', 'string', 'max:255'],
            'preferred_time'  => ['nullable', 'string', 'max:255'],
            'assigned_officer'=> ['nullable', 'string', 'max:255'],
            'notes'           => ['nullable', 'string'],
        ];

        if ($requireStatus) {
            $rules['status'] = ['nullable', 'in:baru,dijadwalkan,selesai,dibatalkan'];
        }

        return $request->validate($rules);
    }
}
