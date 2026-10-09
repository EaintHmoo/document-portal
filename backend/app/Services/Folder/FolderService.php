<?php

namespace App\Services\Folder;

use App\Exceptions\ConflictException;
use App\Models\ActivityLog;
use App\Models\Folder;
use App\Models\User;
use App\Repositories\Folder\FolderRepositoryInterface;
use App\Repositories\User\UserRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class FolderService
{
    public function __construct(
        protected FolderRepositoryInterface $repository,
        protected UserRepositoryInterface $users,
    ) {
    }

    public function list(User $user): Collection
    {
        return $this->repository->accessibleTo($user);
    }

    public function find(int $id): ?Folder
    {
        return $this->repository->findById($id);
    }

    public function create(array $data, User $creator): Folder
    {
        $folder = $this->repository->create([...$data, 'created_by' => $creator->id]);

        ActivityLog::record('folder.created', $folder, ['name' => $folder->name], $creator);

        return $folder;
    }

    public function update(Folder $folder, array $data, User $editor): Folder
    {
        $folder = $this->repository->update($folder, $data);

        ActivityLog::record('folder.updated', $folder, ['name' => $folder->name], $editor);

        return $folder;
    }

    /**
     * @throws ConflictException if the folder still has documents in it —
     *         the DB's restrictOnDelete FK would reject this anyway, but
     *         checking first gives the caller a clean 409 instead of a
     *         500 from a raw constraint violation.
     */
    public function delete(Folder $folder, User $deleter): void
    {
        if ($this->repository->hasDocuments($folder)) {
            throw new ConflictException('This folder still has documents in it and cannot be deleted.');
        }

        $name = $folder->name;
        $this->repository->delete($folder);

        ActivityLog::record('folder.deleted', $folder, ['name' => $name], $deleter);
    }

    /**
     * Every user in the system, each annotated with their current grant on
     * this folder (or null) — the access modal needs the full roster so an
     * admin can grant access to someone who doesn't have any yet.
     */
    public function accessList(Folder $folder): array
    {
        $grants = $folder->users()->get()->keyBy('id');

        return $this->users->all()->map(fn (User $user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role->slug,
            'permission' => $grants->get($user->id)?->pivot->permission,
        ])->all();
    }

    /**
     * @param array<int, array{user_id: int, permission: ?string}> $grants
     */
    public function syncAccess(Folder $folder, array $grants, User $editor): void
    {
        $pivotData = collect($grants)
            ->filter(fn (array $grant) => in_array($grant['permission'], ['view', 'edit'], true))
            ->mapWithKeys(fn (array $grant) => [
                $grant['user_id'] => ['permission' => $grant['permission'], 'granted_by' => $editor->id],
            ])
            ->all();

        $folder->users()->sync($pivotData);

        ActivityLog::record('folder.access_updated', $folder, ['name' => $folder->name], $editor);
    }
}
