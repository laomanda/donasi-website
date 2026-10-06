<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    /**
     * Transform the resource into an array for management console.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                      => (int) $this->id,
            'employee_code'           => (string) $this->employee_code,
            'slug'                    => $this->slug,
            'name'                    => $this->name,
            'position'                => $this->position,
            'division'                => $this->division,
            'id_card_image'           => $this->id_card_image,
            'id_card_image_url'       => $this->id_card_image_url,
            'employment_status'       => $this->employment_status,
            'employment_status_label' => $this->employment_status_label,
            'display_order'           => (int) $this->display_order,
            'is_published'            => (bool) $this->is_published,
            'public_url'              => $this->public_url,
            'created_at'              => $this->created_at?->toISOString(),
            'updated_at'              => $this->updated_at?->toISOString(),
        ];
    }
}
