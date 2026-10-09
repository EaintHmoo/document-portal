<?php

namespace App\Repositories\User;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface UserRepositoryInterface
{
    public function all(): Collection;

    public function findById(int $id): ?User;

    public function findByEmail(string $email): ?User;

    public function paginate(int $perPage = 20): LengthAwarePaginator;

    public function create(array $data): User;

    public function update(User $user, array $data): User;
}
