<?php

namespace App\Http\Controllers\Api\Frontend;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\OrganizationMember;
use App\Models\Partner;
use Illuminate\Support\Facades\Cache;

class OrganizationController extends Controller
{
    public function index()
    {
        $data = Cache::remember('frontend.organization_info', 600, function () {
            return [
                'structure'     => OrganizationMember::active()
                    ->orderBy('order', 'asc')
                    ->orderBy('id', 'asc')
                    ->get(['id', 'name', 'position_title', 'position_title_en', 'group', 'group_en', 'order', 'photo_path', 'is_active']),
                'partners'      => Partner::active()->get(),
                'bank_accounts' => BankAccount::visible()->get(),
            ];
        });

        return response()->json($data);
    }
}
