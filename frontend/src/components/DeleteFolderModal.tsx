import { useState } from 'react';
import { Trash2, AlertTriangle, Loader2, FolderOpen, AlertCircle } from 'lucide-react';
import Modal from '@/components/Modal';
import type { ApiFolder } from '@/api/folders';

interface DeleteFolderModalProps {
  open: boolean;
  onClose: () => void;
  folder: ApiFolder | null;
  onConfirm: () => Promise<void>;
}

export default function DeleteFolderModal({ open, onClose, folder, onConfirm }: DeleteFolderModalProps) {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await onConfirm();
      setConfirmed(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete this folder. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmed(false);
    setError(null);
    onClose();
  };

  if (!folder) return null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Delete Folder"
      subtitle="This action cannot be undone"
      icon={<Trash2 className="w-5 h-5 text-rose-500" />}
      maxWidth="max-w-md"
      footer={
        <>
          <button
            onClick={handleClose}
            className="px-4 py-2.5 text-[14px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!confirmed || loading}
            className="flex items-center gap-2 px-4 py-2.5 text-[14px] font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Folder
              </>
            )}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 px-4 py-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl">
            <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
            <p className="text-[13px] text-rose-700 dark:text-rose-400 font-medium">{error}</p>
          </div>
        )}

        {/* Warning banner */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-[13px] font-semibold text-amber-800 dark:text-amber-400">Warning: Destructive Action</p>
            <p className="text-[12px] text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
              A folder can only be deleted once it's empty — if it still has documents, the server will
              reject this and you'll need to move or delete them first.
            </p>
          </div>
        </div>

        {/* Folder info */}
        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
            <FolderOpen className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-slate-700 dark:text-slate-200 truncate">{folder.name}</p>
            <p className="text-[12px] text-slate-400">{folder.document_count ?? 0} documents</p>
          </div>
        </div>

        {/* Confirmation checkbox */}
        <label className="flex items-start gap-2.5 cursor-pointer select-none p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-rose-600 dark:text-rose-400 focus:ring-rose-300 mt-0.5"
          />
          <span className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
            I understand that <span className="font-semibold text-slate-800 dark:text-slate-100">{folder.name}</span> will be
            permanently deleted. This cannot be undone.
          </span>
        </label>
      </div>
    </Modal>
  );
}
