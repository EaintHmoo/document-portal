<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Folder */
class FolderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'parent_id' => $this->parent_id,
            'name' => $this->name,
            'description' => $this->description,
            'is_public' => $this->is_public,
            'document_count' => $this->whenCounted('documents'),
            'created_by' => $this->whenLoaded('creator', fn () => UserResource::make($this->creator)),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
