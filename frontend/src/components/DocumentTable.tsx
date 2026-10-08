import { FileText, Download, MoreVertical, Folder } from 'lucide-react';
import type { DocumentItem } from '../data/mockData';
import { fileTypeColors } from '../data/mockData';

export default function DocumentTable({ documents }: { documents: DocumentItem[] }) {
  const statusStyles: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    archived: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-[15px] font-bold text-slate-800">Recent Documents</h2>
          <p className="text-[12px] text-slate-400 mt-0.5">Latest uploads across all folders</p>
        </div>
        <button className="text-[12px] font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
          View all
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5">Document</th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5">Type</th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5">Folder</th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5">Size</th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5">Version</th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5">Status</th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5">Date</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => {
              const fc = fileTypeColors[doc.type];
              return (
                <tr key={doc.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg ${fc.bg} ${fc.text} flex items-center justify-center shrink-0`}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="text-[13px] font-medium text-slate-700 truncate max-w-[200px]">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${fc.bg} ${fc.text} ${fc.border}`}>
                      {doc.type}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-[12px] text-slate-500 flex items-center gap-1.5">
                      <Folder className="w-3.5 h-3.5 text-slate-300" />
                      {doc.folder}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[12px] text-slate-500">{doc.size}</td>
                  <td className="px-3 py-3">
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {doc.version}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border capitalize ${statusStyles[doc.status]}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[12px] text-slate-500 whitespace-nowrap">{doc.uploadedDate}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-slate-50">
        {documents.map((doc) => {
          const fc = fileTypeColors[doc.type];
          return (
            <div key={doc.id} className="flex items-center gap-3 p-4 hover:bg-slate-50/50 transition-colors">
              <div className={`w-10 h-10 rounded-lg ${fc.bg} ${fc.text} flex items-center justify-center shrink-0`}>
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-slate-700 truncate">{doc.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${fc.bg} ${fc.text} ${fc.border}`}>
                    {doc.type}
                  </span>
                  <span className="text-[11px] text-slate-400">{doc.size}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border capitalize ${statusStyles[doc.status]}`}>
                    {doc.status}
                  </span>
                </div>
              </div>
              <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0">
                <Download className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
