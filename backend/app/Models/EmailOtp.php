<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailOtp extends Model
{
    public const PURPOSE_REGISTER = 'register';

    public const PURPOSE_PASSWORD_RESET = 'password_reset';

    protected $fillable = ['email', 'purpose', 'code_hash', 'attempts', 'expires_at'];

    protected $hidden = ['code_hash'];

    protected function casts(): array
    {
        return [
            'attempts' => 'integer',
            'expires_at' => 'datetime',
        ];
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }
}
