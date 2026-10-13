import { Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-3">
      <Loader2 className="w-7 h-7 text-slate-400 animate-spin" />
      <p className="text-[14px] text-slate-500 dark:text-slate-400 font-medium">Loading...</p>
    </div>
  );
}
