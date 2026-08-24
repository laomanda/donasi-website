<?php

use App\Models\Article;
use App\Models\Program;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\Mime\MimeTypes;
Route::get('/sitemap.xml', function () {
    $baseUrl = 'https://ywdp.org';

    $urls = [
        ['loc' => $baseUrl . '/', 'changefreq' => 'daily', 'priority' => '1.0'],
        ['loc' => $baseUrl . '/programs', 'changefreq' => 'daily', 'priority' => '0.9'],
        ['loc' => $baseUrl . '/literasi', 'changefreq' => 'daily', 'priority' => '0.9'],
        ['loc' => $baseUrl . '/tentang-kami', 'changefreq' => 'monthly', 'priority' => '0.7'],
        ['loc' => $baseUrl . '/layanan', 'changefreq' => 'monthly', 'priority' => '0.7'],
        ['loc' => $baseUrl . '/konsultasi', 'changefreq' => 'monthly', 'priority' => '0.7'],
        ['loc' => $baseUrl . '/galeri-dpf', 'changefreq' => 'weekly', 'priority' => '0.7'],
        ['loc' => $baseUrl . '/produk-mitra', 'changefreq' => 'weekly', 'priority' => '0.7'],
    ];

    try {
        $articles = Article::published()->get(['slug', 'updated_at']);
        foreach ($articles as $art) {
            $urls[] = [
                'loc' => $baseUrl . '/literasi/' . $art->slug,
                'lastmod' => $art->updated_at?->toIso8601String(),
                'changefreq' => 'weekly',
                'priority' => '0.8',
            ];
        }

        $programs = Program::active()->get(['slug', 'updated_at']);
        foreach ($programs as $prog) {
            $urls[] = [
                'loc' => $baseUrl . '/programs/' . $prog->slug,
                'lastmod' => $prog->updated_at?->toIso8601String(),
                'changefreq' => 'weekly',
                'priority' => '0.8',
            ];
        }
    } catch (\Throwable $e) {
        // Ignore DB issues safely
    }

    $xml = '<?xml version="1.0" encoding="UTF-8"?>';
    $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    foreach ($urls as $u) {
        $xml .= '<url>';
        $xml .= '<loc>' . htmlspecialchars($u['loc']) . '</loc>';
        if (!empty($u['lastmod'])) {
            $xml .= '<lastmod>' . $u['lastmod'] . '</lastmod>';
        }
        $xml .= '<changefreq>' . $u['changefreq'] . '</changefreq>';
        $xml .= '<priority>' . $u['priority'] . '</priority>';
        $xml .= '</url>';
    }
    $xml .= '</urlset>';

    return response($xml, 200, ['Content-Type' => 'application/xml']);
});

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
                    $article = Article::published()->where(function ($q) use ($slug) {
                        $q->where('slug', $slug)->orWhere('slug_en', $slug);
                    })->first();
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
                    $program = Program::where(function ($q) use ($slug) {
                        $q->where('slug', $slug)->orWhere('slug_en', $slug);
                    })->first();
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
