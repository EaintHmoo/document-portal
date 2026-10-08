import { Scale, Wallet, Users, Code2, Megaphone, Settings, MoreVertical, FileText } from 'lucide-react';
import type { Folder } from '../data/mockData';

const iconMap: Record<string, typeof Scale> = {
  Scale,
  Wallet,
  Users,
  Code2,
  Megaphone,
  Settings,
};

const colorStyles: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
  emerald: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
  amber: 'bg-amber-50 text-amber-600 group-hover:bg-amber-100',
  violet: 'bg-violet-50 text-violet-600 group-hover:bg-violet-100',
  rose: 'bg-rose-50 text-rose-600 group-hover:bg-rose-100',
  cyan: 'bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100',
};

export default function FolderGrid({ folders }: { folders: Folder[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {folders.map((folder) => {
        const Icon = iconMap[folder.icon] || FileText;
        return (
          <button
            key={folder.id}
            className="group flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-slate-300 transition-all text-left active:scale-[0.98]"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${colorStyles[folder.color]}`}>
              <Icon className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-slate-800 truncate">{folder.name}</p>
              <p className="text-[11px] text-slate-400">{folder.documentCount} documents</p>
            </div>
            <MoreVertical className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        );
      })}
    </div>
  );
}
