<?php

namespace App\Http\Requests\Admin\EditorTask;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEditorTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Adjust this if specific permission is needed
        return $this->user() && ($this->user()->hasRole('admin') || $this->user()->hasRole('superadmin'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:180'],
            'description' => ['nullable', 'string'],
            'priority' => ['nullable', Rule::in(['low', 'normal', 'high'])],
            'status' => ['nullable', Rule::in(['open', 'in_progress', 'done', 'cancelled'])],
            'cancel_reason' => [
                'nullable', 
                'string', 
                'max:500',
                Rule::requiredIf(fn () => $this->input('status') === 'cancelled')
            ],
            'due_at' => ['nullable', 'date'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
            'attachments' => ['nullable', 'array', 'max:5'],
            'attachments.*' => ['file', 'max:10240', 'mimes:pdf,doc,docx,xls,xlsx,png,jpg,jpeg,zip'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'cancel_reason.required_if' => 'Alasan pembatalan wajib diisi jika status dibatalkan.',
        ];
    }

    protected function prepareForValidation()
    {
        if ($this->has('status') && $this->input('status') !== 'cancelled') {
            $this->merge(['cancel_reason' => null]);
        }
    }
}
