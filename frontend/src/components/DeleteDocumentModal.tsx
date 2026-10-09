import { useState } from 'react';
import { Trash2, AlertTriangle, Loader2, FileText, AlertCircle } from 'lucide-react';
import Modal from '@/components/Modal';
import type { ApiDocument } from '@/api/documents';

interface DeleteDocumentModalProps {
  open: boolean;
  onClose: () => void;
  document: ApiDocument | null;
  onConfirm: () => Promise<void>;
}

export default function DeleteDocumentModal({ open, onClose, document: doc, onConfirm }: DeleteDocumentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete this document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!doc) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Document"
      subtitle="This action cannot be undone"
      icon={<Trash2 className="w-5 h-5 text-rose-500" />}
      maxWidth="max-w-md"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-[14px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
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
                Delete Document
              </>
            )}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
            <p className="text-[13px] text-rose-700 font-medium">{error}</p>
          </div>
        )}

        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-[12px] text-amber-700 leading-relaxed">
            This removes the document and all of its versions. This cannot be undone.
          </p>
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-slate-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-slate-700 truncate">{doc.title}</p>
            <p className="text-[12px] text-slate-400">v{doc.version_count} · {doc.extension.toUpperCase()}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
