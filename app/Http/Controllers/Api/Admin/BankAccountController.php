<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use Illuminate\Http\Request;

class BankAccountController extends Controller
{
    public function index()
    {
        return response()->json(BankAccount::orderBy('order')->get());
    }

    public function store(Request $request)
    {
        $data = $this->validatePayload($request);

        $account = BankAccount::create($data);

        return response()->json($account, 201);
    }

    public function update(Request $request, BankAccount $bankAccount)
    {
        $data = $this->validatePayload($request);

        $bankAccount->update($data);

        return response()->json($bankAccount->refresh());
    }

    public function destroy(BankAccount $bankAccount)
    {
        $bankAccount->delete();

        return response()->json(['message' => 'Bank account deleted.']);
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'bank_name'        => ['required', 'string', 'max:100'],
            'account_number'   => ['required', 'string', 'max:50'],
            'account_name'     => ['required', 'string', 'max:150'],
            'is_visible_public'=> ['required', 'boolean'],
            'order'            => ['required', 'integer', 'min:0'],
        ]);
    }
}
