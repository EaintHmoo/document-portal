import { useState, type FormEvent } from 'react';
import { FolderPlus, Pencil, Loader2, Globe, Lock, AlertCircle } from 'lucide-react';
import Modal from '@/components/Modal';
import type { ApiFolder } from '@/api/folders';

export interface FolderFormData {
  name: string;
  description: string;
  is_public: boolean;
}

interface FolderFormModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  folder?: ApiFolder | null;
  onSubmit: (data: FolderFormData) => Promise<void>;
}

export default function FolderFormModal({ open, onClose, mode, folder, onSubmit }: FolderFormModalProps) {
  const [name, setName] = useState(folder?.name ?? '');
  const [description, setDescription] = useState(folder?.description ?? '');
  const [isPublic, setIsPublic] = useState(folder?.is_public ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = mode === 'edit';

  const reset = () => {
    setName(folder?.name ?? '');
    setDescription(folder?.description ?? '');
    setIsPublic(folder?.is_public ?? false);
    setError(null);
  };

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
      await onSubmit({ name: name.trim(), description: description.trim(), is_public: isPublic });
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
            className="px-4 py-2.5 text-[14px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className="flex items-center gap-2 px-4 py-2.5 text-[14px] font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="flex items-start gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
            <p className="text-[13px] text-rose-700 font-medium">{error}</p>
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Folder Name</label>
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Legal & Compliance"
            className="w-full px-4 py-2.5 text-[14px] bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What kind of documents live here? (optional)"
            rows={3}
            className="w-full px-4 py-2.5 text-[14px] bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all resize-none"
          />
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-2">Visibility</label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setIsPublic(false)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                !isPublic ? 'border-slate-800 bg-slate-50 ring-2 ring-slate-200' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Lock className={`w-4 h-4 shrink-0 ${!isPublic ? 'text-slate-800' : 'text-slate-400'}`} />
              <div>
                <p className="text-[13px] font-semibold text-slate-700">Private</p>
                <p className="text-[11px] text-slate-400">Only granted users</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setIsPublic(true)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                isPublic ? 'border-slate-800 bg-slate-50 ring-2 ring-slate-200' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Globe className={`w-4 h-4 shrink-0 ${isPublic ? 'text-slate-800' : 'text-slate-400'}`} />
              <div>
                <p className="text-[13px] font-semibold text-slate-700">Public</p>
                <p className="text-[11px] text-slate-400">Everyone can view</p>
              </div>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
