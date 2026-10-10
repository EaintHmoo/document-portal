<?php

namespace App\Http\Requests\Folder;

use App\Models\Folder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFolderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Folder::class);
    }

    public function rules(): array
    {
        return [
            'parent_id' => ['nullable', 'integer', Rule::exists('folders', 'id')->whereNull('deleted_at')],
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('folders', 'name')->where('parent_id', $this->input('parent_id')),
            ],
            'description' => ['nullable', 'string'],
            'is_public' => ['boolean'],
        ];
    }
}
