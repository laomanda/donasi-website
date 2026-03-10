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

    public function rules(): array
    {
        $banner = $this->route('banner');
        $orderRule = Rule::unique('banners', 'display_order');
        if ($banner) {
            $orderRule = $orderRule->ignore($banner->id);
        }

        return [
            'image_path'   => [$banner ? 'sometimes' : 'required', 'string', 'max:255'],
            'display_order'=> [$banner ? 'sometimes' : 'required', 'integer', 'min:0', $orderRule],
        ];
    }
}
