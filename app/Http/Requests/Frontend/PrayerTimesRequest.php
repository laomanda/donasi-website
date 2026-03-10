<?php

namespace App\Http\Requests\Frontend;

use Illuminate\Foundation\Http\FormRequest;

class PrayerTimesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'city'    => ['required', 'string', 'max:100'],
            'country' => ['required', 'string', 'max:5'],
            'method'  => ['nullable', 'integer', 'min:0', 'max:99'],
        ];
    }
}
