<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Document extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid', 'folder_id', 'title', 'description', 'extension', 'mime_type',
        'size_bytes', 'current_version_id', 'version_count', 'uploaded_by', 'updated_by',
    ];

    protected static function booted(): void
    {
        static::creating(function (Document $document) {
            $document->uuid ??= (string) Str::uuid();
        });
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(Folder::class);
    }

    public function versions(): HasMany
    {
        return $this->hasMany(DocumentVersion::class)->orderByDesc('version_number');
    }

    public function currentVersion(): BelongsTo
    {
        return $this->belongsTo(DocumentVersion::class, 'current_version_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Scope every document list, search, and count to what the given user is
     * allowed to see: admins see everything, everyone else is limited to
     * public folders or folders they've been explicitly granted access to.
     * Centralizing this here means no controller/query can accidentally leak
     * documents outside this rule.
     */
    public function scopeAccessibleBy(Builder $query, User $user): Builder
    {
        if ($user->isAdmin()) {
            return $query;
        }

        return $query->whereHas('folder', function (Builder $folderQuery) use ($user) {
            $folderQuery->where('is_public', true)
                ->orWhereHas('users', function (Builder $userQuery) use ($user) {
                    $userQuery->where('user_id', $user->id);
                });
        });
    }
}
