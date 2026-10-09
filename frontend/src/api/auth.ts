import { apiFetch } from './client';

export type ApiRole = 'admin' | 'user';

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: ApiRole;
  is_active: boolean;
  last_login_at: string | null;
}

interface UserEnvelope {
  data: ApiUser;
}

export function fetchCurrentUser(): Promise<ApiUser> {
  return apiFetch<UserEnvelope>('/api/user').then((res) => res.data);
}

export function login(email: string, password: string): Promise<ApiUser> {
  return apiFetch<UserEnvelope>('/api/login', { method: 'POST', body: { email, password } }).then(
    (res) => res.data,
  );
}

export function logout(): Promise<void> {
  return apiFetch<void>('/api/logout', { method: 'POST' });
}

export function register(
  name: string,
  email: string,
  password: string,
  passwordConfirmation: string,
): Promise<ApiUser> {
  return apiFetch<UserEnvelope>('/api/register', {
    method: 'POST',
    body: { name, email, password, password_confirmation: passwordConfirmation },
  }).then((res) => res.data);
}
