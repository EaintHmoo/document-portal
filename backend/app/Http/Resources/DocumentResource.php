<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Document */
class DocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'title' => $this->title,
            'description' => $this->description,
            'extension' => $this->extension,
            'mime_type' => $this->mime_type,
            'size_bytes' => $this->size_bytes,
            'version_count' => $this->version_count,
            // Drive the frontend's Edit/Delete/Add-version buttons — reuse
            // the exact policy checks those endpoints enforce, so the UI
            // hint can never drift from what's actually allowed.
            'can_edit' => $request->user()?->can('update', $this->resource) ?? false,
            'can_delete' => $request->user()?->can('delete', $this->resource) ?? false,
            'folder' => $this->whenLoaded('folder', fn () => FolderResource::make($this->folder)),
            'uploaded_by' => $this->whenLoaded('uploader', fn () => UserResource::make($this->uploader)),
            'updated_by' => $this->whenLoaded('updater', fn () => $this->updater ? UserResource::make($this->updater) : null),
            'current_version' => $this->whenLoaded('currentVersion', fn () => DocumentVersionResource::make($this->currentVersion)),
            'versions' => DocumentVersionResource::collection($this->whenLoaded('versions')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
