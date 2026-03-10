<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class AllocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id'     => ['required', 'exists:users,id'],
            'program_id'  => ['nullable', 'exists:programs,id'],
            'amount'      => ['required', 'numeric', 'min:0'],
            'description' => ['required', 'string'],
            'proof'       => ['nullable', 'image', 'max:2048'],
        ];
    }
}
