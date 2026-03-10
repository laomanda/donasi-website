<?php

namespace App\Http\Controllers\Api\Frontend;

use App\Http\Controllers\Controller;
use App\Models\WakafConsultation;
use App\Support\AdminBadgeNotifier;
use App\Http\Requests\Frontend\StoreConsultationRequest;

class ConsultationController extends Controller
{
    public function store(StoreConsultationRequest $request)
    {
        $data = $request->validated();
        $data['status'] = 'baru';

        $consultation = WakafConsultation::create($data);
        AdminBadgeNotifier::dispatchCountForAllAdmins();

        return response()->json($consultation, 201);
    }
}
