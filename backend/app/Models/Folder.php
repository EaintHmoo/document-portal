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
            ->withPivot(['can_view', 'can_create', 'can_edit', 'can_delete', 'granted_by'])
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

    /** The user's explicit grant on this folder — all false if they have no row at all. */
    public function accessFor(User $user): array
    {
        $pivot = $this->relationLoaded('users')
            ? $this->users->firstWhere('id', $user->id)?->pivot
            : $this->users()->where('user_id', $user->id)->first()?->pivot;

        return [
            'can_view' => (bool) ($pivot->can_view ?? false),
            'can_create' => (bool) ($pivot->can_create ?? false),
            'can_edit' => (bool) ($pivot->can_edit ?? false),
            'can_delete' => (bool) ($pivot->can_delete ?? false),
        ];
    }

    public function hasViewAccess(User $user): bool
    {
        return $this->accessFor($user)['can_view'];
    }

    /** Can upload a brand-new document into this folder (distinct from editing an existing one). */
    public function hasCreateAccess(User $user): bool
    {
        return $this->accessFor($user)['can_create'];
    }

    public function hasEditAccess(User $user): bool
    {
        return $this->accessFor($user)['can_edit'];
    }

    public function hasDeleteAccess(User $user): bool
    {
        return $this->accessFor($user)['can_delete'];
    }
}
