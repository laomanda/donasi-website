<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\WakafConsultation;
use App\Support\AdminBadgeNotifier;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\WakafConsultationRequest;
use App\Http\Requests\Admin\UpdateWakafStatusRequest;

class WakafConsultationController extends Controller
{
    public function index(Request $request)
    {
        $query = WakafConsultation::query();

        $status = $request->string('status')->trim()->toString();
        if ($status !== '') {
            $query->where('status', $status);
        }

        $search = $request->string('q')->trim()->toString();
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('topic', 'like', "%{$search}%");
            });
        }

        $consultations = $query->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20));

        return response()->json($consultations);
    }

    public function store(WakafConsultationRequest $request)
    {
        $data = $request->validated();
        $data['status'] = $data['status'] ?? 'baru';

        $consultation = WakafConsultation::create($data);
        AdminBadgeNotifier::dispatchCountForAllAdmins();

        return response()->json($consultation, 201);
    }

    public function show(WakafConsultation $wakafConsultation)
    {
        return response()->json($wakafConsultation);
    }

    public function update(WakafConsultationRequest $request, WakafConsultation $wakafConsultation)
    {
        $wakafConsultation->update($request->validated());
        AdminBadgeNotifier::dispatchCountForAllAdmins();

        return response()->json($wakafConsultation->refresh());
    }

    public function updateStatus(UpdateWakafStatusRequest $request, WakafConsultation $wakafConsultation)
    {
        $wakafConsultation->update($request->validated());
        AdminBadgeNotifier::dispatchCountForAllAdmins();

        return response()->json($wakafConsultation->refresh());
    }

    public function destroy(WakafConsultation $wakafConsultation)
    {
        $wakafConsultation->delete();
        AdminBadgeNotifier::dispatchCountForAllAdmins();

        return response()->json(['message' => 'Consultation deleted.']);
    }
}
