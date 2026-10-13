import { useState, useMemo } from 'react';
import {
  Folder as FolderIcon, Search, FolderPlus, LayoutGrid, List, Pencil,
  Trash2, Lock, Globe, ArrowUpDown, ArrowUp, ArrowDown,
  ChevronRight, Inbox, MoreVertical,
  Upload, FileText, FolderTree,
} from 'lucide-react';
import type { Role } from '@/types';
import type { ApiFolder } from '@/api/folders';
import { buildFolderIndex } from '@/utils/folders';

const palette = [
  { bg: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
  { bg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  { bg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  { bg: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400', dot: 'bg-violet-500' },
  { bg: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400', dot: 'bg-rose-500' },
  { bg: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400', dot: 'bg-cyan-500' },
];

type SortField = 'name' | 'documentCount' | 'subfolderCount';
type SortDir = 'asc' | 'desc';

interface FolderListPageProps {
  role: Role;
  /** Every folder the user can access — the page derives the tree from it. */
  folders: ApiFolder[];
  /** The folder being browsed, or null at the top level. */
  currentFolder: ApiFolder | null;
  onNavigate: (folderId: number | null) => void;
  onViewDocuments: (folder: ApiFolder) => void;
  onUploadDocument: () => void;
  onNewFolder: () => void;
  onEditFolder: (folder: ApiFolder) => void;
  onDeleteFolder: (folder: ApiFolder) => void;
  onManageAccess: (folder: ApiFolder) => void;
}

export default function FolderListPage({
  role, folders, currentFolder, onNavigate, onViewDocuments,
  onUploadDocument, onNewFolder, onEditFolder, onDeleteFolder, onManageAccess,
}: FolderListPageProps) {
  const canManage = role === 'admin';
  const canUploadAnywhere = folders.some((f) => f.can_upload);
  const index = useMemo(() => buildFolderIndex(folders), [folders]);
  const breadcrumb = currentFolder ? index.ancestorsOf(currentFolder.id) : [];
  const subfolderCount = (folder: ApiFolder) => index.childrenOf(folder.id).length;
  const [view, setView] = useState<'grid' | 'table'>('table');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Browsing shows the current level only; searching looks across the
  // whole tree (with each match's path shown) so nested folders stay findable.
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const result = term
      ? folders.filter((f) => f.name.toLowerCase().includes(term))
      : [...index.childrenOf(currentFolder?.id ?? null)];
    const countFor = (f: ApiFolder) =>
      sortField === 'documentCount' ? f.document_count ?? 0 : index.childrenOf(f.id).length;
    result.sort((a, b) => {
      const cmp = sortField === 'name' ? a.name.localeCompare(b.name) : countFor(a) - countFor(b);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [folders, index, currentFolder, search, sortField, sortDir]);

  const parentPath = (folder: ApiFolder) => index.ancestorsOf(folder.id).map((f) => f.name).join(' / ');

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />;
    return sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" /> : <ArrowDown className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />;
  };

  const colorsFor = (folder: ApiFolder) => palette[folder.id % palette.length];

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <nav aria-label="Folder path" className="flex flex-wrap items-center gap-1.5 text-[12px] text-slate-400 mb-1">
            {currentFolder ? (
              <button onClick={() => onNavigate(null)} className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                Folders
              </button>
            ) : (
              <span className="text-slate-600 dark:text-slate-300 font-medium">Folders</span>
            )}
            {breadcrumb.map((ancestor) => (
              <span key={ancestor.id} className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5" />
                <button onClick={() => onNavigate(ancestor.id)} className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                  {ancestor.name}
                </button>
              </span>
            ))}
            {currentFolder && (
              <span className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-slate-600 dark:text-slate-300 font-medium">{currentFolder.name}</span>
              </span>
            )}
          </nav>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            {currentFolder ? currentFolder.name : 'Folder Management'}
          </h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            {filtered.length} {currentFolder && !search ? 'sub' : ''}{filtered.length === 1 ? 'folder' : 'folders'}
            {search && ` matching "${search}"`}
            {currentFolder?.description && !search && ` · ${currentFolder.description}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
        {currentFolder && (
          <button
            onClick={() => onViewDocuments(currentFolder)}
            className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-all shadow-sm active:scale-[0.98]"
          >
            <FileText className="w-4 h-4" />
            View Documents ({currentFolder.document_count ?? 0})
          </button>
        )}
        {canManage && (
          <button
            onClick={onNewFolder}
            className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 rounded-lg transition-all shadow-sm active:scale-[0.98]"
          >
            <FolderPlus className="w-4 h-4" />
            {currentFolder ? 'New Subfolder' : 'New Folder'}
          </button>
        )}
        {canUploadAnywhere && (
          <button
            onClick={onUploadDocument}
            className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 rounded-lg transition-all shadow-sm active:scale-[0.98]"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search all folders by name..."
            className="w-full pl-9 pr-4 py-2 text-[13px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-300 dark:focus:border-slate-600 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-slate-400 hidden sm:inline">Sort by</span>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="px-3 py-2 text-[13px] font-medium bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800 cursor-pointer"
          >
            <option value="name">Name</option>
            <option value="documentCount">Document Count</option>
            <option value="subfolderCount">Subfolder Count</option>
          </select>

          <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setView('table')}
              className={`p-1.5 rounded-md transition-all ${view === 'table' ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-700 dark:text-slate-200' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-md transition-all ${view === 'grid' ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-700 dark:text-slate-200' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-[15px] font-bold text-slate-700 dark:text-slate-200">
            {!search && currentFolder ? 'No subfolders' : 'No folders found'}
          </h3>
          <p className="text-[13px] text-slate-400 mt-1 max-w-sm">
            {search
              ? `No folders match "${search}". Try a different search term.`
              : currentFolder
                ? `"${currentFolder.name}" has no subfolders you can access.`
                : 'No folders have been created yet. Create your first folder to organize documents.'}
          </p>
          {!search && (
            <div className="mt-5 flex items-center gap-2">
              {currentFolder && (
                <button
                  onClick={() => onViewDocuments(currentFolder)}
                  className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  View Documents
                </button>
              )}
              {canManage && (
                <button
                  onClick={onNewFolder}
                  className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-slate-800 dark:bg-slate-700 rounded-lg hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors"
                >
                  <FolderPlus className="w-4 h-4" />
                  {currentFolder ? 'Create Subfolder' : 'Create Folder'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Table view */}
      {filtered.length > 0 && view === 'table' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-2.5">
                    <button onClick={() => toggleSort('name')} className="flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                      Folder Name <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-2.5">
                    <button onClick={() => toggleSort('documentCount')} className="flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                      Documents <SortIcon field="documentCount" />
                    </button>
                  </th>
                  <th className="text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-2.5 hidden sm:table-cell">
                    <button onClick={() => toggleSort('subfolderCount')} className="flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                      Subfolders <SortIcon field="subfolderCount" />
                    </button>
                  </th>
                  <th className="text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-2.5 hidden md:table-cell">Visibility</th>
                  {canManage && <th className="text-right text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-2.5">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((folder) => {
                  const colors = colorsFor(folder);
                  return (
                    <tr
                      key={folder.id}
                      className="border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
                      onClick={() => onNavigate(folder.id)}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colors.bg}`}>
                            <FolderIcon className="w-[18px] h-[18px]" strokeWidth={2} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{folder.name}</p>
                            {search && parentPath(folder) && (
                              <p className="text-[11px] text-slate-400 truncate">in {parentPath(folder)}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onViewDocuments(folder)}
                          title="View documents in this folder"
                          className="flex items-center gap-1 rounded-md px-1.5 py-0.5 -mx-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <span className="text-[13px] font-medium text-slate-600 dark:text-slate-300">{folder.document_count ?? 0}</span>
                          <span className="text-[11px] text-slate-400">docs</span>
                        </button>
                      </td>
                      <td className="px-3 py-3 hidden sm:table-cell">
                        <span className="text-[12px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <FolderTree className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" /> {subfolderCount(folder)}
                        </span>
                      </td>
                      <td className="px-3 py-3 hidden md:table-cell">
                        <span className="text-[12px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          {folder.is_public ? (
                            <>
                              <Globe className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" /> Public
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" /> Private
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
                              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span className="hidden lg:inline">Edit</span>
                            </button>
                            <button
                              onClick={() => onManageAccess(folder)}
                              title="Manage Access"
                              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-md hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span className="hidden lg:inline">Access</span>
                            </button>
                            <button
                              onClick={() => onDeleteFolder(folder)}
                              title="Delete Folder"
                              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-md hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all"
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
                className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-black/20 hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer"
                onClick={() => onNavigate(folder.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg}`}>
                    <FolderIcon className="w-6 h-6" strokeWidth={2} />
                  </div>
                  {!canManage && <MoreVertical className="w-4 h-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </div>

                <h3 className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{folder.name}</h3>
                {search && parentPath(folder) && (
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">in {parentPath(folder)}</p>
                )}
                <p className="text-[12px] text-slate-400 mt-1 flex items-center gap-1.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); onViewDocuments(folder); }}
                    className="hover:text-slate-700 dark:hover:text-slate-200 hover:underline transition-colors"
                  >
                    {folder.document_count ?? 0} {(folder.document_count ?? 0) === 1 ? 'document' : 'documents'}
                  </button>
                  <span>·</span>
                  <span>
                    {subfolderCount(folder)} {subfolderCount(folder) === 1 ? 'subfolder' : 'subfolders'}
                  </span>
                </p>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${colors.dot}`} />
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      {folder.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {folder.is_public ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onNavigate(folder.id); }}
                    className="flex items-center gap-1 text-[12px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
                  >
                    Open
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {canManage && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-50 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onEditFolder(folder)}
                      title="Edit Folder"
                      className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[12px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => onManageAccess(folder)}
                      title="Manage Access"
                      className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[12px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Access
                    </button>
                    <button
                      onClick={() => onDeleteFolder(folder)}
                      title="Delete Folder"
                      className="flex items-center justify-center gap-1.5 px-2 py-1.5 text-[12px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all"
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
