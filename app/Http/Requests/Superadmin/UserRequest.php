<?php

namespace App\Http\Requests\Superadmin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user') ? $this->route('user')->id : null;

        return [
            'name'       => ['required', 'string', 'max:255'],
            'email'      => ['required', 'email', 'max:255', Rule::unique('users')->ignore($userId)],
            'phone'      => ['nullable', 'string', 'max:30'],
            'password'   => [$userId ? 'nullable' : 'required', 'string', 'min:8'],
            'is_active'  => ['required', 'boolean'],
            'role_label'  => ['nullable', 'string', 'max:100'],
            'roles'       => ['nullable', 'array'],
            'roles.*'     => ['string', 'exists:roles,name'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ];
    }
}
