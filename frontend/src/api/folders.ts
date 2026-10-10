import { apiFetch } from './client';
import type { ApiUser, ApiRole } from './auth';

export interface ApiFolder {
  id: number;
  parent_id: number | null;
  name: string;
  description: string | null;
  is_public: boolean;
  can_upload: boolean;
  document_count: number | null;
  created_by: ApiUser | null;
  created_at: string;
  updated_at: string;
}

export interface ApiFolderAccessEntry {
  id: number;
  name: string;
  email: string;
  role: ApiRole;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface FolderAccessGrant {
  user_id: number;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

interface FolderCollectionEnvelope {
  data: ApiFolder[];
}

interface FolderEnvelope {
  data: ApiFolder;
}

interface FolderAccessEnvelope {
  data: ApiFolderAccessEntry[];
}

export function fetchFolders(): Promise<ApiFolder[]> {
  return apiFetch<FolderCollectionEnvelope>('/api/folders').then((res) => res.data);
}

export function createFolder(data: {
  name: string;
  description?: string;
  is_public?: boolean;
  parent_id?: number | null;
}): Promise<ApiFolder> {
  return apiFetch<FolderEnvelope>('/api/folders', { method: 'POST', body: data }).then((res) => res.data);
}

export function updateFolder(
  id: number,
  data: Partial<{ name: string; description: string; is_public: boolean; parent_id: number | null }>,
): Promise<ApiFolder> {
  return apiFetch<FolderEnvelope>(`/api/folders/${id}`, { method: 'PATCH', body: data }).then((res) => res.data);
}

export function deleteFolder(id: number): Promise<void> {
  return apiFetch<void>(`/api/folders/${id}`, { method: 'DELETE' });
}

export function fetchFolderAccess(id: number): Promise<ApiFolderAccessEntry[]> {
  return apiFetch<FolderAccessEnvelope>(`/api/folders/${id}/access`).then((res) => res.data);
}

export function syncFolderAccess(
  id: number,
  grants: FolderAccessGrant[],
): Promise<ApiFolderAccessEntry[]> {
  return apiFetch<FolderAccessEnvelope>(`/api/folders/${id}/access`, { method: 'PUT', body: { grants } }).then(
    (res) => res.data,
  );
}
