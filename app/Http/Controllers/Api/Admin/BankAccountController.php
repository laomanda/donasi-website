<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Storage;

class BankAccountController extends Controller
{
    public function index()
    {
        return response()->json(BankAccount::orderBy('order', 'asc')->get());
    }

    public function store(Request $request)
    {
        $data = $this->validatePayload($request);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('banks', 'public');
        }

        $account = BankAccount::create($data);

        return response()->json($account, 201);
    }

    public function update(Request $request, BankAccount $bankAccount)
    {
        // Validation slightly different for update (sometimes image is not sent)
        $data = $this->validatePayload($request);

        if ($request->hasFile('image')) {
            // Delete old image
            if ($bankAccount->image_path && Storage::disk('public')->exists($bankAccount->image_path)) {
                Storage::disk('public')->delete($bankAccount->image_path);
            }
            $data['image_path'] = $request->file('image')->store('banks', 'public');
        }

        $bankAccount->update($data);

        return response()->json($bankAccount->refresh());
    }

    public function destroy(BankAccount $bankAccount)
    {
        if ($bankAccount->image_path && Storage::disk('public')->exists($bankAccount->image_path)) {
            Storage::disk('public')->delete($bankAccount->image_path);
        }
        $bankAccount->delete();

        return response()->json(['message' => 'Bank account deleted.']);
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'bank_name'        => ['required', 'string', 'max:100'],
            'account_number'   => ['nullable', 'string', 'max:50'],
            'account_name'     => ['nullable', 'string', 'max:150'],
            'is_visible_public'=> ['required', 'boolean'], // or string 1/0 if FormData
            'order'            => ['required', 'integer', 'min:0'],
            'category'         => ['nullable', 'string', 'max:50'],
            'type'             => ['nullable', 'string', 'in:text,image_only'],
            'image'            => ['nullable', 'image', 'max:2048'], // 2MB max
        ]);
    }
}
