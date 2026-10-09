<?php

namespace App\Http\Requests\Folder;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFolderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('folder'));
    }

    public function rules(): array
    {
        return [
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
}
