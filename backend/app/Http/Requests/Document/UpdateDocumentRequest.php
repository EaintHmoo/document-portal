<?php

namespace App\Http\Requests\Document;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDocumentRequest extends FormRequest
{
    /**
     * The controller resolves the document through a scope that returns a
     * clean 404 for anything this user can't see (never a 403, which would
     * leak that an inaccessible document exists). That lookup happens after
     * FormRequest validation, so the real permission check — can this user
     * edit this specific document? — runs in the controller instead.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ];
    }
}
