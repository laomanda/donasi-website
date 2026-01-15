<?php

use App\Http\Controllers\Api\Admin\ArticleController as AdminArticleController;
use App\Http\Controllers\Api\Admin\BankAccountController as AdminBankAccountController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\DonationController as AdminDonationController;
use App\Http\Controllers\Api\Admin\OrganizationController as AdminOrganizationController;
use App\Http\Controllers\Api\Admin\PartnerController as AdminPartnerController;
use App\Http\Controllers\Api\Admin\PickupRequestController as AdminPickupRequestController;
use App\Http\Controllers\Api\Admin\ProgramController as AdminProgramController;
use App\Http\Controllers\Api\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\Api\Admin\ZiswafConsultationController as AdminZiswafConsultationController;
use App\Http\Controllers\Api\Admin\ServiceRequestController as AdminServiceRequestController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\PasswordController;
use App\Http\Controllers\Api\Editor\ArticleController as EditorArticleController;
use App\Http\Controllers\Api\Editor\DashboardController as EditorDashboardController;
use App\Http\Controllers\Api\Editor\OrganizationController as EditorOrganizationController;
use App\Http\Controllers\Api\Editor\PartnerController as EditorPartnerController;
use App\Http\Controllers\Api\Editor\ProgramController as EditorProgramController;
use App\Http\Controllers\Api\Editor\UploadController as EditorUploadController;
use App\Http\Controllers\Api\Frontend\ArticleController as FrontendArticleController;
use App\Http\Controllers\Api\Frontend\BannerController as FrontendBannerController;
use App\Http\Controllers\Api\Frontend\ConsultationController as FrontendConsultationController;
use App\Http\Controllers\Api\Frontend\DonationController as FrontendDonationController;
use App\Http\Controllers\Api\Frontend\DonationConfirmationController as FrontendDonationConfirmationController;
use App\Http\Controllers\Api\Frontend\HomeController;
use App\Http\Controllers\Api\Frontend\OrganizationController as FrontendOrganizationController;
use App\Http\Controllers\Api\Frontend\PickupRequestController as FrontendPickupRequestController;
use App\Http\Controllers\Api\Frontend\ServiceRequestController as FrontendServiceRequestController;
use App\Http\Controllers\Api\Frontend\ProgramController as FrontendProgramController;
use App\Http\Controllers\Api\Frontend\SettingController as FrontendSettingController;
use App\Http\Controllers\Api\Admin\BannerController as AdminBannerController;
use App\Http\Controllers\Api\Editor\BannerController as EditorBannerController;
use App\Http\Controllers\Api\PrayerTimesController;
use App\Http\Controllers\Api\Reports\DonationReportController;
use App\Http\Controllers\Api\Superadmin\DashboardController as SuperadminDashboardController;
use App\Http\Controllers\Api\Superadmin\UserController as SuperadminUserController;
use App\Http\Controllers\Api\Webhooks\MidtransWebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Semua endpoint API (diprefix /api) taruh di sini.
| Nanti kita pakai buat auth, program, donasi, dll.
|
*/

