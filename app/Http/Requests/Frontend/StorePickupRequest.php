<?php

namespace App\Http\Requests\Frontend;

use Illuminate\Foundation\Http\FormRequest;

class StorePickupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'donor_name'     => ['required', 'string', 'max:255'],
            'donor_phone'    => ['required', 'string', 'max:30'],
            'address_full'   => ['required', 'string'],
            'city'           => ['required', 'string', 'max:100'],
            'district'       => ['required', 'string', 'max:100'],
            'zakat_type'     => ['required', 'string', 'max:100'],
            'estimation'     => ['nullable', 'string', 'max:255'],
            'preferred_time' => ['nullable', 'string', 'max:255'],
        ];
    }
}
