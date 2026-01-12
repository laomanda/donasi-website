<?php

use Illuminate\Support\Facades\Route;
use Symfony\Component\Mime\MimeTypes;

Route::get('/{path?}', function (?string $path = null) {
    $distPath = base_path('frontend-dpf/dist');
    $indexPath = $distPath . DIRECTORY_SEPARATOR . 'index.html';

    if ($path) {
        $publicPath = public_path($path);
        if (is_file($publicPath)) {
            $ext = strtolower(pathinfo($publicPath, PATHINFO_EXTENSION));
            $mimeMap = [
                'js' => 'application/javascript',
                'mjs' => 'application/javascript',
                'css' => 'text/css',
                'svg' => 'image/svg+xml',
                'png' => 'image/png',
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'gif' => 'image/gif',
                'webp' => 'image/webp',
                'ico' => 'image/x-icon',
                'json' => 'application/json',
                'map' => 'application/json',
                'txt' => 'text/plain',
            ];
            $mime = $mimeMap[$ext] ?? MimeTypes::getDefault()->guessMimeType($publicPath);
            $headers = $mime ? ['Content-Type' => $mime] : [];
            return response()->file($publicPath, $headers);
        }

        $assetPath = $distPath . DIRECTORY_SEPARATOR . $path;
        if (is_file($assetPath)) {
            $ext = strtolower(pathinfo($assetPath, PATHINFO_EXTENSION));
            $mimeMap = [
                'js' => 'application/javascript',
                'mjs' => 'application/javascript',
                'css' => 'text/css',
                'svg' => 'image/svg+xml',
                'png' => 'image/png',
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'gif' => 'image/gif',
                'webp' => 'image/webp',
                'ico' => 'image/x-icon',
                'json' => 'application/json',
                'map' => 'application/json',
                'txt' => 'text/plain',
            ];
            $mime = $mimeMap[$ext] ?? MimeTypes::getDefault()->guessMimeType($assetPath);
            $headers = $mime ? ['Content-Type' => $mime] : [];
            return response()->file($assetPath, $headers);
        }

        if (str_contains($path, '.')) {
            abort(404);
        }
    }

    if (is_file($indexPath)) {
        return response()->file($indexPath);
    }

    abort(404);
})->where('path', '^(?!api).*');
