<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreManualDonationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'program_id'      => ['nullable', 'exists:programs,id'],
            'donor_name'      => ['required', 'string', 'max:255'],
            'donor_email'     => ['nullable', 'email'],
            'donor_phone'     => ['nullable', 'string', 'max:50'],
            'amount'          => ['required', 'numeric', 'min:1'],
            'is_anonymous'    => ['required', 'boolean'],
            'payment_method'  => ['required', 'string', 'max:100'],
            'payment_channel' => ['nullable', 'string', 'max:255'],
            'notes'           => ['nullable', 'string'],
            'manual_proof_path' => ['nullable', 'string', 'max:255'],
        ];
    }
}
