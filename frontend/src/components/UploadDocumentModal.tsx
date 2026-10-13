import { useState, useRef, useEffect, type FormEvent } from 'react';
import { UploadCloud, X, Loader2, Check, AlertCircle } from 'lucide-react';
import Modal from '@/components/Modal';
import { fileTypeColors, MAX_UPLOAD_BYTES, MAX_UPLOAD_ERROR } from '@/utils/fileTypes';

export interface UploadDocumentData {
  file: File;
  title: string;
  description: string;
  folderId: number;
}

interface UploadDocumentModalProps {
  open: boolean;
  onClose: () => void;
  folders: { id: number; name: string }[];
  /** Preselected folder (e.g. the one being browsed), if it's in `folders`. */
  defaultFolderId?: number | null;
  onUpload: (data: UploadDocumentData) => Promise<void>;
}

const acceptedTypes = [
  { ext: 'pdf', label: '.pdf' },
  { ext: 'doc', label: '.doc' },
  { ext: 'docx', label: '.docx' },
  { ext: 'xls', label: '.xls' },
  { ext: 'xlsx', label: '.xlsx' },
  { ext: 'ppt', label: '.ppt' },
  { ext: 'pptx', label: '.pptx' },
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function titleFromFilename(filename: string): string {
  return filename.replace(/\.[^.]+$/, '');
}

export default function UploadDocumentModal({ open, onClose, folders, defaultFolderId, onUpload }: UploadDocumentModalProps) {
  const initialFolderId = folders.some((f) => f.id === defaultFolderId) ? defaultFolderId! : folders[0]?.id ?? 0;
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [folderId, setFolderId] = useState(initialFolderId);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const reset = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setFolderId(initialFolderId);
    setLoading(false);
    setDragging(false);
    setError(null);
  };

  // The modal is mounted (hidden) as soon as the page loads, before the
  // `folders` list has finished fetching — so the useState initializer
  // above locks `folderId` at 0 forever if nothing re-seeds it once real
  // folders exist. Re-seed on every open so the dropdown's default
  // selection and the actual state always agree, even on the very first
  // open before Cancel has ever run `reset()`.
  useEffect(() => {
    if (open) {
      setFolderId(initialFolderId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileSelect = (selected: File | null) => {
    if (!selected) return;
    if (selected.size > MAX_UPLOAD_BYTES) {
      setError(MAX_UPLOAD_ERROR);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setError(null);
    setFile(selected);
    if (!title) setTitle(titleFromFilename(selected.name));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim() || !folderId) return;

    setLoading(true);
    setError(null);
    try {
      await onUpload({ file, title: title.trim(), description: description.trim(), folderId });
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload this document. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Upload Document"
      subtitle="Add a new file to a folder"
      icon={<UploadCloud className="w-5 h-5" />}
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
            disabled={!file || !title.trim() || !folderId || loading}
            className="flex items-center gap-2 px-4 py-2.5 text-[14px] font-semibold text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 rounded-lg transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                Upload
              </>
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

        {/* Dropzone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFileSelect(e.dataTransfer.files[0] ?? null);
          }}
          className={`flex flex-col items-center justify-center gap-3 px-6 py-10 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
            dragging
              ? 'border-slate-400 dark:border-slate-500 bg-slate-50 dark:bg-slate-800/50'
              : file
                ? 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-500/10'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <>
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-center">
                <p className="text-[14px] font-semibold text-slate-700 dark:text-slate-200">{file.name}</p>
                <p className="text-[12px] text-slate-400 mt-0.5">{formatSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="flex items-center gap-1 text-[12px] font-medium text-slate-400 hover:text-rose-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Remove file
              </button>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <UploadCloud className="w-6 h-6 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-[14px] font-semibold text-slate-600 dark:text-slate-300">
                  Drag and drop or <span className="text-slate-800 dark:text-slate-100 underline">browse</span>
                </p>
                <p className="text-[12px] text-slate-400 mt-1">PDF, DOC, XLS, PPT up to 20 MB</p>
              </div>
            </>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document title"
            className="w-full px-4 py-2.5 text-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800 outline-none transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional notes about this document"
            rows={2}
            className="w-full px-4 py-2.5 text-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800 outline-none transition-all resize-none"
          />
        </div>

        {/* Folder selection */}
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Destination Folder</label>
          <select
            value={folderId}
            onChange={(e) => setFolderId(Number(e.target.value))}
            className="w-full px-4 py-2.5 text-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-slate-400 dark:focus:border-slate-500 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800 outline-none transition-all cursor-pointer"
          >
            {folders.length === 0 && <option value={0}>No folders available</option>}
            {folders.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        {/* Accepted types preview */}
        <div className="flex flex-wrap gap-1.5">
          {acceptedTypes.map((t) => {
            const fc = fileTypeColors[t.ext];
            return (
              <span
                key={t.ext}
                className={`text-[10px] font-bold px-2 py-1 rounded-md border ${fc.bg} ${fc.text} ${fc.border}`}
              >
                {t.label}
              </span>
            );
          })}
        </div>
      </form>
    </Modal>
  );
}
