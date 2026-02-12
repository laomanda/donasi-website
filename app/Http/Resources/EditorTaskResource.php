<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EditorTaskResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'priority' => $this->priority,
            'cancel_reason' => $this->cancel_reason,
            'due_at' => $this->due_at ? $this->due_at->toIso8601String() : null,
            'created_at' => $this->created_at ? $this->created_at->toIso8601String() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toIso8601String() : null,
            'assigned_to' => $this->assigned_to,
            'created_by' => $this->created_by,
            'creator' => $this->whenLoaded('creator', function () {
                return [
                    'id' => $this->creator->id,
                    'name' => $this->creator->name,
                    'email' => $this->creator->email,
                ];
            }),
            'assignee' => $this->whenLoaded('assignee', function () {
                return [
                    'id' => $this->assignee->id,
                    'name' => $this->assignee->name,
                    'email' => $this->assignee->email,
                ];
            }),
            'attachments' => $this->whenLoaded('attachments', function () {
                return $this->attachments->map(function ($attachment) {
                    return [
                        'id' => $attachment->id,
                        'file_path' => $attachment->file_path,
                        'file_url' => asset('storage/' . $attachment->file_path),
                        'original_name' => $attachment->original_name,
                        'mime_type' => $attachment->mime_type,
                        'file_size' => $attachment->file_size,
                        'uploaded_by' => $attachment->uploaded_by,
                        'created_at' => $attachment->created_at ? $attachment->created_at->toIso8601String() : null,
                    ];
                });
            }),
        ];
    }
}
