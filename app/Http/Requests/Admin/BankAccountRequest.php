<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class BankAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'bank_name'        => ['required', 'string', 'max:100'],
            'account_number'   => ['nullable', 'string', 'max:50'],
            'account_name'     => ['nullable', 'string', 'max:150'],
            'is_visible_public'=> ['required', 'boolean'],
            'order'            => ['required', 'integer', 'min:0'],
            'category'         => ['nullable', 'string', 'max:50'],
            'type'             => ['nullable', 'string', 'in:text,image_only,domestic,international'],
            'image'            => ['nullable', 'image', 'max:2048'],
            'qris_image'       => ['nullable', 'image', 'max:2048'],
        ];
    }
}
