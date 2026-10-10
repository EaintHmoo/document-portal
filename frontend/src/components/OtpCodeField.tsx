import { useEffect, useState } from 'react';
import { KeyRound, Loader2, RotateCw } from 'lucide-react';

interface OtpCodeFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** Where the code was sent — shown so the user knows which inbox to check. */
  email: string;
  /** Seconds before "Resend code" unlocks; reset whenever a new code is sent. */
  resendIn: number;
  /** Requests a fresh code and resolves with the next cooldown in seconds. */
  onResend: () => Promise<number>;
  /** Surfaces resend failures (e.g. the 429 cooldown) in the parent's error banner. */
  onResendError: (message: string) => void;
}

/** Six-digit code input with a resend button that counts down its own cooldown. */
export default function OtpCodeField({ value, onChange, email, resendIn, onResend, onResendError }: OtpCodeFieldProps) {
  const [secondsLeft, setSecondsLeft] = useState(resendIn);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleResend = async () => {
    setResending(true);
    setResent(false);
    try {
      const next = await onResend();
      setSecondsLeft(next);
      setResent(true);
      onChange('');
    } catch (err) {
      onResendError(err instanceof Error ? err.message : 'Could not send a new code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div>
      <label htmlFor="otp-code" className="block text-[13px] font-semibold text-slate-700 mb-1.5">
        Verification Code
      </label>
      <div className="relative">
        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
        <input
          id="otp-code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          required
          maxLength={6}
          pattern="\d{6}"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="••••••"
          className="w-full pl-11 pr-4 py-3 text-[18px] font-semibold tracking-[0.5em] bg-white border border-slate-200 rounded-xl placeholder:text-slate-300 placeholder:tracking-[0.5em] focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all"
        />
      </div>
      <div className="mt-2 flex items-start justify-between gap-3">
        <p className="text-[12px] text-slate-500 leading-relaxed">
          {resent ? 'A new code was sent to ' : 'Enter the 6-digit code sent to '}
          <span className="font-semibold text-slate-700 break-all">{email}</span>
        </p>
        <button
          type="button"
          onClick={handleResend}
          disabled={secondsLeft > 0 || resending}
          className="shrink-0 flex items-center gap-1 text-[12px] font-semibold text-slate-600 hover:text-slate-900 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
        >
          {resending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCw className="w-3.5 h-3.5" />}
          {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Resend code'}
        </button>
      </div>
    </div>
  );
}
