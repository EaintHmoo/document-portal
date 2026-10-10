<?php

namespace App\Services\Auth;

use App\Mail\OtpCodeMail;
use App\Models\EmailOtp;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\ServiceUnavailableHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Throwable;

class OtpService
{
    /**
     * Issues a fresh code for this email + purpose (replacing any earlier
     * one) and emails it.
     *
     * The resend cooldown is keyed on the address alone, so it behaves the
     * same whether or not an account exists — callers that must not reveal
     * account existence can rely on that.
     *
     * @throws TooManyRequestsHttpException if a code was sent to this address too recently
     * @throws ServiceUnavailableHttpException if the email couldn't be sent
     */
    public function send(string $email, string $purpose): void
    {
        $email = $this->normalize($email);

        $this->reserveSendSlot($email, $purpose);

        $code = str_pad((string) random_int(0, 999_999), 6, '0', STR_PAD_LEFT);
        $expiresMinutes = (int) config('auth.otp.expires_minutes');

        EmailOtp::query()->updateOrCreate(
            ['email' => $email, 'purpose' => $purpose],
            ['code_hash' => Hash::make($code), 'attempts' => 0, 'expires_at' => now()->addMinutes($expiresMinutes)],
        );

        try {
            Mail::to($email)->send(new OtpCodeMail($code, $purpose, $expiresMinutes));
        } catch (Throwable $e) {
            // Don't leave a code nobody received, and don't make the user
            // sit out the cooldown for a send that never happened.
            EmailOtp::query()->where(['email' => $email, 'purpose' => $purpose])->delete();
            RateLimiter::clear($this->cooldownKey($email, $purpose));

            Log::error('Failed to send OTP email.', ['purpose' => $purpose, 'error' => $e->getMessage()]);

            throw new ServiceUnavailableHttpException(null, "We couldn't send the verification email. Please try again later.");
        }
    }

    /**
     * Checks a code and consumes it on success, so it can never be replayed.
     * The row is locked while checking so two concurrent requests can't
     * both spend the same code or both get a "free" wrong guess.
     *
     * @throws ValidationException (on the "otp" field) when the code is wrong, expired, used up or never issued
     */
    public function verify(string $email, string $purpose, string $code): void
    {
        $email = $this->normalize($email);
        $maxAttempts = (int) config('auth.otp.max_attempts');

        $error = DB::transaction(function () use ($email, $purpose, $code, $maxAttempts) {
            $otp = EmailOtp::query()
                ->where(['email' => $email, 'purpose' => $purpose])
                ->lockForUpdate()
                ->first();

            if (! $otp || $otp->isExpired() || $otp->attempts >= $maxAttempts) {
                $otp?->delete();

                return 'This code is invalid or has expired. Please request a new one.';
            }

            if (! Hash::check($code, $otp->code_hash)) {
                $otp->increment('attempts');
                $remaining = $maxAttempts - $otp->attempts;

                if ($remaining <= 0) {
                    $otp->delete();

                    return 'Too many incorrect attempts. Please request a new code.';
                }

                return "The code is incorrect. {$remaining} ".($remaining === 1 ? 'attempt' : 'attempts').' left.';
            }

            $otp->delete();

            return null;
        });

        if ($error !== null) {
            throw ValidationException::withMessages(['otp' => $error]);
        }
    }

    /**
     * Starts the resend cooldown for this address, or throws if one is
     * already running. send() calls this itself; call it directly to apply
     * the same cooldown when deliberately *not* sending (e.g. a password
     * reset for an unknown email), so both cases look identical.
     *
     * @throws TooManyRequestsHttpException
     */
    public function reserveSendSlot(string $email, string $purpose): void
    {
        $email = $this->normalize($email);
        $key = $this->cooldownKey($email, $purpose);

        if (RateLimiter::tooManyAttempts($key, 1)) {
            $seconds = RateLimiter::availableIn($key);

            throw new TooManyRequestsHttpException($seconds, "Please wait {$seconds} seconds before requesting another code.");
        }

        RateLimiter::hit($key, (int) config('auth.otp.resend_seconds'));
    }

    private function cooldownKey(string $email, string $purpose): string
    {
        return "otp:{$purpose}:".sha1($email);
    }

    private function normalize(string $email): string
    {
        return mb_strtolower(trim($email));
    }
}
