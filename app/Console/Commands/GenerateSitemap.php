<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Models\Program;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class GenerateSitemap extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sitemap:generate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate sitemap.xml for Google Search Console';

    /**
     * Execute the console command.
     */
    public function handle()
    {
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
            $this->warn('Could not query database for sitemap: ' . $e->getMessage());
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
        foreach ($urls as $u) {
            $xml .= '  <url>' . "\n";
            $xml .= '    <loc>' . htmlspecialchars($u['loc']) . '</loc>' . "\n";
            if (!empty($u['lastmod'])) {
                $xml .= '    <lastmod>' . $u['lastmod'] . '</lastmod>' . "\n";
            }
            $xml .= '    <changefreq>' . $u['changefreq'] . '</changefreq>' . "\n";
            $xml .= '    <priority>' . $u['priority'] . '</priority>' . "\n";
            $xml .= '  </url>' . "\n";
        }
        $xml .= '</urlset>';

        // Target paths: local public_html and parent directory if inside api/
        $targetPaths = [
            public_path('sitemap.xml'),
            base_path('../sitemap.xml'),
        ];

        foreach ($targetPaths as $path) {
            try {
                File::put($path, $xml);
                $this->info("Sitemap generated successfully at: {$path}");
            } catch (\Throwable $e) {
                // Ignore path error
            }
        }

        return 0;
    }
}
