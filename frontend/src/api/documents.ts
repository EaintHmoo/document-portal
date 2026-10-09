import { apiFetch } from './client';
import type { ApiUser } from './auth';
import type { ApiFolder } from './folders';

export interface ApiDocumentVersion {
  id: number;
  version_number: number;
  original_filename: string;
  extension: string;
  size_bytes: number;
  change_note: string | null;
  author: ApiUser | null;
  created_at: string;
}

export interface ApiDocument {
  uuid: string;
  title: string;
  description: string | null;
  extension: string;
  mime_type: string;
  size_bytes: number;
  version_count: number;
  can_edit: boolean;
  can_delete: boolean;
  folder: ApiFolder | null;
  uploaded_by: ApiUser | null;
  updated_by: ApiUser | null;
  current_version: ApiDocumentVersion | null;
  versions?: ApiDocumentVersion[];
  created_at: string;
  updated_at: string;
}

interface DocumentCollectionEnvelope {
  data: ApiDocument[];
  links: Record<string, string | null>;
  meta: { current_page: number; last_page: number; total: number; per_page: number };
}

interface DocumentEnvelope {
  data: ApiDocument;
}

export interface DocumentListParams {
  q?: string;
  folder_id?: number;
  extension?: string;
  sort?: 'newest' | 'oldest' | 'name_asc' | 'name_desc';
  page?: number;
}

export function fetchDocuments(params: DocumentListParams = {}): Promise<DocumentCollectionEnvelope> {
  const query = new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([key, value]) => [key, String(value)]),
  ).toString();

  return apiFetch<DocumentCollectionEnvelope>(`/api/documents${query ? `?${query}` : ''}`);
}

export function fetchDocument(uuid: string): Promise<ApiDocument> {
  return apiFetch<DocumentEnvelope>(`/api/documents/${uuid}`).then((res) => res.data);
}

export function uploadDocument(data: {
  folder_id: number;
  title: string;
  description?: string;
  file: File;
}): Promise<ApiDocument> {
  const form = new FormData();
  form.append('folder_id', String(data.folder_id));
  form.append('title', data.title);
  if (data.description) form.append('description', data.description);
  form.append('file', data.file);

  return apiFetch<DocumentEnvelope>('/api/documents', { method: 'POST', body: form }).then((res) => res.data);
}

export function uploadDocumentVersion(uuid: string, file: File, changeNote?: string): Promise<ApiDocument> {
  const form = new FormData();
  form.append('file', file);
  if (changeNote) form.append('change_note', changeNote);

  return apiFetch<DocumentEnvelope>(`/api/documents/${uuid}/versions`, { method: 'POST', body: form }).then(
    (res) => res.data,
  );
}

export function updateDocument(
  uuid: string,
  data: Partial<{ title: string; description: string }>,
): Promise<ApiDocument> {
  return apiFetch<DocumentEnvelope>(`/api/documents/${uuid}`, { method: 'PATCH', body: data }).then((res) => res.data);
}

export function deleteDocument(uuid: string): Promise<void> {
  return apiFetch<void>(`/api/documents/${uuid}`, { method: 'DELETE' });
}

export function getDownloadUrl(uuid: string): Promise<{ download_url: string; expires_in: number }> {
  return apiFetch(`/api/documents/${uuid}/download`);
}

export function getVersionDownloadUrl(uuid: string, versionId: number): Promise<{ download_url: string; expires_in: number }> {
  return apiFetch(`/api/documents/${uuid}/versions/${versionId}/download`);
}

export function deleteDocumentVersion(uuid: string, versionId: number): Promise<ApiDocument> {
  return apiFetch<DocumentEnvelope>(`/api/documents/${uuid}/versions/${versionId}`, { method: 'DELETE' }).then(
    (res) => res.data,
  );
}
