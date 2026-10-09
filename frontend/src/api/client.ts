const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export class ApiError extends Error {
  status: number;
  errors: Record<string, string[]> | null;

  constructor(message: string, status: number, errors: Record<string, string[]> | null = null) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  /** First validation message for a field, if the server returned one. */
  fieldError(field: string): string | null {
    return this.errors?.[field]?.[0] ?? null;
  }
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Sanctum's SPA auth relies on an XSRF-TOKEN cookie that only exists after
 * hitting /sanctum/csrf-cookie. Every mutating request needs that cookie
 * echoed back as the X-XSRF-TOKEN header, so we fetch it once per session
 * (not every request) and refresh it if it's ever missing.
 */
export async function ensureCsrfCookie(): Promise<void> {
  if (readCookie('XSRF-TOKEN')) return;

  await fetch(`${API_URL}/sanctum/csrf-cookie`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
}

interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const isMutation = options.method && options.method !== 'GET';

  if (isMutation) {
    await ensureCsrfCookie();
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      // Only set Content-Type when there's a body: this header alone is what
      // forces the browser into a CORS preflight, so a plain GET (e.g. the
      // session check on app load) skips the extra round trip.
      ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(isMutation ? { 'X-XSRF-TOKEN': readCookie('XSRF-TOKEN') ?? '' } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      payload?.message ?? 'Something went wrong. Please try again.',
      response.status,
      payload?.errors ?? null,
    );
  }

  return payload as T;
}
