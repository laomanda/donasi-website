<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrganizationMember;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

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

    public function store(Request $request)
    {
        $data = $this->validatePayload($request);
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        $member = OrganizationMember::create($data);

        return response()->json($member, 201);
    }

    public function show(OrganizationMember $organizationMember)
    {
        return response()->json($organizationMember);
    }

    public function update(Request $request, OrganizationMember $organizationMember)
    {
        $data = $this->validatePayload($request, $organizationMember->id);

        if (blank($data['slug'] ?? null)) {
            $data['slug'] = Str::slug($data['name']);
        }

        $organizationMember->update($data);

        return response()->json($organizationMember->refresh());
    }

    public function destroy(OrganizationMember $organizationMember)
    {
        $organizationMember->delete();

        return response()->json(['message' => 'Member deleted.']);
    }

    private function validatePayload(Request $request, ?int $memberId = null): array
    {
        return $request->validate([
            'name'           => ['required', 'string', 'max:255'],
            'name_en'        => ['nullable', 'string', 'max:255'],
            'slug'           => ['nullable', 'string', 'max:255', 'unique:organization_members,slug,' . $memberId],
            'position_title' => ['required', 'string', 'max:255'],
            'position_title_en' => ['nullable', 'string', 'max:255'],
            'group'          => ['required', 'string', 'max:100'],
            'group_en'       => ['nullable', 'string', 'max:100'],
            'photo_path'     => ['nullable', 'string', 'max:255'],
            'short_bio'      => ['nullable', 'string'],
            'short_bio_en'   => ['nullable', 'string'],
            'long_bio'       => ['nullable', 'string'],
            'long_bio_en'    => ['nullable', 'string'],
            'email'          => ['nullable', 'email'],
            'phone'          => ['nullable', 'string', 'max:30'],
            'show_contact'   => ['required', 'boolean'],
            'order'          => ['required', 'integer', 'min:0'],
            'is_active'      => ['required', 'boolean'],
        ]);
    }
}
