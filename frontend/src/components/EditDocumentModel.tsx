import { useState, type FormEvent } from 'react';
import { Pencil, Loader2 } from 'lucide-react';
import Modal from '@/components/Modal';
import type { DocumentItem } from '@/data/mockData';

interface EditDocumentModalProps {
  open: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  folders: string[];
  onSave: (data: { name: string; folder: string; status: DocumentItem['status']; version: string }) => void;
}

const statusOptions: { value: DocumentItem['status']; label: string; color: string }[] = [
  { value: 'active', label: 'Active', color: 'text-emerald-600' },
  { value: 'pending', label: 'Pending Review', color: 'text-amber-600' },
  { value: 'archived', label: 'Archived', color: 'text-slate-500' },
];

export default function EditDocumentModal({ open, onClose, document: doc, folders, onSave }: EditDocumentModalProps) {
  const [name, setName] = useState(doc?.name ?? '');
  const [folder, setFolder] = useState(doc?.folder ?? folders[0] ?? '');
  const [status, setStatus] = useState<DocumentItem['status']>(doc?.status ?? 'active');
  const [version, setVersion] = useState(doc?.version ?? 'v1.0');
  const [loading, setLoading] = useState(false);

  // Sync state when doc changes
  const formKey = doc?.id ?? 'none';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setTimeout(() => {
      onSave({ name: name.trim(), folder, status, version });
      setLoading(false);
      onClose();
    }, 500);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Document"
      subtitle={doc?.name}
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
            disabled={loading || !name.trim()}
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
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Document Name</label>
          <input
            type="text"
            required
            autoFocus
            defaultValue={doc?.name ?? name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 text-[14px] bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Folder</label>
          <select
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="w-full px-4 py-2.5 text-[14px] bg-white border border-slate-200 rounded-xl focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all cursor-pointer"
          >
            {folders.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Version</label>
            <input
              type="text"
              required
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="e.g. v1.0"
              className="w-full px-4 py-2.5 text-[14px] bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as DocumentItem['status'])}
              className="w-full px-4 py-2.5 text-[14px] bg-white border border-slate-200 rounded-xl focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all cursor-pointer"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
}
