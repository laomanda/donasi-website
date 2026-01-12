<?php

namespace App\Http\Controllers\Api\Frontend;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;

class ServiceRequestController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'         => ['required', 'string', 'max:255'],
            'phone'        => ['required', 'string', 'max:30'],
            'city'         => ['nullable', 'string', 'max:100'],
            'service_type' => ['required', 'in:jemput,konfirmasi,konsultasi'],
            'notes'        => ['nullable', 'string'],
        ]);

        $data['status'] = 'baru';

        $serviceRequest = ServiceRequest::create($data);

        return response()->json($serviceRequest, 201);
    }
}
