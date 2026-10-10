import { useRef, useState } from 'react';
import {
  FileText, Download, Trash2, UploadCloud, Loader2, AlertCircle,
  AlertTriangle, History, Folder as FolderIcon,
} from 'lucide-react';
import Modal from '@/components/Modal';
import type { ApiDocument, ApiDocumentVersion } from '@/api/documents';
import { fileTypeColors, defaultFileColor, MAX_UPLOAD_BYTES, MAX_UPLOAD_ERROR } from '@/utils/fileTypes';
import { formatBytes, formatDate } from '@/utils/format';

interface DocumentDetailModalProps {
  open: boolean;
  onClose: () => void;
  document: ApiDocument | null;
  loading: boolean;
  onDownloadVersion: (version: ApiDocumentVersion) => void;
  onDeleteVersion: (version: ApiDocumentVersion) => Promise<void>;
  onUploadVersion: (file: File, changeNote: string) => Promise<void>;
}

export default function DocumentDetailModal({
  open, onClose, document: doc, loading, onDownloadVersion, onDeleteVersion, onUploadVersion,
}: DocumentDetailModalProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [changeNote, setChangeNote] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  if (!doc) return null;

  const versions = doc.versions ?? [];
  const canDeleteVersions = doc.can_delete && versions.length > 1;

  const handleDelete = async (version: ApiDocumentVersion) => {
    setDeletingId(version.id);
    setDeleteError(null);
    try {
      await onDeleteVersion(version);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Could not delete this version. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleFileSelected = async (file: File | null) => {
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError(MAX_UPLOAD_ERROR);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      await onUploadVersion(file, changeNote.trim());
      setChangeNote('');
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Could not upload a new version. Please try again.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={doc.title}
      subtitle={doc.folder ? (
        <span className="flex items-center gap-1.5">
          <FolderIcon className="w-3.5 h-3.5" /> {doc.folder.name}
        </span>
      ) : undefined}
      icon={<History className="w-5 h-5" />}
      maxWidth="max-w-2xl"
      footer={
        <button
          onClick={onClose}
          className="px-4 py-2.5 text-[14px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Close
        </button>
      }
    >
      <div className="space-y-4">
        {doc.description && <p className="text-[13px] text-slate-500">{doc.description}</p>}

        {/* Upload new version */}
        {doc.can_edit && (
          <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2.5">
            {uploadError && (
              <div className="flex items-start gap-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                <p className="text-[12px] text-rose-700 font-medium">{uploadError}</p>
              </div>
            )}
            <input
              type="text"
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              placeholder="What changed in this version? (optional)"
              className="w-full px-3 py-2 text-[13px] bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
            />
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-[13px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              {uploading ? 'Uploading...' : 'Upload New Version'}
            </button>
          </div>
        )}

        {deleteError && (
          <div className="flex items-start gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
            <p className="text-[13px] text-rose-700 font-medium">{deleteError}</p>
          </div>
        )}

        {/* Version history */}
        <div>
          <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Version History ({versions.length})
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            </div>
          ) : (
            <div className="border border-slate-100 rounded-xl overflow-hidden max-h-80 overflow-y-auto scrollbar-thin">
              {versions.map((version, index) => {
                const fc = fileTypeColors[version.extension] ?? defaultFileColor;
                const isCurrent = version.id === doc.current_version?.id;
                return (
                  <div
                    key={version.id}
                    className={`flex items-center gap-3 px-4 py-3 ${index !== versions.length - 1 ? 'border-b border-slate-50' : ''}`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${fc.bg} ${fc.text}`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-semibold text-slate-700">v{version.version_number}</p>
                        {isCurrent && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {version.author?.name ?? 'Unknown'} · {formatDate(version.created_at)} · {formatBytes(version.size_bytes)}
                      </p>
                      {version.change_note && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5 truncate">"{version.change_note}"</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onDownloadVersion(version)}
                        title="Download this version"
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {doc.can_delete && (
                        <button
                          onClick={() => handleDelete(version)}
                          disabled={!canDeleteVersions || deletingId === version.id}
                          title={versions.length <= 1 ? "A document must keep at least one version" : 'Delete this version'}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {deletingId === version.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && versions.length <= 1 && doc.can_delete && (
            <p className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
              <AlertTriangle className="w-3.5 h-3.5" /> A document must keep at least one version — delete the whole document instead.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
