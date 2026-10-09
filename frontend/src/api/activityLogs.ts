import { apiFetch } from './client';
import type { ApiActivityLog } from './dashboard';

export interface ActivityLogListParams {
  action?: string;
  from?: string;
  to?: string;
  page?: number;
}

interface ActivityLogCollectionEnvelope {
  data: ApiActivityLog[];
  links: Record<string, string | null>;
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    available_actions: string[];
  };
}

export function fetchActivityLogs(params: ActivityLogListParams = {}): Promise<ActivityLogCollectionEnvelope> {
  const query = new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([key, value]) => [key, String(value)]),
  ).toString();

  return apiFetch<ActivityLogCollectionEnvelope>(`/api/activity-logs${query ? `?${query}` : ''}`);
}
