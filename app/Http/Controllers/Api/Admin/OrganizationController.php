<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrganizationMember;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\OrganizationRequest;

class OrganizationController extends Controller
{
    public function index(Request $request)
    {
        $query = OrganizationMember::query();

        $group = $request->string('group')->trim()->toString();
        if ($group !== '') {
            $query->where('group', $group);
        }

        $search = $request->string('q')->trim()->toString();
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('position_title', 'like', "%{$search}%");
            });
        }

        $members = $query->orderBy('group')->orderBy('order')->paginate($request->integer('per_page', 20));

        return response()->json($members);
    }

    public function store(OrganizationRequest $request)
    {
        $member = OrganizationMember::create($request->validated());
        return response()->json($member, 201);
    }

    public function show(OrganizationMember $organizationMember)
    {
        return response()->json($organizationMember);
    }

    public function update(OrganizationRequest $request, OrganizationMember $organizationMember)
    {
        $organizationMember->update($request->validated());
        return response()->json($organizationMember->refresh());
    }

    public function destroy(OrganizationMember $organizationMember)
    {
        $organizationMember->delete();
        return response()->json(['message' => 'Member deleted.']);
    }
}
