<?php

namespace App\Http\Requests\Folder;

use App\Models\Folder;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFolderRequest extends FormRequest
{
    public function authorize(): bool
    {
        $folder = $this->route('folder');

        // Moving a folder reshapes the tree for everyone, so it stays an
        // admin action even for users with edit access to this folder.
        $isMove = $this->has('parent_id') && $this->input('parent_id') != $folder->parent_id;

        return $this->user()->can('update', $folder) && (! $isMove || $this->user()->isAdmin());
    }

    public function rules(): array
    {
        return [
            'parent_id' => ['sometimes', 'nullable', 'integer', Rule::exists('folders', 'id')->whereNull('deleted_at')],
            'name' => [
                'sometimes', 'required', 'string', 'max:255',
                Rule::unique('folders', 'name')
                    ->where('parent_id', $this->input('parent_id', $this->route('folder')->parent_id))
                    ->ignore($this->route('folder')->id),
            ],
            'description' => ['nullable', 'string'],
            'is_public' => ['boolean'],
        ];
    }

    /** A folder can't be moved into itself or any of its own subfolders. */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $folder = $this->route('folder');

            if (! $this->has('parent_id') || $validator->errors()->has('parent_id')) {
                return;
            }

            $newParent = $this->filled('parent_id') ? Folder::find($this->integer('parent_id')) : null;

            if ($newParent && $folder->isSelfOrAncestorOf($newParent)) {
                $validator->errors()->add('parent_id', 'A folder cannot be moved into itself or one of its subfolders.');

                return;
            }

            // The name rule above only runs when a name is sent; a move on
            // its own still has to respect the (parent_id, name) unique key.
            if (! $this->has('name')) {
                $nameTaken = Folder::withTrashed()
                    ->where('parent_id', $newParent?->id)
                    ->where('name', $folder->name)
                    ->whereKeyNot($folder->id)
                    ->exists();

                if ($nameTaken) {
                    $validator->errors()->add('parent_id', 'The destination already has a folder with this name.');
                }
            }
        });
    }
}
