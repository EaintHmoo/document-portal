<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class SendRegisterOtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** Same email rules as RegisterRequest, so a taken address fails before a code is ever sent. */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
        ];
    }
}
