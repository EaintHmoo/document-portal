import { useEffect, useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import DocumentTable from '../components/DocumentTable';
import LoadingScreen from '../components/LoadingScreen';
import { fetchDocuments, type ApiDocument } from '../api/documents';
import { fetchFolders, type ApiFolder } from '../api/folders';
import { ApiError } from '../api/client';

export default function DocumentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const folderId = searchParams.get('folder_id') ?? undefined;
  const q = searchParams.get('q') ?? '';
  const page = Number(searchParams.get('page') ?? '1');

  const [searchInput, setSearchInput] = useState(q);
  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number } | null>(null);
  const [folder, setFolder] = useState<ApiFolder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchDocuments({
      folder_id: folderId ? Number(folderId) : undefined,
      q: q || undefined,
      page,
    })
      .then((res) => {
        if (cancelled) return;
        setDocuments(res.data);
        setMeta(res.meta);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Could not load documents. Please try again.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [folderId, q, page]);

  useEffect(() => {
    if (!folderId) {
      setFolder(null);
      return;
    }

    let cancelled = false;
    fetchFolders()
      .then((folders) => {
        if (!cancelled) setFolder(folders.find((f) => String(f.id) === folderId) ?? null);
      })
      .catch(() => {
        // Non-critical — the filter still works even if we can't resolve the folder's name for the chip.
      });

    return () => {
      cancelled = true;
    };
  }, [folderId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (searchInput) next.set('q', searchInput);
      else next.delete('q');
      next.delete('page');
      return next;
    });
  };

  const clearFolderFilter = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('folder_id');
      return next;
    });
  };

  const goToPage = (nextPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(nextPage));
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Documents</h1>
        <p className="text-[13px] text-slate-400 mt-0.5">Search and browse every document you have access to</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
          />
        </form>

        {folder && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg">
            Folder: {folder.name}
            <button onClick={clearFolderFilter} className="text-slate-400 hover:text-slate-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        )}
      </div>

      {loading ? (
        <LoadingScreen />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <AlertCircle className="w-8 h-8 text-rose-400" />
          <p className="text-[14px] font-semibold text-slate-700">Couldn't load documents</p>
          <p className="text-[13px] text-slate-400 max-w-sm">{error}</p>
        </div>
      ) : (
        <>
          <DocumentTable
            documents={documents}
            title="All Documents"
            subtitle={meta ? `${meta.total} document${meta.total === 1 ? '' : 's'}` : ''}
          />

          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => goToPage(meta.current_page - 1)}
                disabled={meta.current_page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-[13px] text-slate-400">
                Page {meta.current_page} of {meta.last_page}
              </span>
              <button
                onClick={() => goToPage(meta.current_page + 1)}
                disabled={meta.current_page >= meta.last_page}
                className="flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
