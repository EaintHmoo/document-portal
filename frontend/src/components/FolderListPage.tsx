import { useState, useMemo } from 'react';
import {
  Folder as FolderIcon, Search, FolderPlus, LayoutGrid, List, Pencil,
  Trash2, Lock, Globe, ArrowUpDown, ArrowUp, ArrowDown,
  ChevronRight, Inbox, MoreVertical,
  Upload,
} from 'lucide-react';
import type { Role } from '@/types';
import type { ApiFolder } from '@/api/folders';

const palette = [
  { bg: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' },
  { bg: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500' },
  { bg: 'bg-amber-50 text-amber-600', dot: 'bg-amber-500' },
  { bg: 'bg-violet-50 text-violet-600', dot: 'bg-violet-500' },
  { bg: 'bg-rose-50 text-rose-600', dot: 'bg-rose-500' },
  { bg: 'bg-cyan-50 text-cyan-600', dot: 'bg-cyan-500' },
];

type SortField = 'name' | 'documentCount';
type SortDir = 'asc' | 'desc';

interface FolderListPageProps {
  role: Role;
  folders: ApiFolder[];
  onUploadDocument: () => void;
  onNewFolder: () => void;
  onEditFolder: (folder: ApiFolder) => void;
  onDeleteFolder: (folder: ApiFolder) => void;
  onManageAccess: (folder: ApiFolder) => void;
  onOpenFolder: (folder: ApiFolder) => void;
}

export default function FolderListPage({
  role, folders, onUploadDocument, onNewFolder, onEditFolder, onDeleteFolder, onManageAccess, onOpenFolder,
}: FolderListPageProps) {
  const canManage = role === 'admin';
  const canUploadAnywhere = folders.some((f) => f.can_upload);
  const [view, setView] = useState<'grid' | 'table'>('table');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const filtered = useMemo(() => {
    const result = folders.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));
    result.sort((a, b) => {
      const cmp =
        sortField === 'name' ? a.name.localeCompare(b.name) : (a.document_count ?? 0) - (b.document_count ?? 0);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [folders, search, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300" />;
    return sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-slate-600" /> : <ArrowDown className="w-3.5 h-3.5 text-slate-600" />;
  };

  const colorsFor = (folder: ApiFolder) => palette[folder.id % palette.length];

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[12px] text-slate-400 mb-1">
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-600 font-medium">Folders</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Folder Management</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            {filtered.length} {filtered.length === 1 ? 'folder' : 'folders'}
            {search && ` matching "${search}"`}
          </p>
        </div>
        <div className="flex items-center gap-3">
        {canManage && (
          <button
            onClick={onNewFolder}
            className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-all shadow-sm active:scale-[0.98]"
          >
            <FolderPlus className="w-4 h-4" />
            New Folder
          </button>
        )}
        {canUploadAnywhere && (
          <button
            onClick={onUploadDocument}
            className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-all shadow-sm active:scale-[0.98]"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search folders by name..."
            className="w-full pl-9 pr-4 py-2 text-[13px] bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-slate-400 hidden sm:inline">Sort by</span>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="px-3 py-2 text-[13px] font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-100 cursor-pointer"
          >
            <option value="name">Name</option>
            <option value="documentCount">Document Count</option>
          </select>

          <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setView('table')}
              className={`p-1.5 rounded-md transition-all ${view === 'table' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-md transition-all ${view === 'grid' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-slate-200 rounded-xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-[15px] font-bold text-slate-700">No folders found</h3>
          <p className="text-[13px] text-slate-400 mt-1 max-w-sm">
            {search
              ? `No folders match "${search}". Try a different search term.`
              : 'No folders have been created yet. Create your first folder to organize documents.'}
          </p>
          {canManage && !search && (
            <button
              onClick={onNewFolder}
              className="mt-5 flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-900 transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              Create Folder
            </button>
          )}
        </div>
      )}

      {/* Table view */}
      {filtered.length > 0 && view === 'table' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5">
                    <button onClick={() => toggleSort('name')} className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
                      Folder Name <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5">
                    <button onClick={() => toggleSort('documentCount')} className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
                      Documents <SortIcon field="documentCount" />
                    </button>
                  </th>
                  <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5 hidden md:table-cell">Visibility</th>
                  {canManage && <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((folder) => {
                  const colors = colorsFor(folder);
                  return (
                    <tr
                      key={folder.id}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group cursor-pointer"
                      onClick={() => onOpenFolder(folder)}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colors.bg}`}>
                            <FolderIcon className="w-[18px] h-[18px]" strokeWidth={2} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-slate-700 truncate">{folder.name}</p>
                            <p className="text-[11px] text-slate-400 md:hidden">{folder.document_count ?? 0} docs</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-[13px] font-medium text-slate-600">{folder.document_count ?? 0}</span>
                        <span className="text-[11px] text-slate-400 ml-1">docs</span>
                      </td>
                      <td className="px-3 py-3 hidden md:table-cell">
                        <span className="text-[12px] text-slate-500 flex items-center gap-1.5">
                          {folder.is_public ? (
                            <>
                              <Globe className="w-3.5 h-3.5 text-slate-300" /> Public
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5 text-slate-300" /> Private
                            </>
                          )}
                        </span>
                      </td>
                      {canManage && (
                        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onEditFolder(folder)}
                              title="Edit Folder"
                              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-semibold text-slate-500 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-700 transition-all"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span className="hidden lg:inline">Edit</span>
                            </button>
                            <button
                              onClick={() => onManageAccess(folder)}
                              title="Manage Access"
                              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-md hover:bg-blue-100 transition-all"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span className="hidden lg:inline">Access</span>
                            </button>
                            <button
                              onClick={() => onDeleteFolder(folder)}
                              title="Delete Folder"
                              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-md hover:bg-rose-100 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden lg:inline">Delete</span>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid view */}
      {filtered.length > 0 && view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((folder) => {
            const colors = colorsFor(folder);
            return (
              <div
                key={folder.id}
                className="group relative bg-white border border-slate-200 rounded-xl p-5 hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300 transition-all cursor-pointer"
                onClick={() => onOpenFolder(folder)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg}`}>
                    <FolderIcon className="w-6 h-6" strokeWidth={2} />
                  </div>
                  {!canManage && <MoreVertical className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </div>

                <h3 className="text-[14px] font-bold text-slate-800 truncate">{folder.name}</h3>
                <p className="text-[12px] text-slate-400 mt-1">
                  {folder.document_count ?? 0} {(folder.document_count ?? 0) === 1 ? 'document' : 'documents'}
                </p>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${colors.dot}`} />
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      {folder.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {folder.is_public ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onOpenFolder(folder); }}
                    className="flex items-center gap-1 text-[12px] font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Open
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {canManage && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-50" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onEditFolder(folder)}
                      title="Edit Folder"
                      className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[12px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-white hover:border-slate-300 transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => onManageAccess(folder)}
                      title="Manage Access"
                      className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[12px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-all"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Access
                    </button>
                    <button
                      onClick={() => onDeleteFolder(folder)}
                      title="Delete Folder"
                      className="flex items-center justify-center gap-1.5 px-2 py-1.5 text-[12px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg hover:bg-rose-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
