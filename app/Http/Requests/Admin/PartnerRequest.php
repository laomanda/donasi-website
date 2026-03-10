<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class PartnerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $requireOrder = $this->isMethod('post') ? 'required' : 'sometimes';

        return [
            'name'        => ['required', 'string', 'max:255'],
            'name_en'     => ['nullable', 'string', 'max:255'],
            'logo_path'   => ['nullable', 'string', 'max:255'],
            'url'         => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'order'       => [$requireOrder, 'integer', 'min:0'],
            'is_active'   => ['required', 'boolean'],
        ];
    }
}
