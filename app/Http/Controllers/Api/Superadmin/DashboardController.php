<?php

namespace App\Http\Controllers\Api\Superadmin;

use App\Http\Controllers\Api\Admin\DashboardController as BaseDashboardController;
use App\Models\Article;
use App\Models\Donation;
use App\Models\Program;
use App\Models\User;
use Spatie\Permission\Models\Role;

class DashboardController extends BaseDashboardController
{
    protected function buildData(): array
    {
        return [
            'stats' => [
                'users_total'     => User::count(),
                'users_active'    => User::where('is_active', true)->count(),
                'users_inactive'  => User::where('is_active', false)->count(),
                'programs_total'  => Program::count(),
                'articles_total'  => Article::count(),
                'donations_paid'  => Donation::paid()->sum('amount'),
                'donations_pending' => Donation::pending()->count(),
            ],
            'roles' => Role::withCount('users')->get(),
            'latest_users' => User::orderByDesc('created_at')
                ->limit(10)
                ->get(['id', 'name', 'email', 'is_active', 'created_at']),
            'top_programs' => Program::withCount(['donations as donations_paid' => function ($query) {
                    $query->paid();
                }])
                ->orderByDesc('donations_paid')
                ->limit(5)
                ->get(['id', 'title', 'status']),
        ];
    }
}
