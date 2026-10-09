<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\ActivityLog */
class ActivityLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'action' => $this->action,
            'properties' => $this->properties,
            'user' => $this->whenLoaded('user', fn () => $this->user ? UserResource::make($this->user) : null),
            'created_at' => $this->created_at,
        ];
    }
}
