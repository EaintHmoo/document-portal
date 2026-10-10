/** Mirrors the backend's Password::defaults() — min 8, mixed case, a number. */
export function passwordChecks(password: string) {
  return [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'Contains uppercase and lowercase letters', valid: /[A-Z]/.test(password) && /[a-z]/.test(password) },
    { label: 'Contains a number', valid: /\d/.test(password) },
  ];
}

export function isStrongPassword(password: string): boolean {
  return passwordChecks(password).every((check) => check.valid);
}
