<?php

namespace App\Http\Controllers\Api\Editor;

use App\Http\Controllers\Api\Admin\DashboardController as BaseDashboardController;
use App\Models\Article;
use App\Models\OrganizationMember;
use App\Models\Partner;
use App\Models\Program;
use App\Models\Setting;

class DashboardController extends BaseDashboardController
{
    protected function buildData(): array
    {
        $articlesDraft = Article::where('status', 'draft')->count();
        $articlesReview = Article::where('status', 'review')->count();
        $articlesPublished = Article::published()->count();

        $programsActive = Program::where('status', 'active')->count();
        $programsInactive = Program::where('status', '!=', 'active')->count();

        $lastDraftArticle = Article::where('status', 'draft')->latest('updated_at')->first(['id', 'title', 'updated_at']);
        $lastDraftProgram = Program::where('status', 'draft')->latest('updated_at')->first(['id', 'title', 'updated_at']);

        $lastDraft = null;
        if ($lastDraftArticle || $lastDraftProgram) {
            $lastDraft = collect([
                $lastDraftArticle ? [
                    'type'       => 'article',
                    'id'         => $lastDraftArticle->id,
                    'title'      => $lastDraftArticle->title,
                    'updated_at' => $lastDraftArticle->updated_at,
                ] : null,
                $lastDraftProgram ? [
                    'type'       => 'program',
                    'id'         => $lastDraftProgram->id,
                    'title'      => $lastDraftProgram->title,
                    'updated_at' => $lastDraftProgram->updated_at,
                ] : null,
            ])->filter()->sortByDesc('updated_at')->first();
        }

        $todoArticles = Article::query()
            ->whereIn('status', ['draft', 'review'])
            ->latest('updated_at')
            ->limit(6)
            ->get(['id', 'title', 'status', 'category', 'thumbnail_path', 'updated_at']);

        $todoPrograms = Program::query()
            ->whereIn('status', ['draft'])
            ->latest('updated_at')
            ->limit(4)
            ->get(['id', 'title', 'status', 'category', 'thumbnail_path', 'updated_at']);

        $todoItems = collect()
            ->concat($todoArticles->map(function (Article $article) {
                $status = $article->status === 'review' ? 'review' : 'draft';
                $reason = $status === 'review'
                    ? 'Menunggu review/persetujuan.'
                    : 'Selesaikan draft sebelum dipublikasikan.';

                if (empty($article->thumbnail_path)) {
                    $reason = $reason.' Tambahkan thumbnail.';
                }

                return [
                    'type'       => 'article',
                    'id'         => $article->id,
                    'title'      => $article->title,
                    'status'     => $status,
                    'category'   => $article->category,
                    'updated_at' => $article->updated_at,
                    'reason'     => $reason,
                ];
            }))
            ->concat($todoPrograms->map(function (Program $program) {
                $reason = 'Lengkapi detail program dan aktifkan jika sudah siap.';

                if (empty($program->thumbnail_path)) {
                    $reason = $reason.' Tambahkan thumbnail.';
                }

                return [
                    'type'       => 'program',
                    'id'         => $program->id,
                    'title'      => $program->title,
                    'status'     => $program->status,
                    'category'   => $program->category,
                    'updated_at' => $program->updated_at,
                    'reason'     => $reason,
                ];
            }))
            ->sortByDesc('updated_at')
            ->values()
            ->take(10);

        $recentArticleActivities = Article::latest('updated_at')
            ->limit(5)
            ->get(['id', 'title', 'status', 'published_at', 'created_at', 'updated_at']);

        $recentProgramActivities = Program::latest('updated_at')
            ->limit(5)
            ->get(['id', 'title', 'status', 'created_at', 'updated_at']);

        $activities = collect()
            ->concat($recentArticleActivities->map(function (Article $article) {
                $action = $article->created_at->equalTo($article->updated_at) ? 'created' : 'updated';
                if ($article->status === 'published' && $article->published_at) {
                    $action = 'published';
                }

                return [
                    'type'       => 'article',
                    'id'         => $article->id,
                    'title'      => $article->title,
                    'status'     => $article->status,
                    'action'     => $action,
                    'occurred_at'=> $article->updated_at,
                ];
            }))
            ->concat($recentProgramActivities->map(function (Program $program) {
                $action = $program->created_at->equalTo($program->updated_at) ? 'created' : 'updated';

                return [
                    'type'        => 'program',
                    'id'          => $program->id,
                    'title'       => $program->title,
                    'status'      => $program->status,
                    'action'      => $action,
                    'occurred_at' => $program->updated_at,
                ];
            }))
            ->sortByDesc('occurred_at')
            ->values()
            ->take(5);

        $latestPublicArticles = Article::published()
            ->limit(4)
            ->get(['id', 'slug', 'title', 'excerpt', 'thumbnail_path', 'category', 'published_at']);

        $latestActivePrograms = Program::active()
            ->orderByDesc('is_highlight')
            ->orderByDesc('updated_at')
            ->limit(4)
            ->get(['id', 'slug', 'title', 'short_description', 'thumbnail_path', 'category', 'is_highlight', 'target_amount', 'collected_amount', 'updated_at']);

        $landingKeys = ['landing.hero_title', 'landing.hero_cta_text'];
        $landingSettings = Setting::query()->whereIn('key', $landingKeys)->get()->keyBy('key');

        $heroTitleSetting = $landingSettings->get('landing.hero_title');
        $ctaTextSetting = $landingSettings->get('landing.hero_cta_text');
        $landingUpdatedAt = $landingSettings->max('updated_at');

        $heroTitleDefault = 'Sebagai Pintu Pemberdayaan';
        $ctaTextDefault = 'Mulai Donasi';

        $heroTitle = $heroTitleSetting?->value ?: $heroTitleDefault;
        $ctaText = $ctaTextSetting?->value ?: $ctaTextDefault;
        $landingSource = ($heroTitleSetting || $ctaTextSetting) ? 'settings' : 'default';

        $notificationsRaw = Setting::getValue('management.editor_notifications', '[]');
        $notifications = [];
        if (is_string($notificationsRaw)) {
            $decoded = json_decode($notificationsRaw, true);
            if (is_array($decoded)) {
                $notifications = array_values(array_filter($decoded, 'is_array'));
            }
        }

        return [
            'stats' => [
                'articles' => [
                    'draft'     => $articlesDraft,
                    'review'    => $articlesReview,
                    'published' => $articlesPublished,
                    'total'     => $articlesDraft + $articlesReview + $articlesPublished,
                ],
                'programs' => [
                    'active'   => $programsActive,
                    'inactive' => $programsInactive,
                    'total'    => $programsActive + $programsInactive,
                ],
                'programs_highlight'   => Program::highlight()->count(),
                'partners_active'     => Partner::where('is_active', true)->count(),
                'organization_members' => OrganizationMember::count(),
            ],
            'quick_actions' => [
                'last_draft' => $lastDraft,
            ],
            'todo' => [
                'items' => $todoItems,
            ],
            'activities' => $activities,
            'public_preview' => [
                'articles' => $latestPublicArticles,
                'programs' => $latestActivePrograms,
            ],
            'landing' => [
                'hero_title' => $heroTitle,
                'cta_text'   => $ctaText,
                'updated_at' => $landingUpdatedAt,
                'source'     => $landingSource,
            ],
            'notifications' => $notifications,
            'recent_articles' => Article::orderByDesc('created_at')
                ->limit(6)
                ->get(['id', 'title', 'slug', 'status', 'published_at', 'created_at', 'updated_at']),
            'recent_programs' => Program::orderByDesc('created_at')
                ->limit(6)
                ->get(['id', 'title', 'slug', 'status', 'is_highlight', 'created_at', 'updated_at']),
        ];
    }
}
