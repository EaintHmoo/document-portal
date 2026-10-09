<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Folder extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['parent_id', 'name', 'description', 'is_public', 'created_by'];

    protected function casts(): array
    {
        return [
            'is_public' => 'boolean',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Folder::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Folder::class, 'parent_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'folder_user')
            ->withPivot(['permission', 'granted_by'])
            ->withTimestamps();
    }

    /** Same visibility rule as Document::scopeAccessibleBy — kept in sync deliberately. */
    public function scopeAccessibleBy(Builder $query, User $user): Builder
    {
        if ($user->isAdmin()) {
            return $query;
        }

        return $query->where('is_public', true)
            ->orWhereHas('users', function (Builder $userQuery) use ($user) {
                $userQuery->where('user_id', $user->id);
            });
    }

    /** The user's explicit grant on this folder, or null if they have none. */
    public function permissionFor(User $user): ?string
    {
        if ($this->relationLoaded('users')) {
            return $this->users->firstWhere('id', $user->id)?->pivot->permission;
        }

        return $this->users()->where('user_id', $user->id)->first()?->pivot->permission;
    }
}
