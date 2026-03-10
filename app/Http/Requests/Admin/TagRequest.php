<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TagRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tag = $this->route('tag');
        
        return [
            'name' => $this->isMethod('post') ? 'required|string|max:255' : 'sometimes|required|string|max:255',
            'url' => 'nullable|string|max:2048',
            'is_active' => 'boolean',
            'sort_order' => $tag 
                ? ['integer', Rule::unique('tags', 'sort_order')->ignore($tag->id)]
                : 'integer|unique:tags,sort_order',
            'open_in_new_tab' => 'boolean',
        ];
    }
}
