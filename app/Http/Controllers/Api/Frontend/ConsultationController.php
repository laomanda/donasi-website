<?php

namespace App\Http\Controllers\Api\Frontend;

use App\Http\Controllers\Controller;
use App\Models\ZiswafConsultation;
use Illuminate\Http\Request;

class ConsultationController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'    => ['required', 'string', 'max:255'],
            'phone'   => ['nullable', 'string', 'max:30'],
            'email'   => ['nullable', 'email'],
            'topic'   => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
        ]);

        $data['status'] = 'baru';

        $consultation = ZiswafConsultation::create($data);

        return response()->json($consultation, 201);
    }
}
