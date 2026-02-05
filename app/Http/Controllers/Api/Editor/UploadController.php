<?php

namespace App\Http\Controllers\Api\Editor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function storeImage(Request $request)
    {
        $data = $request->validate([
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'folder' => ['nullable', 'string', 'max:64'],
        ]);

        $folder = trim((string) ($data['folder'] ?? 'uploads'));
        $folder = $folder !== '' ? $folder : 'uploads';
        $folder = preg_replace('/[^a-zA-Z0-9\-_\/]/', '', $folder) ?: 'uploads';
        $folder = trim($folder, '/');

        $path = $request->file('file')->store($folder, 'public');

        return response()->json([
            'path' => $path,
            'url' => Storage::disk('public')->url($path),
        ], 201);
    }
}

