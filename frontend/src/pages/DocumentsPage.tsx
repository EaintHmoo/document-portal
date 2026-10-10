import { useCallback, useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import DocumentListPage from '../components/DocumentListPage';
import EditDocumentModal, { type EditDocumentData } from '../components/EditDocumentModal';
import DeleteDocumentModal from '../components/DeleteDocumentModal';
import UploadDocumentModal, { type UploadDocumentData } from '../components/UploadDocumentModal';
import DocumentDetailModal from '../components/DocumentDetailModal';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import {
  fetchDocuments, fetchDocument, uploadDocument, uploadDocumentVersion, updateDocument, deleteDocument,
  deleteDocumentVersion, getDownloadUrl, getVersionDownloadUrl,
  type ApiDocument, type ApiDocumentVersion, type DocumentListParams,
} from '../api/documents';
import { fetchFolders, type ApiFolder } from '../api/folders';
import { folderOptions } from '../utils/folders';

type ModalState =
  | { type: 'none' }
  | { type: 'detail'; uuid: string }
  | { type: 'edit'; doc: ApiDocument }
  | { type: 'delete'; doc: ApiDocument }
  | { type: 'upload' };

export default function DocumentsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const folderIdParam = searchParams.get('folder_id');
  const q = searchParams.get('q') ?? '';
  const extension = searchParams.get('extension') ?? 'all';
  const sort = (searchParams.get('sort') as DocumentListParams['sort']) ?? 'newest';
  const page = Number(searchParams.get('page') ?? '1');

  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number }>({
    current_page: 1, last_page: 1, total: 0,
  });
  const [folders, setFolders] = useState<ApiFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const [detailDoc, setDetailDoc] = useState<ApiDocument | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    return fetchDocuments({
      folder_id: folderIdParam ? Number(folderIdParam) : undefined,
      q: q || undefined,
      extension: extension === 'all' ? undefined : extension,
      sort,
      page,
    })
      .then((res) => {
        setDocuments(res.data);
        setMeta(res.meta);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Could not load documents. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [folderIdParam, q, extension, sort, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetchFolders().then(setFolders).catch(() => {
      // Non-critical — filters/upload destination list just won't populate.
    });
  }, []);

  const updateParams = (patch: Record<string, string | undefined>, resetPage = true) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === 'all' || value === '') next.delete(key);
        else next.set(key, value);
      }
      if (resetPage) next.delete('page');
      return next;
    });
  };

  if (!user) return null;

  const handleDownload = async (doc: ApiDocument) => {
    try {
      const { download_url } = await getDownloadUrl(doc.uuid);
      window.open(download_url, '_blank', 'noopener,noreferrer');
    } catch {
      // Not worth a blocking error banner — the user can just try again.
    }
  };

  const handleOpenDetail = (doc: ApiDocument) => {
    setModal({ type: 'detail', uuid: doc.uuid });
    setDetailDoc(doc);
    setDetailLoading(true);
    fetchDocument(doc.uuid)
      .then(setDetailDoc)
      .catch(() => {
        // Keep showing the list-row data the modal already opened with.
      })
      .finally(() => setDetailLoading(false));
  };

  const handleDownloadVersion = async (version: ApiDocumentVersion) => {
    if (modal.type !== 'detail') return;
    try {
      const { download_url } = await getVersionDownloadUrl(modal.uuid, version.id);
      window.open(download_url, '_blank', 'noopener,noreferrer');
    } catch {
      // Not worth a blocking error banner — the user can just try again.
    }
  };

  const handleDeleteVersion = async (version: ApiDocumentVersion) => {
    if (modal.type !== 'detail') return;
    try {
      const updated = await deleteDocumentVersion(modal.uuid, version.id);
      setDetailDoc(updated);
    } catch (err) {
      throw new Error(err instanceof ApiError ? err.message : 'Could not delete this version. Please try again.');
    }
    await load();
  };

  const handleUploadVersion = async (file: File, changeNote: string) => {
    if (modal.type !== 'detail') return;
    try {
      const updated = await uploadDocumentVersion(modal.uuid, file, changeNote || undefined);
      setDetailDoc(updated);
    } catch (err) {
      throw new Error(err instanceof ApiError ? err.message : 'Could not upload a new version. Please try again.');
    }
    await load();
  };

  const handleEdit = async (data: EditDocumentData) => {
    if (modal.type !== 'edit') return;
    await updateDocument(modal.doc.uuid, data);
    await load();
  };

  const handleDelete = async () => {
    if (modal.type !== 'delete') return;
    try {
      await deleteDocument(modal.doc.uuid);
    } catch (err) {
      throw new Error(err instanceof ApiError ? err.message : 'Could not delete this document. Please try again.');
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
      throw new Error(err instanceof ApiError ? err.message : 'Could not upload this document. Please try again.');
    }
    await load();
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <AlertCircle className="w-8 h-8 text-rose-400" />
        <p className="text-[14px] font-semibold text-slate-700">Couldn't load documents</p>
        <p className="text-[13px] text-slate-400 max-w-sm">{error}</p>
      </div>
    );
  }

  return (
    <>
      <DocumentListPage
        documents={documents}
        folders={folders}
        loading={loading}
        total={meta.total}
        page={meta.current_page}
        lastPage={meta.last_page}
        onPageChange={(p) => updateParams({ page: String(p) }, false)}
        search={q}
        onSearchChange={(value) => updateParams({ q: value })}
        folderFilter={folderIdParam ? Number(folderIdParam) : 'all'}
        onFolderFilterChange={(value) => updateParams({ folder_id: value === 'all' ? undefined : String(value) })}
        extensionFilter={extension}
        onExtensionFilterChange={(value) => updateParams({ extension: value })}
        sort={sort ?? 'newest'}
        onSortChange={(value) => updateParams({ sort: value }, false)}
        onUpload={() => setModal({ type: 'upload' })}
        onOpenDetail={handleOpenDetail}
        onEdit={(doc) => setModal({ type: 'edit', doc })}
        onDelete={(doc) => setModal({ type: 'delete', doc })}
        onDownload={handleDownload}
      />

      <DocumentDetailModal
        open={modal.type === 'detail'}
        onClose={() => setModal({ type: 'none' })}
        document={detailDoc}
        loading={detailLoading}
        onDownloadVersion={handleDownloadVersion}
        onDeleteVersion={handleDeleteVersion}
        onUploadVersion={handleUploadVersion}
      />

      <EditDocumentModal
        open={modal.type === 'edit'}
        onClose={() => setModal({ type: 'none' })}
        document={modal.type === 'edit' ? modal.doc : null}
        onSave={handleEdit}
      />

      <DeleteDocumentModal
        open={modal.type === 'delete'}
        onClose={() => setModal({ type: 'none' })}
        document={modal.type === 'delete' ? modal.doc : null}
        onConfirm={handleDelete}
      />

      <UploadDocumentModal
        open={modal.type === 'upload'}
        onClose={() => setModal({ type: 'none' })}
        folders={folderOptions(folders, (f) => f.can_upload)}
        onUpload={handleUpload}
      />
    </>
  );
}
