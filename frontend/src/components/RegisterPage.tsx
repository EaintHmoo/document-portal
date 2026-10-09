import { useState, type FormEvent } from 'react';
import { Shield, Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

  const passwordChecks = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'Contains uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'Contains a number', valid: /\d/.test(password) },
  ];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!passwordChecks.every((check) => check.valid)) {
      setError('Please meet all password requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: signUpError } = await signUp(name, email, password, confirmPassword);
    setLoading(false);

    if (signUpError) {
      setError(signUpError);
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
            <Check className="w-8 h-8 text-emerald-600" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Account created!</h2>
          <p className="text-[14px] text-slate-500 mt-2 leading-relaxed">
            Your account has been set up successfully. You can now sign in with your email and password.
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
                { step: '2', text: 'Verify your identity and sign in' },
                { step: '3', text: 'Start managing documents securely' },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 border border-white/15 text-[12px] font-bold">
                    {item.step}
                  </span>
                  <span className="text-[13px] text-slate-300">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className="text-[13px] text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-slate-300 hover:text-white transition-colors">
              Sign in here
            </Link>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-12 bg-slate-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
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
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Create your account</h2>
            <p className="text-[14px] text-slate-500 mt-1.5">Get started with your team's document portal</p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
              <p className="text-[13px] text-rose-700 font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full pl-11 pr-4 py-3 text-[14px] bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-11 pr-4 py-3 text-[14px] bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                <input
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>

              {/* Password strength indicators */}
              {password.length > 0 && (
                <div className="mt-2.5 space-y-1.5">
                  {passwordChecks.map((check) => (
                    <div key={check.label} className="flex items-center gap-2">
                      <span
                        className={`flex items-center justify-center w-4 h-4 rounded-full transition-colors ${
                          check.valid ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      >
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </span>
                      <span className={`text-[11px] font-medium ${check.valid ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full pl-11 pr-4 py-3 text-[14px] bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2 cursor-pointer select-none pt-1">
              <input type="checkbox" required className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-300 mt-0.5" />
              <span className="text-[12px] text-slate-600 leading-relaxed">
                I agree to the{' '}
                <span className="font-semibold text-slate-700">Terms of Service</span> and{' '}
                <span className="font-semibold text-slate-700">Privacy Policy</span>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[14px] font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-all shadow-sm active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to login */}
          <p className="mt-6 text-center text-[13px] text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-slate-800 hover:text-slate-900 underline underline-offset-2 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
