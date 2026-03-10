<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class OrganizationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'           => ['required', 'string', 'max:255'],
            'position_title' => ['required', 'string', 'max:255'],
            'position_title_en' => ['nullable', 'string', 'max:255'],
            'group'          => ['required', 'string', 'max:100'],
            'group_en'       => ['nullable', 'string', 'max:100'],
            'photo_path'     => ['nullable', 'string', 'max:255'],
            'email'          => ['nullable', 'email'],
            'phone'          => ['nullable', 'string', 'max:30'],
            'show_contact'   => ['required', 'boolean'],
            'order'          => ['required', 'integer', 'min:0'],
            'is_active'      => ['required', 'boolean'],
        ];
    }
}
