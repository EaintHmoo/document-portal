<?php

namespace App\Mail;

use App\Models\EmailOtp;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/** Sent synchronously, never queued — a code is useless if it arrives after it expires. */
class OtpCodeMail extends Mailable
{
    public function __construct(
        public string $code,
        public string $purpose,
        public int $expiresMinutes,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->purpose === EmailOtp::PURPOSE_REGISTER
            ? 'Your Document Portal verification code'
            : 'Your Document Portal password reset code');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.otp-code', with: [
            'code' => $this->code,
            'isRegistration' => $this->purpose === EmailOtp::PURPOSE_REGISTER,
            'expiresMinutes' => $this->expiresMinutes,
        ]);
    }
}
