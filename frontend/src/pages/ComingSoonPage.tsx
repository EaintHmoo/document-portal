import { Construction } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Construction className="w-7 h-7 text-slate-400" />
      </div>
      <h2 className="text-lg font-bold text-slate-700">{title}</h2>
      <p className="text-[13px] text-slate-400 mt-1 max-w-sm">This section isn't built yet.</p>
      <Link
        to="/dashboard"
        className="mt-5 px-4 py-2 text-[13px] font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-900 transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
