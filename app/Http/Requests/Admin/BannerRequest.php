<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BannerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('video_duration') && ($this->input('video_duration') === '' || $this->input('video_duration') === null)) {
            $this->merge(['video_duration' => null]);
        }
    }

    public function rules(): array
    {
        $banner = $this->route('banner');
        $orderRule = Rule::unique('banners', 'display_order');
        if ($banner) {
            $orderRule = $orderRule->ignore($banner->id);
        }

        $mediaType = $this->input('media_type', $banner?->media_type ?? 'image');

        return [
            'media_type'    => ['sometimes', 'required', 'string', 'in:image,video'],
            'image_path'    => [
                Rule::requiredIf(function () use ($mediaType, $banner) {
                    if ($mediaType !== 'image') return false;
                    if (!$banner) return true;
                    return empty($this->input('image_path')) && empty($banner->image_path);
                }),
                'nullable', 'string', 'max:255'
            ],
            'video_path'    => [
                Rule::requiredIf(function () use ($mediaType, $banner) {
                    if ($mediaType !== 'video') return false;
                    if (!$banner) return true;
                    return empty($this->input('video_path')) && empty($banner->video_path);
                }),
                'nullable', 'string', 'max:255'
            ],
            'video_duration'=> ['nullable', 'integer', 'min:1', 'max:120'],
            'display_order' => [$banner ? 'sometimes' : 'required', 'integer', 'min:1', $orderRule],
            'status'        => ['sometimes', 'required', 'string', 'in:published,draft'],
        ];
    }

    public function messages(): array
    {
        return [
            'display_order.required' => 'Nomor urutan tampil wajib diisi.',
            'display_order.integer'  => 'Nomor urutan tampil harus berupa angka bulat.',
            'display_order.min'      => 'Nomor urutan tampil minimal bernilai 1.',
            'display_order.unique'   => 'Nomor urutan tampil sudah digunakan oleh banner lain.',
            'video_duration.integer' => 'Durasi video harus berupa angka detik.',
            'video_duration.min'     => 'Durasi video minimal 1 detik.',
            'video_duration.max'     => 'Durasi video maksimal adalah 2 menit (120 detik).',
            'video_path.required'    => 'File video wajib diunggah untuk banner bertipe video.',
            'image_path.required'    => 'Gambar banner wajib diunggah.',
        ];
    }
}
