<?php

use App\Models\Article;
use App\Models\Program;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
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
        $html = file_get_contents($indexPath);

        // Dynamically inject OpenGraph & Twitter Meta Tags for Articles and Programs
        $metaTitle = null;
        $metaDescription = null;
        $metaImage = null;
        $metaUrl = url($path ?? '/');
        $metaType = 'website';

        if ($path) {
            try {
                $segments = explode('/', trim($path, '/'));
                $firstSegment = strtolower($segments[0] ?? '');
                $slug = $segments[1] ?? null;

                if ($slug && in_array($firstSegment, ['literasi', 'articles', 'article'])) {
                    $article = Article::published()->firstWhere('slug', $slug);
                    if ($article) {
                        $metaTitle = e($article->title);
                        $metaDescription = e(Str::limit(trim(strip_tags($article->excerpt ?: $article->body)), 160));
                        $metaType = 'article';
                        if ($article->thumbnail_path) {
                            $metaImage = Str::startsWith($article->thumbnail_path, ['http://', 'https://'])
                                ? $article->thumbnail_path
                                : Storage::disk('public')->url($article->thumbnail_path);
                        }
                    }
                } elseif ($slug && in_array($firstSegment, ['program', 'programs', 'donasi'])) {
                    $program = Program::firstWhere('slug', $slug);
                    if ($program) {
                        $metaTitle = e($program->title);
                        $metaDescription = e(Str::limit(trim(strip_tags($program->short_description ?: $program->description)), 160));
                        if ($program->thumbnail_path || $program->banner_path) {
                            $imgPath = $program->thumbnail_path ?: $program->banner_path;
                            $metaImage = Str::startsWith($imgPath, ['http://', 'https://'])
                                ? $imgPath
                                : Storage::disk('public')->url($imgPath);
                        }
                    }
                }
                
                if ($metaImage) {
                    if (Str::startsWith($metaImage, ['http://', 'https://'])) {
                        $parsedUrl = parse_url($metaImage);
                        $host = $parsedUrl['host'] ?? '';
                        if (in_array($host, ['localhost', '127.0.0.1']) || Str::contains($metaImage, config('app.url'))) {
                            $pathAndQuery = ($parsedUrl['path'] ?? '') . (isset($parsedUrl['query']) ? '?' . $parsedUrl['query'] : '');
                            $metaImage = request()->schemeAndHttpHost() . $pathAndQuery;
                        }
                    } else {
                        $metaImage = url($metaImage);
                    }
                }
            } catch (\Throwable $e) {
                // Ignore database errors and safely fall back to default HTML
            }
        }

        if ($metaTitle || $metaImage) {
            $ogTags = [];
            if ($metaTitle) {
                $ogTags[] = '<meta property="og:title" content="' . $metaTitle . '" />';
                $ogTags[] = '<meta name="twitter:title" content="' . $metaTitle . '" />';
                $html = preg_replace('/<title>.*?<\/title>/i', '<title>' . $metaTitle . ' - Djalaludin Pane Foundation</title>', $html);
            }

            if ($metaDescription) {
                $ogTags[] = '<meta property="og:description" content="' . $metaDescription . '" />';
                $ogTags[] = '<meta name="twitter:description" content="' . $metaDescription . '" />';
                $html = preg_replace('/<meta name="description" content=".*?" \/>/i', '<meta name="description" content="' . $metaDescription . '" />', $html);
            }

            if ($metaImage) {
                $ogTags[] = '<meta property="og:image" content="' . e($metaImage) . '" />';
                $ogTags[] = '<meta property="og:image:secure_url" content="' . e($metaImage) . '" />';
                $ogTags[] = '<meta name="twitter:image" content="' . e($metaImage) . '" />';
                $ogTags[] = '<meta name="twitter:card" content="summary_large_image" />';
            }

            $ogTags[] = '<meta property="og:url" content="' . e($metaUrl) . '" />';
            $ogTags[] = '<meta property="og:type" content="' . $metaType . '" />';
            $ogTags[] = '<meta property="og:site_name" content="Djalaludin Pane Foundation" />';

            $ogInjectString = "\n    " . implode("\n    ", $ogTags) . "\n</head>";
            $html = str_replace('</head>', $ogInjectString, $html);
        }

        return response($html, 200, ['Content-Type' => 'text/html; charset=UTF-8']);
    }

    abort(404);
})->where('path', '^(?!api).*');
