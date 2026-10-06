<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicEmployeeResource extends JsonResource
{
    /**
     * Transform the resource into an array for public consumers.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'employee_code'           => (string) $this->employee_code,
            'slug'                    => $this->slug,
            'name'                    => $this->name,
            'position'                => $this->position,
            'division'                => $this->division,
            'employment_status'       => $this->employment_status,
            'employment_status_label' => $this->employment_status_label,
            'id_card_image_url'       => $this->id_card_image_url,
            'public_url'              => $this->public_url,
        ];
    }
}
