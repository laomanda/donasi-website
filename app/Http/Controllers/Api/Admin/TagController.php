<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TagController extends Controller
{
    public function index()
    {
        $tags = Tag::orderBy('sort_order', 'asc')->get();
        return response()->json($tags);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'nullable|string|max:2048',
            'is_active' => 'boolean',
            'sort_order' => 'integer|unique:tags,sort_order',
            'open_in_new_tab' => 'boolean',
        ]);

        $tag = Tag::create($validated);

        return response()->json($tag, 201);
    }

    public function show(Tag $tag)
    {
        return response()->json($tag);
    }

    public function update(Request $request, Tag $tag)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'url' => 'nullable|string|max:2048',
            'is_active' => 'boolean',
            'sort_order' => ['integer', Rule::unique('tags', 'sort_order')->ignore($tag->id)],
            'open_in_new_tab' => 'boolean',
        ]);

        $tag->update($validated);

        return response()->json($tag);
    }

    public function destroy(Tag $tag)
    {
        $tag->delete();
        return response()->json(null, 204);
    }
}
