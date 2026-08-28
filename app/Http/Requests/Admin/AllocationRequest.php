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
            'user_id'      => ['nullable', 'exists:users,id'],
            'donation_id'  => ['nullable', 'exists:donations,id'],
            'program_id'   => ['nullable', 'exists:programs,id'],
            'amount'       => ['required', 'numeric', 'min:1'],
            'description'  => ['required', 'string'],
            'proof'        => ['nullable', 'image', 'max:2048'],
            'allocated_at' => ['nullable', 'date'],
        ];
    }
}
