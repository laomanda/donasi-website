<?php

namespace App\Http\Requests\Frontend;

use Illuminate\Foundation\Http\FormRequest;

class StoreMidtransDonationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'program_id'   => ['nullable', 'exists:programs,id'],
            'donor_name'   => ['required', 'string', 'max:255'],
            'donor_email'  => ['nullable', 'email'],
            'donor_phone'  => ['required', 'string', 'max:30'],
            'amount'       => ['required', 'numeric', 'min:1000'],
            'is_anonymous' => ['required', 'boolean'],
            'notes'        => ['nullable', 'string'],
        ];
    }
}
