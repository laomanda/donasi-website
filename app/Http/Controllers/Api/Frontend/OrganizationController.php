<?php

namespace App\Http\Controllers\Api\Frontend;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\OrganizationMember;
use App\Models\Partner;

class OrganizationController extends Controller
{
    public function index()
    {
        return response()->json([
            'structure'     => OrganizationMember::active()->get(),
            'partners'      => Partner::active()->get(),
            'bank_accounts' => BankAccount::visible()->get(),
        ]);
    }
}
