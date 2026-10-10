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

export interface OtpSentResponse {
  message: string;
  /** Seconds until the code expires. */
  expires_in: number;
  /** Seconds before another code can be requested. */
  resend_in: number;
}

interface MessageResponse {
  message: string;
}

/** Registration step 1: email a verification code (fails with 422 if the email is taken). */
export function sendRegisterOtp(email: string): Promise<OtpSentResponse> {
  return apiFetch<OtpSentResponse>('/api/register/send-otp', { method: 'POST', body: { email } });
}

/** Registration step 2: the account is only created if the emailed code checks out. */
export function register(
  name: string,
  email: string,
  password: string,
  passwordConfirmation: string,
  otp: string,
): Promise<ApiUser> {
  return apiFetch<UserEnvelope>('/api/register', {
    method: 'POST',
    body: { name, email, password, password_confirmation: passwordConfirmation, otp },
  }).then((res) => res.data);
}

/** Always resolves with the same message, whether or not the email has an account. */
export function requestPasswordReset(email: string): Promise<OtpSentResponse> {
  return apiFetch<OtpSentResponse>('/api/forgot-password', { method: 'POST', body: { email } });
}

export function resetPassword(
  email: string,
  otp: string,
  password: string,
  passwordConfirmation: string,
): Promise<MessageResponse> {
  return apiFetch<MessageResponse>('/api/reset-password', {
    method: 'POST',
    body: { email, otp, password, password_confirmation: passwordConfirmation },
  });
}

export function changePassword(
  currentPassword: string,
  password: string,
  passwordConfirmation: string,
): Promise<MessageResponse> {
  return apiFetch<MessageResponse>('/api/user/password', {
    method: 'PUT',
    body: { current_password: currentPassword, password, password_confirmation: passwordConfirmation },
  });
}
