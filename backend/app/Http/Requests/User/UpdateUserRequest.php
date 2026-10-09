<?php

namespace App\Http\Requests\User;

use App\Models\Role;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('user'));
    }

    public function rules(): array
    {
        return [
            'role' => ['sometimes', 'string', 'in:'.Role::ADMIN.','.Role::USER],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    /** An admin can't lock themselves out by blocking or demoting their own account here. */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $target = $this->route('user');

            if (! $target || ! $target->is($this->user())) {
                return;
            }

            if ($this->has('is_active') && ! $this->boolean('is_active')) {
                $validator->errors()->add('is_active', 'You cannot deactivate your own account.');
            }

            if ($this->has('role') && $this->input('role') !== $target->role?->slug) {
                $validator->errors()->add('role', 'You cannot change your own role.');
            }
        });
    }

    /** Resolves the "role" slug input into the role_id the repository actually persists. */
    public function dataForUpdate(): array
    {
        $data = $this->validated();

        if (array_key_exists('role', $data)) {
            $data['role_id'] = Role::query()->where('slug', $data['role'])->value('id');
            unset($data['role']);
        }

        return $data;
    }
}
