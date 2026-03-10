<?php

namespace App\Http\Requests\Frontend;

use Illuminate\Foundation\Http\FormRequest;

class StoreSuggestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'         => ['nullable', 'string', 'max:255'],
            'phone'        => ['required', 'string', 'max:30'],
            'category'     => ['required', 'string', 'max:100'],
            'message'      => ['required', 'string'],
            'is_anonymous' => ['boolean'],
        ];
    }
}
