import { apiFetch } from './client';
import type { ApiUser } from './auth';
import type { ApiDocument } from './documents';
import type { ApiFolder } from './folders';

export interface ApiActivityLog {
  id: number;
  action: string;
  properties: Record<string, unknown> | null;
  user: ApiUser | null;
  created_at: string;
}

export interface AdminDashboard {
  role: 'admin';
  total_users: number;
  total_documents: number;
  total_folders: number;
  recent_documents: ApiDocument[];
  recent_activities: ApiActivityLog[];
}

export interface UserDashboard {
  role: 'user';
  accessible_document_count: number;
  accessible_folders: ApiFolder[];
  recent_documents: ApiDocument[];
  recent_activities: ApiActivityLog[];
}

export type DashboardSummary = AdminDashboard | UserDashboard;

interface DashboardEnvelope {
  data: Omit<AdminDashboard, 'role'> | Omit<UserDashboard, 'role'>;
}

export async function fetchDashboard(): Promise<DashboardSummary> {
  const { data } = await apiFetch<DashboardEnvelope>('/api/dashboard');

  return 'total_users' in data ? { role: 'admin', ...data } : { role: 'user', ...data };
}
