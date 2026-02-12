<?php

namespace App\Http\Requests\Admin\EditorTask;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEditorTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
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
            'title' => ['sometimes', 'string', 'max:180'],
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
        // Logic to clear cancel_reason if status is not cancelled
        // Or if status is changing away from cancelled (if handled by API consumer)
        if ($this->has('status') && $this->input('status') !== 'cancelled') {
             $this->merge(['cancel_reason' => null]);
        } elseif ($this->has('cancel_reason') && !$this->has('status')) {
             // If sending cancel_reason but not status, check existing model status? 
             // Ideally API consumer sends consistent data.
             // We'll let the controller handle complex state transitions if needed, 
             // but here cleaning input is fine for explicit status change.
        }
    }
}
