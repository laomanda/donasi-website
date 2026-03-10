<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ArticleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Dibiarkan true karena otorisasi sudah dihandle middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Jika sedang update, ambil id artikel dari route
        $articleId = $this->route('article') ? $this->route('article')->id : null;

        return [
            'title'          => ['required', 'string', 'max:255'],
            'title_en'       => ['nullable', 'string', 'max:255'],
            'slug'           => ['required', 'string', 'max:255', 'unique:articles,slug,' . $articleId],
            'program_id'     => ['nullable', 'exists:programs,id'],
            'category'       => ['required', 'string', 'max:100'],
            'category_en'    => ['nullable', 'string', 'max:100'],
            'thumbnail_path' => ['nullable', 'string', 'max:255'],
            'excerpt'        => ['required', 'string'],
            'excerpt_en'     => ['nullable', 'string'],
            'body'           => ['required', 'string'],
            'body_en'        => ['nullable', 'string'],
            'author_name'    => ['nullable', 'string', 'max:255'],
            'published_at'   => ['nullable', 'date'],
            'status'         => ['required', 'in:draft,review,published'],
        ];
    }
}