Route::prefix('v1')->group(function () {
    Route::get('/ping', function () {
        return response()->json([
            'message' => 'pong',
        ]);
    });

    Route::post('service-requests', [FrontendServiceRequestController::class, 'store']);

    /*
    |--------------------------------------------------------------------------
    | AUTH
    |--------------------------------------------------------------------------
    */
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me', [AuthController::class, 'me']);
            Route::put('password', [PasswordController::class, 'update']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | PUBLIC FRONTEND API (Tanpa Auth)
    |--------------------------------------------------------------------------
    */
    Route::middleware('throttle:60,1')->group(function () {
        Route::get('home', HomeController::class);
        Route::get('banners', [FrontendBannerController::class, 'index']);
        Route::get('settings', [FrontendSettingController::class, 'index']);

        Route::get('programs', [FrontendProgramController::class, 'index']);
        Route::get('programs/{slug}', [FrontendProgramController::class, 'show']);

        Route::get('articles', [FrontendArticleController::class, 'index']);
        Route::get('articles/{slug}', [FrontendArticleController::class, 'show']);

        Route::get('organization', [FrontendOrganizationController::class, 'index']);
        Route::get('prayer-times', [PrayerTimesController::class, 'index'])->middleware('throttle:20,1');

        Route::get('donations/summary', [FrontendDonationController::class, 'summary']);
        Route::post('donations', [FrontendDonationController::class, 'store']);
        Route::post('donations/confirm', [FrontendDonationConfirmationController::class, 'store']);
        Route::post('pickups', [FrontendPickupRequestController::class, 'store']);
        Route::post('consultations', [FrontendConsultationController::class, 'store']);
    });

    /*
    |--------------------------------------------------------------------------
    | MIDTRANS WEBHOOK
    |--------------------------------------------------------------------------
    */
    Route::post('midtrans/webhook', MidtransWebhookController::class);

    /*
    |--------------------------------------------------------------------------
    | ADMIN (Role: admin atau superadmin)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['auth:sanctum', 'is_active', 'role:admin|superadmin'])
        ->prefix('admin')
        ->name('admin.')
        ->group(function () {
            Route::get('dashboard', AdminDashboardController::class)->name('dashboard');

            Route::apiResource('programs', AdminProgramController::class);
            Route::patch('programs/{program}/status', [AdminProgramController::class, 'updateStatus']);
            Route::patch('programs/{program}/highlight', [AdminProgramController::class, 'toggleHighlight']);
            Route::apiResource('banners', AdminBannerController::class)->except('show');

            Route::get('donations', [AdminDonationController::class, 'index']);
            Route::post('donations/manual', [AdminDonationController::class, 'storeManual']);
            Route::get('donations/{donation}', [AdminDonationController::class, 'show']);
            Route::patch('donations/{donation}/status', [AdminDonationController::class, 'updateStatus']);
            Route::delete('donations/{donation}', [AdminDonationController::class, 'destroy']);
            Route::get('reports/donations', [DonationReportController::class, 'index']);
            Route::get('reports/donations/export', [DonationReportController::class, 'export']);

            Route::apiResource('pickup-requests', AdminPickupRequestController::class);
            Route::patch('pickup-requests/{pickup_request}/status', [AdminPickupRequestController::class, 'updateStatus']);

            Route::apiResource('consultations', AdminZiswafConsultationController::class)
                ->parameters(['consultations' => 'ziswaf_consultation']);
            Route::patch('consultations/{ziswaf_consultation}/status', [AdminZiswafConsultationController::class, 'updateStatus']);

            Route::apiResource('service-requests', AdminServiceRequestController::class);
            Route::patch('service-requests/{service_request}/status', [AdminServiceRequestController::class, 'updateStatus']);

            Route::apiResource('articles', AdminArticleController::class);
            Route::post('articles/{article}/publish', [AdminArticleController::class, 'publish']);

            Route::apiResource('partners', AdminPartnerController::class)->except('show');
            Route::apiResource('organization-members', AdminOrganizationController::class);
            Route::apiResource('bank-accounts', AdminBankAccountController::class)->except('show');

            Route::get('settings', [AdminSettingController::class, 'index']);
            Route::put('settings', [AdminSettingController::class, 'update']);
        });

    /*
    |--------------------------------------------------------------------------
    | EDITOR (Role: editor, admin, superadmin)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['auth:sanctum', 'is_active', 'role:editor|admin|superadmin'])
        ->prefix('editor')
        ->name('editor.')
        ->group(function () {
            Route::get('dashboard', EditorDashboardController::class)->name('dashboard');

            Route::post('uploads/image', [EditorUploadController::class, 'storeImage']);

            Route::apiResource('programs', EditorProgramController::class);
            Route::apiResource('articles', EditorArticleController::class);
            Route::apiResource('banners', EditorBannerController::class)->except('show');
            Route::apiResource('partners', EditorPartnerController::class)->except('show');
            Route::apiResource('organization-members', EditorOrganizationController::class);
        });

    /*
    |--------------------------------------------------------------------------
    | SUPERADMIN (Role: superadmin)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['auth:sanctum', 'is_active', 'role:superadmin'])
        ->prefix('superadmin')
        ->name('superadmin.')
        ->group(function () {
            Route::get('dashboard', SuperadminDashboardController::class)->name('dashboard');

            Route::get('roles', [SuperadminUserController::class, 'roles']);
            Route::apiResource('users', SuperadminUserController::class);
            Route::get('reports/donations', [DonationReportController::class, 'index']);
            Route::get('reports/donations/export', [DonationReportController::class, 'export']);
        });
});
