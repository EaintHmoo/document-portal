import { Mail, Shield, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Settings</h1>
        <p className="text-[13px] text-slate-400 mt-0.5">Your account details</p>
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

      <p className="text-[12px] text-slate-400 max-w-lg">
        Profile editing (name, password) isn't available yet — contact an administrator for account changes.
      </p>
    </div>
  );
}
