import { Folder as FolderIcon, Lock, MoreVertical } from 'lucide-react';
import type { ApiFolder } from '../api/folders';

const palette = [
  { bg: 'bg-blue-50', text: 'text-blue-600', hover: 'group-hover:bg-blue-100' },
  { bg: 'bg-emerald-50', text: 'text-emerald-600', hover: 'group-hover:bg-emerald-100' },
  { bg: 'bg-amber-50', text: 'text-amber-600', hover: 'group-hover:bg-amber-100' },
  { bg: 'bg-violet-50', text: 'text-violet-600', hover: 'group-hover:bg-violet-100' },
  { bg: 'bg-rose-50', text: 'text-rose-600', hover: 'group-hover:bg-rose-100' },
  { bg: 'bg-cyan-50', text: 'text-cyan-600', hover: 'group-hover:bg-cyan-100' },
];

interface FolderGridProps {
  folders: ApiFolder[];
  onSelect?: (folder: ApiFolder) => void;
}

export default function FolderGrid({ folders, onSelect }: FolderGridProps) {
  if (folders.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-10 text-center">
        <FolderIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-[13px] text-slate-400">No folders yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {folders.map((folder, index) => {
        const colors = palette[index % palette.length];
        return (
          <button
            key={folder.id}
            onClick={() => onSelect?.(folder)}
            className="group flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-slate-300 transition-all text-left active:scale-[0.98]"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${colors.bg} ${colors.text} ${colors.hover}`}>
              <FolderIcon className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-slate-800 truncate flex items-center gap-1.5">
                {folder.name}
                {!folder.is_public && <Lock className="w-3 h-3 text-slate-400 shrink-0" />}
              </p>
              <p className="text-[11px] text-slate-400">{folder.document_count ?? 0} documents</p>
            </div>
            <MoreVertical className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        );
      })}
    </div>
  );
}
