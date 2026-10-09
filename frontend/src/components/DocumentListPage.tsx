import { useState, useMemo } from 'react';
import {
  FileText, Search, Upload, Download, Pencil, Trash2, Eye,
  Folder, ArrowUpDown, ArrowUp, ArrowDown, ChevronRight, Inbox,
  Filter, X,
} from 'lucide-react';
import type { Role, DocumentItem } from '@/data/mockData';
import { fileTypeColors } from '@/data/mockData';

type SortField = 'name' | 'size' | 'uploadedDate' | 'type';
type SortDir = 'asc' | 'desc';

interface DocumentListPageProps {
  role: Role;
  documents: DocumentItem[];
  folders: string[];
  onUpload: () => void;
  onView: (doc: DocumentItem) => void;
  onEdit: (doc: DocumentItem) => void;
  onDelete: (doc: DocumentItem) => void;
  onDownload: (doc: DocumentItem) => void;
}

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  archived: 'bg-slate-100 text-slate-500 border-slate-200',
};

const allTypes: DocumentItem['type'][] = ['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX', 'PPT', 'PPTX'];
const allStatuses: DocumentItem['status'][] = ['active', 'pending', 'archived'];

export default function DocumentListPage({
  role, documents, folders, onUpload, onView, onEdit, onDelete, onDownload,
}: DocumentListPageProps) {
  const canManage = role === 'admin';
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('uploadedDate');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filterFolder, setFilterFolder] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount =
    (filterFolder !== 'all' ? 1 : 0) +
    (filterType !== 'all' ? 1 : 0) +
    (filterStatus !== 'all' ? 1 : 0);

  const filtered = useMemo(() => {
    let result = documents.filter((d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.uploadedBy.toLowerCase().includes(search.toLowerCase())
    );
    if (filterFolder !== 'all') result = result.filter((d) => d.folder === filterFolder);
    if (filterType !== 'all') result = result.filter((d) => d.type === filterType);
    if (filterStatus !== 'all') result = result.filter((d) => d.status === filterStatus);

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortField === 'type') cmp = a.type.localeCompare(b.type);
      else if (sortField === 'size') cmp = parseFloat(a.size) - parseFloat(b.size);
      else if (sortField === 'uploadedDate') cmp = a.uploadedDate.localeCompare(b.uploadedDate);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [documents, search, filterFolder, filterType, filterStatus, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300" />;
    return sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-slate-600" /> : <ArrowDown className="w-3.5 h-3.5 text-slate-600" />;
  };

  const clearFilters = () => {
    setFilterFolder('all');
    setFilterType('all');
    setFilterStatus('all');
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
            {filtered.length} {filtered.length === 1 ? 'document' : 'documents'}
            {search && ` matching "${search}"`}
            {activeFilterCount > 0 && ` · ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDownload(documents[0])}
            disabled={documents.length === 0}
            className="flex items-center gap-2 px-3 py-2.5 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download All</span>
          </button>
          <button
            onClick={onUpload}
            className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-all shadow-sm active:scale-[0.98]"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or uploader..."
              className="w-full pl-9 pr-4 py-2 text-[13px] bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 text-[13px] font-semibold rounded-lg border transition-all ${
              showFilters || activeFilterCount > 0
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex items-center justify-center w-5 h-5 text-[11px] font-bold rounded-full bg-white text-slate-800">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter row */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
            {/* Folder filter */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-slate-400">Folder</span>
              <select
                value={filterFolder}
                onChange={(e) => setFilterFolder(e.target.value)}
                className="px-3 py-1.5 text-[13px] font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-100 cursor-pointer"
              >
                <option value="all">All Folders</option>
                {folders.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Type filter */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-slate-400">Type</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-1.5 text-[13px] font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-100 cursor-pointer"
              >
                <option value="all">All Types</option>
                {allTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-slate-400">Status</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 text-[13px] font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-100 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                {allStatuses.map((s) => (
                  <option key={s} value={s} className="capitalize">{s}</option>
                ))}
              </select>
            </div>

            {/* Clear filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
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
          <button
            onClick={onUpload}
            className="mt-5 flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-900 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      )}

      {/* Document table */}
      {filtered.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5">
                    <button onClick={() => toggleSort('name')} className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
                      Document <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5">
                    <button onClick={() => toggleSort('type')} className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
                      Type <SortIcon field="type" />
                    </button>
                  </th>
                  <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5 hidden md:table-cell">Folder</th>
                  <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5 hidden lg:table-cell">
                    <button onClick={() => toggleSort('size')} className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
                      Size <SortIcon field="size" />
                    </button>
                  </th>
                  <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5 hidden lg:table-cell">Version</th>
                  <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5 hidden sm:table-cell">Status</th>
                  <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5 hidden md:table-cell">
                    <button onClick={() => toggleSort('uploadedDate')} className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
                      Date <SortIcon field="uploadedDate" />
                    </button>
                  </th>
                  <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc) => {
                  const fc = fileTypeColors[doc.type];
                  return (
                    <tr
                      key={doc.id}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group cursor-pointer"
                      onClick={() => onView(doc)}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg ${fc.bg} ${fc.text} flex items-center justify-center shrink-0`}>
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-slate-700 truncate max-w-[220px]">{doc.name}</p>
                            <p className="text-[11px] text-slate-400 md:hidden">{doc.folder}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${fc.bg} ${fc.text} ${fc.border}`}>
                          {doc.type}
                        </span>
                      </td>
                      <td className="px-3 py-3 hidden md:table-cell">
                        <span className="text-[12px] text-slate-500 flex items-center gap-1.5">
                          <Folder className="w-3.5 h-3.5 text-slate-300" />
                          {doc.folder}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[12px] text-slate-500 hidden lg:table-cell">{doc.size}</td>
                      <td className="px-3 py-3 hidden lg:table-cell">
                        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {doc.version}
                        </span>
                      </td>
                      <td className="px-3 py-3 hidden sm:table-cell">
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border capitalize ${statusStyles[doc.status]}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[12px] text-slate-500 whitespace-nowrap hidden md:table-cell">{doc.uploadedDate}</td>
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View */}
                          <button
                            onClick={() => onView(doc)}
                            title="View Details"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {/* Download */}
                          <button
                            onClick={() => onDownload(doc)}
                            title="Download"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          {/* Edit */}
                          {canManage && (
                            <button
                              onClick={() => onEdit(doc)}
                              title="Edit"
                              className="flex items-center gap-1 px-2 py-1.5 text-[12px] font-semibold text-slate-500 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-700 transition-all"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">Edit</span>
                            </button>
                          )}
                          {/* Delete */}
                          {canManage && (
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
      )}
    </div>
  );
}
