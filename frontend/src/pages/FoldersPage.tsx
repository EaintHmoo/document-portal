import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FolderListPage from '../components/FolderListPage';
import FolderFormModal, { type FolderFormData } from '../components/FolderFormModal';
import FolderAccessModal from '../components/FolderAccessModal';
import DeleteFolderModal from '../components/DeleteFolderModal';
import UploadDocumentModal, { type UploadDocumentData } from '../components/UploadDocumentModal';
import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import { fetchFolders, createFolder, updateFolder, deleteFolder, type ApiFolder } from '../api/folders';
import { uploadDocument } from '../api/documents';

type ModalState =
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'edit'; folder: ApiFolder }
  | { type: 'access'; folder: ApiFolder }
  | { type: 'delete'; folder: ApiFolder }
  | { type: 'upload' };

export default function FoldersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [folders, setFolders] = useState<ApiFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ type: 'none' });

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    return fetchFolders()
      .then(setFolders)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Could not load folders. Please try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!user) return null;

  const handleCreate = async (data: FolderFormData) => {
    await createFolder(data);
    await load();
  };

  const handleEdit = async (data: FolderFormData) => {
    if (modal.type !== 'edit') return;
    await updateFolder(modal.folder.id, data);
    await load();
  };

  const handleDelete = async () => {
    if (modal.type !== 'delete') return;
    try {
      await deleteFolder(modal.folder.id);
    } catch (err) {
      throw new Error(
        err instanceof ApiError ? err.message : 'Could not delete this folder. Please try again.',
      );
    }
    await load();
  };

  const handleUpload = async (data: UploadDocumentData) => {
    try {
      await uploadDocument({
        folder_id: data.folderId,
        title: data.title,
        description: data.description || undefined,
        file: data.file,
      });
    } catch (err) {
      throw new Error(
        err instanceof ApiError ? err.message : 'Could not upload this document. Please try again.',
      );
    }
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1" />
        <button
          onClick={() => setModal({ type: 'upload' })}
          disabled={folders.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-all shadow-sm active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {loading ? (
        <LoadingScreen />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <AlertCircle className="w-8 h-8 text-rose-400" />
          <p className="text-[14px] font-semibold text-slate-700">Couldn't load folders</p>
          <p className="text-[13px] text-slate-400 max-w-sm">{error}</p>
        </div>
      ) : (
        <FolderListPage
          role={user.role}
          folders={folders}
          onNewFolder={() => setModal({ type: 'create' })}
          onEditFolder={(folder) => setModal({ type: 'edit', folder })}
          onDeleteFolder={(folder) => setModal({ type: 'delete', folder })}
          onManageAccess={(folder) => setModal({ type: 'access', folder })}
          onOpenFolder={(folder) => navigate(`/documents?folder_id=${folder.id}`)}
        />
      )}

      <FolderFormModal
        open={modal.type === 'create'}
        onClose={() => setModal({ type: 'none' })}
        mode="create"
        onSubmit={handleCreate}
      />

      <FolderFormModal
        open={modal.type === 'edit'}
        onClose={() => setModal({ type: 'none' })}
        mode="edit"
        folder={modal.type === 'edit' ? modal.folder : null}
        onSubmit={handleEdit}
      />

      <FolderAccessModal
        open={modal.type === 'access'}
        onClose={() => setModal({ type: 'none' })}
        folder={modal.type === 'access' ? modal.folder : null}
      />

      <DeleteFolderModal
        open={modal.type === 'delete'}
        onClose={() => setModal({ type: 'none' })}
        folder={modal.type === 'delete' ? modal.folder : null}
        onConfirm={handleDelete}
      />

      <UploadDocumentModal
        open={modal.type === 'upload'}
        onClose={() => setModal({ type: 'none' })}
        folders={folders.map((f) => ({ id: f.id, name: f.name }))}
        onUpload={handleUpload}
      />
    </div>
  );
}
