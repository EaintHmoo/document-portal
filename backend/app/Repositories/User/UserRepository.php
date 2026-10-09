<?php

namespace App\Repositories\User;

use App\Filters\UserFilter;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class UserRepository implements UserRepositoryInterface
{
    public function findById(int $id): ?User
    {
        return User::query()->with('role')->find($id);
    }

    public function findByEmail(string $email): ?User
    {
        return User::query()->where('email', $email)->first();
    }

    public function paginate(int $perPage = 20): LengthAwarePaginator
    {
        $query = User::query()->with('role')->latest();

        $query = app(UserFilter::class)->apply($query);

        return $query->paginate($perPage);
    }

    public function create(array $data): User
    {
        return User::query()->create($data);
    }

    public function update(User $user, array $data): User
    {
        $user->update($data);

        return $user->fresh();
    }
}
