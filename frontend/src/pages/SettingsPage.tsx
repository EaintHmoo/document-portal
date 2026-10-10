import { useState, type FormEvent } from 'react';
import { Mail, Shield, User as UserIcon, KeyRound, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import { changePassword } from '../api/auth';
import PasswordChecklist from '../components/PasswordChecklist';
import { isStrongPassword } from '../utils/password';

const inputClass =
  'w-full pl-10 pr-4 py-2.5 text-[14px] bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all';

function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isStrongPassword(password)) {
      setError('Please meet all password requirements.');
      return;
    }
    if (password !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (password === currentPassword) {
      setError('Your new password must be different from your current password.');
      return;
    }

    setLoading(true);
    try {
      const response = await changePassword(currentPassword, password, confirmPassword);
      setSuccess(response.message);
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.fieldError('current_password') ?? err.fieldError('password') ?? err.message
          : 'Could not update your password. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
          <KeyRound className="w-[18px] h-[18px]" />
        </div>
        <div>
          <h2 className="text-[14px] font-semibold text-slate-800">Change Password</h2>
          <p className="text-[12px] text-slate-400">Other devices will be signed out after the change.</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
          <p className="text-[13px] text-rose-700 font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 flex items-start gap-2.5 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <p className="text-[13px] text-emerald-700 font-medium">{success}</p>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="current-password" className="block text-[13px] font-semibold text-slate-700 mb-1.5">
            Current Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="current-password"
              type={showPasswords ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="settings-new-password" className="block text-[13px] font-semibold text-slate-700 mb-1.5">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="settings-new-password"
              type={showPasswords ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <PasswordChecklist password={password} />
        </div>

        <div>
          <label htmlFor="settings-confirm-password" className="block text-[13px] font-semibold text-slate-700 mb-1.5">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="settings-confirm-password"
              type={showPasswords ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPasswords ? 'Hide passwords' : 'Show passwords'}
          </button>
          <button
            type="submit"
            disabled={loading || !currentPassword || !password || !confirmPassword}
            className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Settings</h1>
        <p className="text-[13px] text-slate-400 mt-0.5">Your account details and security</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-lg space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br from-slate-700 to-slate-900">
            {user.initials}
          </div>
          <div>
            <p className="text-[14px] font-semibold text-slate-800">{user.name}</p>
            <p className="text-[12px] text-slate-400 capitalize">{user.role}</p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-3">
          <div className="flex items-center gap-2.5 text-[13px] text-slate-600">
            <Mail className="w-4 h-4 text-slate-400" />
            {user.email}
          </div>
          <div className="flex items-center gap-2.5 text-[13px] text-slate-600">
            <Shield className="w-4 h-4 text-slate-400" />
            <span className="capitalize">{user.role} access</span>
          </div>
          <div className="flex items-center gap-2.5 text-[13px] text-slate-600">
            <UserIcon className="w-4 h-4 text-slate-400" />
            User ID #{user.id}
          </div>
        </div>
      </div>

      <ChangePasswordCard />
    </div>
  );
}
