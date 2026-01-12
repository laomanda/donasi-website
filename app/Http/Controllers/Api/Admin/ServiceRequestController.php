<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;

class ServiceRequestController extends Controller
{
    public function index(Request $request)
    {
        $requests = ServiceRequest::query()
            ->filter([
                'status'       => $request->string('status')->toString(),
                'service_type' => $request->string('service_type')->toString(),
                'q'            => $request->string('q')->toString(),
            ])
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 15));

        return response()->json($requests);
    }

    public function store(Request $request)
    {
        $data = $this->validatePayload($request);

        $serviceRequest = ServiceRequest::create($data);

        return response()->json($serviceRequest, 201);
    }

    public function show(ServiceRequest $serviceRequest)
    {
        return response()->json($serviceRequest);
    }

    public function update(Request $request, ServiceRequest $serviceRequest)
    {
        $data = $this->validatePayload($request, false);

        $serviceRequest->update($data);

        return response()->json($serviceRequest->refresh());
    }

    public function destroy(ServiceRequest $serviceRequest)
    {
        $serviceRequest->delete();

        return response()->json(['message' => 'Service request deleted.']);
    }

    public function updateStatus(Request $request, ServiceRequest $serviceRequest)
    {
        $data = $request->validate([
            'status'      => ['required', 'in:baru,diproses,selesai,dibatalkan'],
            'handled_by'  => ['nullable', 'string', 'max:255'],
            'notes'       => ['nullable', 'string'],
        ]);

        $serviceRequest->update($data);

        return response()->json($serviceRequest->refresh());
    }

    private function validatePayload(Request $request, bool $requireStatus = true): array
    {
        $rules = [
            'name'         => ['required', 'string', 'max:255'],
            'phone'        => ['required', 'string', 'max:30'],
            'city'         => ['nullable', 'string', 'max:100'],
            'service_type' => ['required', 'in:jemput,konfirmasi,konsultasi'],
            'notes'        => ['nullable', 'string'],
            'handled_by'   => ['nullable', 'string', 'max:255'],
        ];

        if ($requireStatus) {
            $rules['status'] = ['nullable', 'in:baru,diproses,selesai,dibatalkan'];
        }

        return $request->validate($rules);
    }
}
