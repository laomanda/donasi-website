<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ZiswafConsultation;
use App\Support\AdminBadgeNotifier;
use Illuminate\Http\Request;

class ZiswafConsultationController extends Controller
{
    public function index(Request $request)
    {
        $query = ZiswafConsultation::query();

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

    public function store(Request $request)
    {
        $data = $this->validatePayload($request);
        $data['status'] = $data['status'] ?? 'baru';

        $consultation = ZiswafConsultation::create($data);
        AdminBadgeNotifier::dispatchCountForAllAdmins();

        return response()->json($consultation, 201);
    }

    public function show(ZiswafConsultation $ziswafConsultation)
    {
        return response()->json($ziswafConsultation);
    }

    public function update(Request $request, ZiswafConsultation $ziswafConsultation)
    {
        $data = $this->validatePayload($request, false);

        $ziswafConsultation->update($data);
        AdminBadgeNotifier::dispatchCountForAllAdmins();

        return response()->json($ziswafConsultation->refresh());
    }

    public function updateStatus(Request $request, ZiswafConsultation $ziswafConsultation)
    {
        $data = $request->validate([
            'status'      => ['required', 'in:baru,dibalas,ditutup'],
            'admin_notes' => ['nullable', 'string'],
        ]);

        $ziswafConsultation->update($data);
        AdminBadgeNotifier::dispatchCountForAllAdmins();

        return response()->json($ziswafConsultation->refresh());
    }

    public function destroy(ZiswafConsultation $ziswafConsultation)
    {
        $ziswafConsultation->delete();
        AdminBadgeNotifier::dispatchCountForAllAdmins();

        return response()->json(['message' => 'Consultation deleted.']);
    }

    private function validatePayload(Request $request, bool $allowStatus = true): array
    {
        $rules = [
            'name'        => ['required', 'string', 'max:255'],
            'phone'       => ['nullable', 'string', 'max:30'],
            'email'       => ['nullable', 'email'],
            'topic'       => ['required', 'string', 'max:255'],
            'message'     => ['required', 'string'],
            'admin_notes' => ['nullable', 'string'],
        ];

        if ($allowStatus) {
            $rules['status'] = ['nullable', 'in:baru,dibalas,ditutup'];
        }

        return $request->validate($rules);
    }
}
