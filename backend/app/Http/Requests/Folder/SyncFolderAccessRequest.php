<?php

namespace App\Http\Requests\Folder;

use Illuminate\Foundation\Http\FormRequest;

class SyncFolderAccessRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('manageAccess', $this->route('folder'));
    }

    public function rules(): array
    {
        return [
            'grants' => ['required', 'array'],
            'grants.*.user_id' => ['required', 'integer', 'exists:users,id'],
            'grants.*.permission' => ['nullable', 'in:view,edit'],
        ];
    }
}
