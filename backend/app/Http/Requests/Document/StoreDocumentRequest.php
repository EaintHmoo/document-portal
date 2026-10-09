<?php

namespace App\Http\Requests\Document;

use App\Models\Folder;
use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentRequest extends FormRequest
{
    public const ALLOWED_MIMES = 'pdf,doc,docx,xls,xlsx,ppt,pptx';

    public const ALLOWED_MIME_TYPES = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];

    public function authorize(): bool
    {
        $folder = Folder::find($this->input('folder_id'));

        return $folder && $this->user()->can('uploadDocument', $folder);
    }

    public function rules(): array
    {
        return [
            'folder_id' => ['required', 'integer', 'exists:folders,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'file' => [
                'required', 'file',
                'mimes:'.self::ALLOWED_MIMES,
                'mimetypes:'.implode(',', self::ALLOWED_MIME_TYPES),
                'max:20480',
            ],
        ];
    }

    public function folder(): Folder
    {
        return Folder::findOrFail($this->input('folder_id'));
    }
}
