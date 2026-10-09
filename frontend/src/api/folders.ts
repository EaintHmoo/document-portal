import { apiFetch } from './client';
import type { ApiUser } from './auth';

export interface ApiFolder {
  id: number;
  parent_id: number | null;
  name: string;
  description: string | null;
  is_public: boolean;
  document_count: number | null;
  created_by: ApiUser | null;
  created_at: string;
  updated_at: string;
}

interface FolderCollectionEnvelope {
  data: ApiFolder[];
}

interface FolderEnvelope {
  data: ApiFolder;
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
  data: Partial<{ name: string; description: string; is_public: boolean }>,
): Promise<ApiFolder> {
  return apiFetch<FolderEnvelope>(`/api/folders/${id}`, { method: 'PATCH', body: data }).then((res) => res.data);
}

export function deleteFolder(id: number): Promise<void> {
  return apiFetch<void>(`/api/folders/${id}`, { method: 'DELETE' });
}
