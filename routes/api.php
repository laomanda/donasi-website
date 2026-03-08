<?php

use App\Http\Controllers\Api\Admin\ArticleController as AdminArticleController;
use App\Http\Controllers\Api\Admin\BankAccountController as AdminBankAccountController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\DonationController as AdminDonationController;
use App\Http\Controllers\Api\Admin\EditorTaskController as AdminEditorTaskController;
use App\Http\Controllers\Api\Admin\OrganizationController as AdminOrganizationController;
use App\Http\Controllers\Api\Admin\PartnerController as AdminPartnerController;
use App\Http\Controllers\Api\Admin\PickupRequestController as AdminPickupRequestController;
use App\Http\Controllers\Api\Admin\ProgramController as AdminProgramController;
use App\Http\Controllers\Api\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\Api\Admin\ZiswafConsultationController as AdminZiswafConsultationController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\Admin\AllocationController as AdminAllocationController;
use App\Http\Controllers\Api\Admin\SuggestionController as AdminSuggestionController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\PasswordController;
use App\Http\Controllers\Api\Editor\ArticleController as EditorArticleController;
use App\Http\Controllers\Api\Editor\DashboardController as EditorDashboardController;
use App\Http\Controllers\Api\Editor\OrganizationController as EditorOrganizationController;
use App\Http\Controllers\Api\Editor\PartnerController as EditorPartnerController;
use App\Http\Controllers\Api\Editor\ProgramController as EditorProgramController;
use App\Http\Controllers\Api\Editor\UploadController as EditorUploadController;
use App\Http\Controllers\Api\Editor\EditorTaskStreamController;
use App\Http\Controllers\Api\Frontend\ArticleController as FrontendArticleController;
use App\Http\Controllers\Api\Frontend\BannerController as FrontendBannerController;
use App\Http\Controllers\Api\Frontend\ConsultationController as FrontendConsultationController;
use App\Http\Controllers\Api\Frontend\DonationController as FrontendDonationController;
use App\Http\Controllers\Api\Frontend\DonationConfirmationController as FrontendDonationConfirmationController;
use App\Http\Controllers\Api\Frontend\HomeController;
use App\Http\Controllers\Api\Frontend\OrganizationController as FrontendOrganizationController;
use App\Http\Controllers\Api\Frontend\PickupRequestController as FrontendPickupRequestController;
use App\Http\Controllers\Api\Frontend\ProgramController as FrontendProgramController;
use App\Http\Controllers\Api\Frontend\SettingController as FrontendSettingController;
use App\Http\Controllers\Api\Frontend\SuggestionController as FrontendSuggestionController;
use App\Http\Controllers\Api\Admin\BannerController as AdminBannerController;
use App\Http\Controllers\Api\Editor\BannerController as EditorBannerController;
use App\Http\Controllers\Api\PrayerTimesController;
use App\Http\Controllers\Api\Reports\DonationReportController;
use App\Http\Controllers\Api\Editor\EditorTaskController as EditorEditorTaskController;
use App\Http\Controllers\Api\Superadmin\DashboardController as SuperadminDashboardController;
use App\Http\Controllers\Api\Superadmin\UserController as SuperadminUserController;
use App\Http\Controllers\Api\Mitra\MitraDashboardController;
use App\Http\Controllers\Api\Mitra\MitraAllocationController;
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

        // Register Mitra
        Route::post('mitra/register', [AuthController::class, 'registerMitra']);
        Route::post('google', [AuthController::class, 'googleLogin']);
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
        Route::post('suggestions', [FrontendSuggestionController::class, 'store']);

        Route::get('programs', [FrontendProgramController::class, 'index']);
        Route::get('programs/{slug}', [FrontendProgramController::class, 'show']);

        Route::get('articles', [FrontendArticleController::class, 'index']);
        Route::get('articles/{slug}', [FrontendArticleController::class, 'show']);

        Route::get('organization', [FrontendOrganizationController::class, 'index']);
        Route::get('prayer-times', [PrayerTimesController::class, 'index'])->middleware('throttle:20,1');

        Route::get('donations/summary', [FrontendDonationController::class, 'summary']);
        Route::post('donations', [FrontendDonationController::class, 'store']);
        Route::post('donations/{donation}/check-status', [FrontendDonationController::class, 'checkStatus']);
        Route::post('donations/check-by-order', [FrontendDonationController::class, 'checkStatusByOrder']);
        Route::post('donations/{donation}/cancel', [FrontendDonationController::class, 'cancel']);
        Route::post('donations/confirm', [FrontendDonationConfirmationController::class, 'store']);
        Route::post('pickups', [FrontendPickupRequestController::class, 'store']);
        Route::post('consultations', [FrontendConsultationController::class, 'store']);
        Route::get('tags', [\App\Http\Controllers\Api\Frontend\TagController::class, 'index']);
    });

    /*
    |--------------------------------------------------------------------------
    | MIDTRANS WEBHOOK
    |--------------------------------------------------------------------------
    */
    Route::post('midtrans/webhook', MidtransWebhookController::class);

    Route::get('editor/tasks/stream', EditorTaskStreamController::class);

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

            Route::get('editor-tasks/editors', [AdminEditorTaskController::class, 'editors']);
            Route::apiResource('editor-tasks', AdminEditorTaskController::class)->only(['index', 'show']);
            Route::middleware('role:admin|superadmin')->group(function () {
                Route::post('donations/manual', [AdminDonationController::class, 'storeManual']);
                Route::patch('donations/{donation}/status', [AdminDonationController::class, 'updateStatus']);
                Route::post('donations/{donation}/send-whatsapp', [AdminDonationController::class, 'sendWhatsapp']);
                Route::delete('donations/{donation}', [AdminDonationController::class, 'destroy']);
                
                Route::apiResource('editor-tasks', AdminEditorTaskController::class)->except(['index', 'show']);
                Route::delete('editor-tasks/{editor_task}/attachments/{attachment}', [AdminEditorTaskController::class, 'destroyAttachment']);
                
                Route::apiResource('pickup-requests', AdminPickupRequestController::class)->except(['index', 'show']);
                Route::patch('pickup-requests/{pickup_request}/status', [AdminPickupRequestController::class, 'updateStatus']);
                
                Route::apiResource('suggestions', AdminSuggestionController::class)->only(['index', 'show', 'destroy']);
                Route::patch('suggestions/{suggestion}/status', [AdminSuggestionController::class, 'updateStatus']);
                
                Route::apiResource('consultations', AdminZiswafConsultationController::class)
                    ->parameters(['consultations' => 'ziswaf_consultation'])
                    ->except(['index', 'show']);
                Route::patch('consultations/{ziswaf_consultation}/status', [AdminZiswafConsultationController::class, 'updateStatus']);


                Route::apiResource('partners', AdminPartnerController::class)->except(['index', 'show']);
                Route::apiResource('organization-members', AdminOrganizationController::class)->except(['index', 'show']);
                
                Route::put('settings', [AdminSettingController::class, 'update']);
                Route::apiResource('banners', AdminBannerController::class)->except(['index', 'show']);

                // Allocations (Mitra Wallet)
                Route::get('users/{user}/allocatable-programs', [AdminAllocationController::class, 'getAllocatablePrograms']);
                Route::apiResource('allocations', AdminAllocationController::class)->only(['store']);
                
                // Users (for dropdowns etc)
                Route::get('users', [AdminUserController::class, 'index']);
            });

            Route::apiResource('programs', AdminProgramController::class)->only(['index', 'show']);
            Route::apiResource('banners', AdminBannerController::class)->only(['index']);
            Route::apiResource('partners', AdminPartnerController::class)->only(['index']);
            Route::apiResource('organization-members', AdminOrganizationController::class)->only(['index', 'show']);

            Route::get('donations', [AdminDonationController::class, 'index']);
            Route::get('donations/{donation}', [AdminDonationController::class, 'show']);
            Route::get('donations/{donation}/export', [AdminDonationController::class, 'export']);
            
            
            Route::get('reports/donations', [DonationReportController::class, 'index']);
            Route::get('reports/donations/export', [DonationReportController::class, 'export']);
            
            Route::apiResource('pickup-requests', AdminPickupRequestController::class)->only(['index', 'show']);
            Route::apiResource('consultations', AdminZiswafConsultationController::class)
                ->parameters(['consultations' => 'ziswaf_consultation'])
                ->only(['index', 'show']);

            Route::get('settings', [AdminSettingController::class, 'index']);
            Route::get('allocations', [AdminAllocationController::class, 'index']);
        });

    /*
    |--------------------------------------------------------------------------
    | MITRA (Role: mitra)
    |--------------------------------------------------------------------------
    |
    */
    Route::middleware(['auth:sanctum', 'is_active', 'role:mitra'])
        ->prefix('mitra')
        ->name('mitra.')
        ->group(function () {
            Route::get('dashboard', [MitraDashboardController::class, 'index']);
            Route::get('allocations/export/pdf', [MitraAllocationController::class, 'downloadPdf']);
            Route::get('allocations', [MitraAllocationController::class, 'index']);
            Route::get('donations', [\App\Http\Controllers\Api\Mitra\MitraDonationController::class, 'index']);
            Route::get('donations/export/pdf', [\App\Http\Controllers\Api\Mitra\MitraDonationController::class, 'exportPdf']);
            Route::get('donations/{donation}/export', [\App\Http\Controllers\Api\Mitra\MitraDonationController::class, 'export']);
        });

    /*
    |--------------------------------------------------------------------------
    | EDITOR (Role: editor, admin, superadmin)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['auth:sanctum', 'is_active', 'role:editor|superadmin'])
        ->prefix('editor')
        ->name('editor.')
        ->group(function () {
            Route::get('dashboard', EditorDashboardController::class)->name('dashboard');

            Route::post('uploads/image', [EditorUploadController::class, 'storeImage']);

            Route::get('programs/categories', [EditorProgramController::class, 'categories']);
            Route::apiResource('programs', EditorProgramController::class);
            Route::get('articles/categories', [EditorArticleController::class, 'categories']);
            Route::apiResource('articles', EditorArticleController::class);
            Route::apiResource('banners', EditorBannerController::class)->except('show');
            Route::apiResource('partners', EditorPartnerController::class)->except('show');
            Route::apiResource('organization-members', EditorOrganizationController::class);
            Route::get('tasks', [EditorEditorTaskController::class, 'index']);
            Route::get('tasks/{editor_task}', [EditorEditorTaskController::class, 'show']);
            Route::patch('tasks/{editor_task}', [EditorEditorTaskController::class, 'update']);
            Route::apiResource('bank-accounts', AdminBankAccountController::class);
            Route::apiResource('tags', \App\Http\Controllers\Api\Admin\TagController::class);
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
