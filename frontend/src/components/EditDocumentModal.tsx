import { useState, type FormEvent } from 'react';
import { Pencil, Loader2, AlertCircle } from 'lucide-react';
import Modal from '@/components/Modal';
import type { ApiDocument } from '@/api/documents';

export interface EditDocumentData {
  title: string;
  description: string;
}

interface EditDocumentModalProps {
  open: boolean;
  onClose: () => void;
  document: ApiDocument | null;
  onSave: (data: EditDocumentData) => Promise<void>;
}

export default function EditDocumentModal({ open, onClose, document: doc, onSave }: EditDocumentModalProps) {
  const [title, setTitle] = useState(doc?.title ?? '');
  const [description, setDescription] = useState(doc?.description ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The modal stays mounted, so re-seed the form whenever it opens for a document.
  const seedKey = open && doc ? doc.uuid : null;
  const [seededFor, setSeededFor] = useState<string | null>(seedKey);
  if (seedKey !== seededFor) {
    setSeededFor(seedKey);
    if (doc && seedKey) {
      setTitle(doc.title);
      setDescription(doc.description ?? '');
      setError(null);
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await onSave({ title: title.trim(), description: description.trim() });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Document"
      subtitle={doc?.title}
      icon={<Pencil className="w-5 h-5" />}
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-[14px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            className="flex items-center gap-2 px-4 py-2.5 text-[14px] font-semibold text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 rounded-lg transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>Save Changes</>
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

        <div>
          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Document Title</label>
          <input
            type="text"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 text-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Optional notes about this document"
            className="w-full px-4 py-2.5 text-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800 outline-none transition-all resize-none"
          />
        </div>

        <p className="text-[12px] text-slate-400">
          Folder and version aren't editable here — moving a document isn't supported yet, and a new
          version is created by uploading a new file, not by editing this form.
        </p>
      </form>
    </Modal>
  );
}
