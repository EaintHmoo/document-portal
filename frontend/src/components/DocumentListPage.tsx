import {
  FileText, Search, Upload, Download, Pencil, Trash2,
  Folder, ArrowUpDown, ArrowUp, ArrowDown, ChevronRight, ChevronLeft, Inbox,
  Filter, X,
} from 'lucide-react';
import type { ApiDocument, DocumentListParams } from '@/api/documents';
import type { ApiFolder } from '@/api/folders';
import { folderOptions } from '@/utils/folders';
import { fileTypeColors, defaultFileColor, SUPPORTED_EXTENSIONS } from '@/utils/fileTypes';
import { formatBytes, formatDate } from '@/utils/format';

type SortValue = NonNullable<DocumentListParams['sort']>;

interface DocumentListPageProps {
  documents: ApiDocument[];
  folders: ApiFolder[];
  loading: boolean;
  total: number;
  page: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  search: string;
  onSearchChange: (value: string) => void;
  folderFilter: number | 'all';
  onFolderFilterChange: (value: number | 'all') => void;
  extensionFilter: string | 'all';
  onExtensionFilterChange: (value: string | 'all') => void;
  sort: SortValue;
  onSortChange: (value: SortValue) => void;
  onUpload: () => void;
  onOpenDetail: (doc: ApiDocument) => void;
  onEdit: (doc: ApiDocument) => void;
  onDelete: (doc: ApiDocument) => void;
  onDownload: (doc: ApiDocument) => void;
}

export default function DocumentListPage({
  documents, folders, loading, total, page, lastPage, onPageChange,
  search, onSearchChange, folderFilter, onFolderFilterChange,
  extensionFilter, onExtensionFilterChange, sort, onSortChange,
  onUpload, onOpenDetail, onEdit, onDelete, onDownload,
}: DocumentListPageProps) {
  const canUploadAnywhere = folders.some((f) => f.can_upload);
  const activeFilterCount = (folderFilter !== 'all' ? 1 : 0) + (extensionFilter !== 'all' ? 1 : 0);

  const toggleNameSort = () => onSortChange(sort === 'name_asc' ? 'name_desc' : 'name_asc');
  const toggleDateSort = () => onSortChange(sort === 'newest' ? 'oldest' : 'newest');

  const SortIcon = ({ active, asc }: { active: boolean; asc: boolean }) => {
    if (!active) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300" />;
    return asc ? <ArrowUp className="w-3.5 h-3.5 text-slate-600" /> : <ArrowDown className="w-3.5 h-3.5 text-slate-600" />;
  };

  const clearFilters = () => {
    onFolderFilterChange('all');
    onExtensionFilterChange('all');
  };

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[12px] text-slate-400 mb-1">
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-600 font-medium">Documents</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Document Management</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            {total} {total === 1 ? 'document' : 'documents'}
            {search && ` matching "${search}"`}
            {activeFilterCount > 0 && ` · ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`}
          </p>
        </div>
        {canUploadAnywhere && (
          <button
            onClick={onUpload}
            className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-all shadow-sm active:scale-[0.98]"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-9 pr-4 py-2 text-[13px] bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-slate-400 hidden sm:inline">Folder</span>
            <select
              value={folderFilter}
              onChange={(e) => onFolderFilterChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-3 py-2 text-[13px] font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-100 cursor-pointer"
            >
              <option value="all">All Folders</option>
              {folderOptions(folders).map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>

            <span className="text-[12px] font-medium text-slate-400 hidden sm:inline">
              <Filter className="w-3.5 h-3.5" />
            </span>
            <select
              value={extensionFilter}
              onChange={(e) => onExtensionFilterChange(e.target.value)}
              className="px-3 py-2 text-[13px] font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-100 cursor-pointer"
            >
              <option value="all">All Types</option>
              {SUPPORTED_EXTENSIONS.map((ext) => (
                <option key={ext} value={ext}>{ext.toUpperCase()}</option>
              ))}
            </select>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2.5 py-2 text-[12px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 bg-white border border-slate-200 rounded-xl">
          <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && documents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-slate-200 rounded-xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-[15px] font-bold text-slate-700">No documents found</h3>
          <p className="text-[13px] text-slate-400 mt-1 max-w-sm">
            {search || activeFilterCount > 0
              ? 'No documents match your current search and filters. Try adjusting them.'
              : 'No documents have been uploaded yet. Upload your first document to get started.'}
          </p>
          {canUploadAnywhere && (
            <button
              onClick={onUpload}
              className="mt-5 flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-900 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          )}
        </div>
      )}

      {/* Document table */}
      {!loading && documents.length > 0 && (
        <>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5">
                      <button onClick={toggleNameSort} className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
                        Document <SortIcon active={sort === 'name_asc' || sort === 'name_desc'} asc={sort === 'name_asc'} />
                      </button>
                    </th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5">Type</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5 hidden md:table-cell">Folder</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5 hidden lg:table-cell">Size</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5 hidden lg:table-cell">Version</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5 hidden md:table-cell">
                      <button onClick={toggleDateSort} className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
                        Date <SortIcon active={sort === 'newest' || sort === 'oldest'} asc={sort === 'oldest'} />
                      </button>
                    </th>
                    <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => {
                    const fc = fileTypeColors[doc.extension] ?? defaultFileColor;
                    return (
                      <tr
                        key={doc.uuid}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group cursor-pointer"
                        onClick={() => onOpenDetail(doc)}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg ${fc.bg} ${fc.text} flex items-center justify-center shrink-0`}>
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-slate-700 truncate max-w-[220px]">{doc.title}</p>
                              <p className="text-[11px] text-slate-400 md:hidden">{doc.folder?.name ?? '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md border uppercase ${fc.bg} ${fc.text} ${fc.border}`}>
                            {doc.extension}
                          </span>
                        </td>
                        <td className="px-3 py-3 hidden md:table-cell">
                          <span className="text-[12px] text-slate-500 flex items-center gap-1.5">
                            <Folder className="w-3.5 h-3.5 text-slate-300" />
                            {doc.folder?.name ?? '—'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-[12px] text-slate-500 hidden lg:table-cell">{formatBytes(doc.size_bytes)}</td>
                        <td className="px-3 py-3 hidden lg:table-cell">
                          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            v{doc.version_count}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-[12px] text-slate-500 whitespace-nowrap hidden md:table-cell">{formatDate(doc.created_at)}</td>
                        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onDownload(doc)}
                              title="Download"
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {doc.can_edit && (
                              <button
                                onClick={() => onEdit(doc)}
                                title="Edit"
                                className="flex items-center gap-1 px-2 py-1.5 text-[12px] font-semibold text-slate-500 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-700 transition-all"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                <span className="hidden xl:inline">Edit</span>
                              </button>
                            )}
                            {doc.can_delete && (
                              <button
                                onClick={() => onDelete(doc)}
                                title="Delete"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-[13px] text-slate-400">Page {page} of {lastPage}</span>
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= lastPage}
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
