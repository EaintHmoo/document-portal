<?php

namespace App\Repositories\Document;

use App\Filters\DocumentFilter;
use App\Models\Document;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class DocumentRepository implements DocumentRepositoryInterface
{
    public function paginate(User $user, int $perPage = 20): LengthAwarePaginator
    {
        $query = Document::query()
            ->accessibleBy($user)
            ->with(['folder', 'uploader', 'currentVersion']);

        $query = app(DocumentFilter::class)->apply($query);

        return $query->paginate($perPage);
    }

    public function findByUuid(User $user, string $uuid): ?Document
    {
        return Document::query()
            ->accessibleBy($user)
            ->with(['folder', 'uploader', 'updater', 'currentVersion'])
            ->where('uuid', $uuid)
            ->first();
    }

    public function recent(User $user, int $limit = 5): Collection
    {
        return Document::query()
            ->accessibleBy($user)
            ->with(['folder', 'uploader'])
            ->latest()
            ->limit($limit)
            ->get();
    }

    public function countAccessibleTo(User $user): int
    {
        return Document::query()->accessibleBy($user)->count();
    }

    public function create(array $data): Document
    {
        return Document::query()->create($data);
    }

    public function update(Document $document, array $data): Document
    {
        $document->update($data);

        return $document->fresh();
    }

    public function delete(Document $document): void
    {
        $document->delete();
    }
}
