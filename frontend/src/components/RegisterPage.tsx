import { useState, type FormEvent } from 'react';
import { Shield, Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle, Loader2, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import { sendRegisterOtp } from '../api/auth';
import OtpCodeField from './OtpCodeField';
import PasswordChecklist from './PasswordChecklist';
import { isStrongPassword } from '../utils/password';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  // Step 1 collects details and emails a code; step 2 verifies the code and creates the account.
  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [otp, setOtp] = useState('');
  const [resendIn, setResendIn] = useState(0);

  const requestCode = async () => {
    const response = await sendRegisterOtp(email);
    setResendIn(response.resend_in);
    return response.resend_in;
  };

  const handleDetailsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

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
      await requestCode();
      setOtp('');
      setStep('verify');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send a verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (otp.length !== 6) {
      setError('Enter the 6-digit code from your email.');
      return;
    }

    setLoading(true);
    const { error: signUpError } = await signUp(name, email, password, confirmPassword, otp);
    setLoading(false);

    if (signUpError) {
      setError(signUpError);
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
            <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Account created!</h2>
          <p className="text-[14px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Your email is verified and your account is ready. You can now sign in with your email and password.
          </p>
          <Link
            to="/login"
            className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 text-[14px] font-semibold text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 rounded-xl transition-all shadow-sm active:scale-[0.99]"
          >
            Continue to Sign In
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-500 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-white w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <Shield className="w-6 h-6 text-white" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">DocPortal</h1>
              <p className="text-[12px] text-slate-400">Internal Document Portal</p>
            </div>
          </div>

          {/* Hero text */}
          <div className="max-w-md">
            <h2 className="text-3xl xl:text-4xl font-bold leading-tight tracking-tight">
              Join your team's secure document workspace.
            </h2>
            <p className="mt-4 text-[15px] text-slate-400 leading-relaxed">
              Create an account to access company documents, organize files into folders, and collaborate
              with your team — all with enterprise-grade security.
            </p>

            {/* Steps */}
            <div className="mt-8 space-y-3">
              {[
                { step: '1', text: 'Create your account with work email' },
                { step: '2', text: 'Verify your email with a one-time code' },
                { step: '3', text: 'Start managing documents securely' },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 border border-white/15 text-[12px] font-bold">
                    {item.step}
                  </span>
                  <span className="text-[13px] text-slate-300 dark:text-slate-600">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className="text-[13px] text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-slate-300 dark:text-slate-600 hover:text-white transition-colors">
              Sign in here
            </Link>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-12 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 dark:ring-1 dark:ring-white/10">
              <Shield className="w-5 h-5 text-white" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">DocPortal</h1>
              <p className="text-[11px] text-slate-400">Internal Document Portal</p>
            </div>
          </div>

          {/* Header */}
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              {step === 'details' ? 'Create your account' : 'Verify your email'}
            </h2>
            <p className="text-[14px] text-slate-500 dark:text-slate-400 mt-1.5">
              {step === 'details'
                ? "Get started with your team's document portal"
                : 'One last step: confirm this email address belongs to you'}
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 px-4 py-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl">
              <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
              <p className="text-[13px] text-rose-700 dark:text-rose-400 font-medium">{error}</p>
            </div>
          )}

          {step === 'verify' && (
            <form className="space-y-5" onSubmit={handleVerifySubmit}>
              <OtpCodeField
                value={otp}
                onChange={setOtp}
                email={email}
                resendIn={resendIn}
                onResend={requestCode}
                onResendError={setError}
              />

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[14px] font-semibold text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 rounded-xl transition-all shadow-sm active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Create Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setStep('details'); setError(null); }}
                className="w-full flex items-center justify-center gap-1.5 text-[13px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to edit your details
              </button>
            </form>
          )}

          {/* Form */}
          {step === 'details' && (
          <form className="space-y-4" onSubmit={handleDetailsSubmit}>
            {/* Name */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full pl-11 pr-4 py-3 text-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800 outline-none transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-11 pr-4 py-3 text-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full pl-11 pr-12 py-3 text-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>

              {/* Password strength indicators */}
              <PasswordChecklist password={password} />
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full pl-11 pr-4 py-3 text-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800 outline-none transition-all"
                />
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2 cursor-pointer select-none pt-1">
              <input type="checkbox" required className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 focus:ring-slate-300 dark:focus:ring-slate-600 mt-0.5" />
              <span className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed">
                I agree to the{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">Terms of Service</span> and{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">Privacy Policy</span>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[14px] font-semibold text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 rounded-xl transition-all shadow-sm active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending code...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
          )}

          {/* Switch to login */}
          <p className="mt-6 text-center text-[13px] text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-slate-800 dark:text-slate-100 hover:text-slate-900 dark:hover:text-slate-100 underline underline-offset-2 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
