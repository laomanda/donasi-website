<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Http\Requests\Admin\BankAccountRequest;
use App\Services\BankAccountService;

class BankAccountController extends Controller
{
    public function __construct(private BankAccountService $bankAccountService)
    {
    }

    public function index()
    {
        return response()->json(BankAccount::orderBy('order', 'asc')->get());
    }

    public function store(BankAccountRequest $request)
    {
        $account = $this->bankAccountService->storeAccount(
            $request->validated(),
            $request->file('image'),
            $request->file('qris_image')
        );

        return response()->json($account, 201);
    }

    public function update(BankAccountRequest $request, BankAccount $bankAccount)
    {
        $updatedAccount = $this->bankAccountService->updateAccount(
            $bankAccount,
            $request->validated(),
            $request->file('image'),
            $request->file('qris_image')
        );

        return response()->json($updatedAccount);
    }

    public function destroy(BankAccount $bankAccount)
    {
        $this->bankAccountService->deleteAccount($bankAccount);
        return response()->json(['message' => 'Bank account deleted.']);
    }
}
