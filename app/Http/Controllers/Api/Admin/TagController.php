<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\TagRequest;

class TagController extends Controller
{
    public function index()
    {
        $tags = Tag::orderBy('sort_order', 'asc')->get();
        return response()->json($tags);
    }

    public function store(TagRequest $request)
    {
        $tag = Tag::create($request->validated());
        return response()->json($tag, 201);
    }

    public function show(Tag $tag)
    {
        return response()->json($tag);
    }

    public function update(TagRequest $request, Tag $tag)
    {
        $tag->update($request->validated());
        return response()->json($tag);
    }

    public function destroy(Tag $tag)
    {
        $tag->delete();
        return response()->json(null, 204);
    }
}
