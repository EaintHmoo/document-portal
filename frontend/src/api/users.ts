import { apiFetch } from './client';
import type { ApiRole } from './auth';

export interface ApiUserListItem {
  id: number;
  name: string;
  email: string;
  role: ApiRole;
  is_active: boolean;
  last_login_at: string | null;
}

interface UserCollectionEnvelope {
  data: ApiUserListItem[];
  links: Record<string, string | null>;
  meta: { current_page: number; last_page: number; total: number; per_page: number };
}

interface UserEnvelope {
  data: ApiUserListItem;
}

export interface UserListParams {
  keyword?: string;
  role?: ApiRole;
  is_active?: boolean;
  page?: number;
}

export function fetchUsers(params: UserListParams = {}): Promise<UserCollectionEnvelope> {
  const query = new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([key, value]) => [key, String(value)]),
  ).toString();

  return apiFetch<UserCollectionEnvelope>(`/api/users${query ? `?${query}` : ''}`);
}

export function updateUser(
  id: number,
  data: Partial<{ role: ApiRole; is_active: boolean }>,
): Promise<ApiUserListItem> {
  return apiFetch<UserEnvelope>(`/api/users/${id}`, { method: 'PATCH', body: data }).then((res) => res.data);
}
