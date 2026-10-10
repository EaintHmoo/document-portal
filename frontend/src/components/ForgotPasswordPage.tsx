import { useState, type FormEvent } from 'react';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle, Loader2, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ApiError } from '../api/client';
import { requestPasswordReset, resetPassword } from '../api/auth';
import OtpCodeField from './OtpCodeField';
import PasswordChecklist from './PasswordChecklist';
import { isStrongPassword } from '../utils/password';

type Step = 'email' | 'reset' | 'done';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestCode = async () => {
    const response = await requestPasswordReset(email);
    setResendIn(response.resend_in);
    return response.resend_in;
  };

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await requestCode();
      setOtp('');
      setStep('reset');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send a reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (otp.length !== 6) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    if (!isStrongPassword(password)) {
      setError('Please meet all password requirements.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, otp, password, confirmPassword);
      setStep('done');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reset your password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
            <Check className="w-8 h-8 text-emerald-600" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Password reset</h2>
          <p className="text-[14px] text-slate-500 mt-2 leading-relaxed">
            Your password has been changed and any other signed-in sessions were signed out. Sign in with your new
            password.
          </p>
          <Link
            to="/login"
            className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 text-[14px] font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-all shadow-sm active:scale-[0.99]"
          >
            Continue to Sign In
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 sm:px-12 bg-slate-50">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900">
            <Shield className="w-5 h-5 text-white" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-slate-800">DocPortal</h1>
            <p className="text-[11px] text-slate-400">Internal Document Portal</p>
          </div>
        </div>

        {/* Header */}
        <div className="mb-7">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            {step === 'email' ? 'Forgot your password?' : 'Choose a new password'}
          </h2>
          <p className="text-[14px] text-slate-500 mt-1.5">
            {step === 'email'
              ? "Enter your account's email and we'll send you a 6-digit code."
              : 'If an account exists for this email, a code is on its way.'}
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-5 flex items-start gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
            <p className="text-[13px] text-rose-700 font-medium">{error}</p>
          </div>
        )}

        {step === 'email' ? (
          <form className="space-y-5" onSubmit={handleEmailSubmit}>
            <div>
              <label htmlFor="reset-email" className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                <input
                  id="reset-email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-11 pr-4 py-3 text-[14px] bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[14px] font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-all shadow-sm active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending code...
                </>
              ) : (
                <>
                  Send Reset Code
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleResetSubmit}>
            <OtpCodeField
              value={otp}
              onChange={setOtp}
              email={email}
              resendIn={resendIn}
              onResend={requestCode}
              onResendError={setError}
            />

            <div>
              <label htmlFor="new-password" className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full pl-11 pr-12 py-3 text-[14px] bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
              <PasswordChecklist password={password} />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                <input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full pl-11 pr-4 py-3 text-[14px] bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[14px] font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-all shadow-sm active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  Reset Password
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setStep('email'); setError(null); }}
              className="w-full flex items-center justify-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Use a different email
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-[13px] text-slate-500">
          Remembered it?{' '}
          <Link
            to="/login"
            className="font-semibold text-slate-800 hover:text-slate-900 underline underline-offset-2 transition-colors"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
