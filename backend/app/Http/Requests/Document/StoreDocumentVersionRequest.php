<?php

namespace App\Http\Requests\Document;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentVersionRequest extends FormRequest
{
    /** @see UpdateDocumentRequest::authorize() — same reasoning: controller authorizes after the 404-safe lookup. */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => [
                'required', 'file',
                'mimes:'.StoreDocumentRequest::ALLOWED_MIMES,
                'mimetypes:'.implode(',', StoreDocumentRequest::ALLOWED_MIME_TYPES),
                'max:20480',
            ],
            'change_note' => ['nullable', 'string', 'max:500'],
        ];
    }
}
