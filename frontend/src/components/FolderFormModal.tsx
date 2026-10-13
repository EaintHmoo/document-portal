import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { FolderPlus, Pencil, Loader2, Globe, Lock, AlertCircle } from 'lucide-react';
import Modal from '@/components/Modal';
import type { ApiFolder } from '@/api/folders';
import { buildFolderIndex, folderOptions } from '@/utils/folders';

export interface FolderFormData {
  name: string;
  description: string;
  is_public: boolean;
  parent_id: number | null;
}

interface FolderFormModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  folder?: ApiFolder | null;
  /** Every folder the user can see — the parent picker's options. */
  folders: ApiFolder[];
  /** Parent preselected when creating (the folder currently being browsed). */
  defaultParentId?: number | null;
  /** Moving folders is admin-only; without it the parent picker is hidden. */
  canChooseParent: boolean;
  onSubmit: (data: FolderFormData) => Promise<void>;
}

export default function FolderFormModal({
  open, onClose, mode, folder, folders, defaultParentId = null, canChooseParent, onSubmit,
}: FolderFormModalProps) {
  const initialParentId = mode === 'edit' ? folder?.parent_id ?? null : defaultParentId;
  const [name, setName] = useState(folder?.name ?? '');
  const [description, setDescription] = useState(folder?.description ?? '');
  const [isPublic, setIsPublic] = useState(folder?.is_public ?? false);
  const [parentId, setParentId] = useState<number | null>(initialParentId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = mode === 'edit';

  const reset = () => {
    setName(folder?.name ?? '');
    setDescription(folder?.description ?? '');
    setIsPublic(folder?.is_public ?? false);
    setParentId(initialParentId);
    setError(null);
  };

  // The modal stays mounted between uses, so re-seed the fields from the
  // folder being edited (or the folder being browsed) every time it opens.
  useEffect(() => {
    if (open) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, folder?.id, defaultParentId]);

  // A folder can't move into itself or its own subfolders.
  const parentOptions = useMemo(() => {
    const excluded = folder ? buildFolderIndex(folders).selfAndDescendantIds(folder.id) : new Set<number>();
    return folderOptions(folders, (f) => !excluded.has(f.id));
  }, [folders, folder]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await onSubmit({ name: name.trim(), description: description.trim(), is_public: isPublic, parent_id: parentId });
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the folder. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? 'Edit Folder' : 'Create New Folder'}
      subtitle={isEdit ? 'Update folder name, description, and visibility' : 'Organize documents into a new category'}
      icon={isEdit ? <Pencil className="w-5 h-5" /> : <FolderPlus className="w-5 h-5" />}
      footer={
        <>
          <button
            onClick={handleClose}
            className="px-4 py-2.5 text-[14px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className="flex items-center gap-2 px-4 py-2.5 text-[14px] font-semibold text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 rounded-lg transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isEdit ? 'Saving...' : 'Creating...'}
              </>
            ) : (
              <>{isEdit ? 'Save Changes' : 'Create Folder'}</>
            )}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-start gap-2.5 px-4 py-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl">
            <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
            <p className="text-[13px] text-rose-700 dark:text-rose-400 font-medium">{error}</p>
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Folder Name</label>
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Legal & Compliance"
            className="w-full px-4 py-2.5 text-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800 outline-none transition-all"
          />
        </div>

        {/* Parent folder */}
        {canChooseParent && (
          <div>
            <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Parent Folder</label>
            <select
              value={parentId ?? ''}
              onChange={(e) => setParentId(e.target.value === '' ? null : Number(e.target.value))}
              className="w-full px-4 py-2.5 text-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-slate-400 dark:focus:border-slate-500 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800 outline-none transition-all cursor-pointer"
            >
              <option value="">None (top level)</option>
              {parentOptions.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Access is set per folder and is not inherited from the parent.
            </p>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What kind of documents live here? (optional)"
            rows={3}
            className="w-full px-4 py-2.5 text-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800 outline-none transition-all resize-none"
          />
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-200 mb-2">Visibility</label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setIsPublic(false)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                !isPublic ? 'border-slate-800 bg-slate-50 dark:bg-slate-800/50 ring-2 ring-slate-200 dark:ring-slate-700' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <Lock className={`w-4 h-4 shrink-0 ${!isPublic ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'}`} />
              <div>
                <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">Private</p>
                <p className="text-[11px] text-slate-400">Only granted users</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setIsPublic(true)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                isPublic ? 'border-slate-800 bg-slate-50 dark:bg-slate-800/50 ring-2 ring-slate-200 dark:ring-slate-700' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <Globe className={`w-4 h-4 shrink-0 ${isPublic ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'}`} />
              <div>
                <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">Public</p>
                <p className="text-[11px] text-slate-400">Everyone can view</p>
              </div>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
