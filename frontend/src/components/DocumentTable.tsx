import { useState } from 'react';
import { FileText, Download, Folder, Loader2 } from 'lucide-react';
import type { ApiDocument } from '../api/documents';
import { getDownloadUrl } from '../api/documents';
import { formatBytes, formatDate } from '../utils/format';
import { fileTypeColors, defaultFileColor } from '../utils/fileTypes';

interface DocumentTableProps {
  documents: ApiDocument[];
  title?: string;
  subtitle?: string;
}

export default function DocumentTable({
  documents,
  title = 'Recent Documents',
  subtitle = 'Latest uploads across all folders',
}: DocumentTableProps) {
  const [downloadingUuid, setDownloadingUuid] = useState<string | null>(null);

  const handleDownload = async (doc: ApiDocument) => {
    setDownloadingUuid(doc.uuid);
    try {
      const { download_url } = await getDownloadUrl(doc.uuid);
      window.open(download_url, '_blank', 'noopener,noreferrer');
    } catch {
      // A failed download attempt isn't worth a blocking error banner here —
      // the user can just try again.
    } finally {
      setDownloadingUuid(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">{title}</h2>
          <p className="text-[12px] text-slate-400 mt-0.5">{subtitle}</p>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-[13px] text-slate-400">No documents yet.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-2.5">Document</th>
                  <th className="text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-2.5">Type</th>
                  <th className="text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-2.5">Folder</th>
                  <th className="text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-2.5">Size</th>
                  <th className="text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-2.5">Version</th>
                  <th className="text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-2.5">Date</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => {
                  const fc = fileTypeColors[doc.extension] ?? defaultFileColor;
                  return (
                    <tr key={doc.uuid} className="border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg ${fc.bg} ${fc.text} flex items-center justify-center shrink-0`}>
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200 truncate max-w-[200px]">{doc.title}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md border uppercase ${fc.bg} ${fc.text} ${fc.border}`}>
                          {doc.extension}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-[12px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Folder className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                          {doc.folder?.name ?? '—'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[12px] text-slate-500 dark:text-slate-400">{formatBytes(doc.size_bytes)}</td>
                      <td className="px-3 py-3">
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          v{doc.version_count}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatDate(doc.created_at)}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleDownload(doc)}
                            disabled={downloadingUuid === doc.uuid}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors disabled:opacity-50"
                            title="Download"
                          >
                            {downloadingUuid === doc.uuid ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
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
          <div className="md:hidden divide-y divide-slate-50 dark:divide-slate-800">
            {documents.map((doc) => {
              const fc = fileTypeColors[doc.extension] ?? defaultFileColor;
              return (
                <div key={doc.uuid} className="flex items-center gap-3 p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className={`w-10 h-10 rounded-lg ${fc.bg} ${fc.text} flex items-center justify-center shrink-0`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200 truncate">{doc.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${fc.bg} ${fc.text} ${fc.border}`}>
                        {doc.extension}
                      </span>
                      <span className="text-[11px] text-slate-400">{formatBytes(doc.size_bytes)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(doc)}
                    disabled={downloadingUuid === doc.uuid}
                    className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0 disabled:opacity-50"
                  >
                    {downloadingUuid === doc.uuid ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
