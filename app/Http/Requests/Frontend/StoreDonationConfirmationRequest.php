<?php

namespace App\Http\Requests\Frontend;

use Illuminate\Foundation\Http\FormRequest;

class StoreDonationConfirmationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'program_id'          => ['nullable', 'exists:programs,id'],
            'donor_name'          => ['required', 'string', 'max:255'],
            'donor_phone'         => ['required', 'string', 'max:30'],
            'donor_email'         => ['nullable', 'email'],
            'amount'              => ['required', 'numeric', 'min:1000'],
            'bank_destination'    => ['required', 'string', 'max:255'],
            'purpose'             => ['required', 'string', 'max:255'],
            'notes'               => ['nullable', 'string'],
            'proof'               => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:10240'],
        ];
    }
}
