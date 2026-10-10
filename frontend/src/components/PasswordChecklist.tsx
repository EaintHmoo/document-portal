import { Check } from 'lucide-react';
import { passwordChecks } from '@/utils/password';

/** Live strength checklist shown under a new-password field. */
export default function PasswordChecklist({ password }: { password: string }) {
  if (password.length === 0) return null;

  return (
    <div className="mt-2.5 space-y-1.5">
      {passwordChecks(password).map((check) => (
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
  );
}
