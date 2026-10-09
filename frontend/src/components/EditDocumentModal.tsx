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

  // Re-seed the form whenever a different document is opened.
  const formKey = doc?.uuid ?? 'none';

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
            className="px-4 py-2.5 text-[14px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            className="flex items-center gap-2 px-4 py-2.5 text-[14px] font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
      <form onSubmit={handleSubmit} key={formKey} className="space-y-5">
        {error && (
          <div className="flex items-start gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
            <p className="text-[13px] text-rose-700 font-medium">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Document Title</label>
          <input
            type="text"
            required
            autoFocus
            defaultValue={doc?.title ?? title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 text-[14px] bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Description</label>
          <textarea
            defaultValue={doc?.description ?? description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Optional notes about this document"
            className="w-full px-4 py-2.5 text-[14px] bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all resize-none"
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
