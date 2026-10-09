<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\DocumentVersion */
class DocumentVersionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'version_number' => $this->version_number,
            'original_filename' => $this->original_filename,
            'extension' => $this->extension,
            'size_bytes' => $this->size_bytes,
            'change_note' => $this->change_note,
            'author' => $this->whenLoaded('author', fn () => UserResource::make($this->author)),
            'created_at' => $this->created_at,
        ];
    }
}
