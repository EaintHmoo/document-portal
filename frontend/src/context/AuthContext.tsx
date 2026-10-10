import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ApiError } from '../api/client';
import { fetchCurrentUser, login, logout, register, type ApiRole, type ApiUser } from '../api/auth';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  initials: string;
  role: ApiRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (name: string, email: string, password: string, passwordConfirmation: string, otp: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getInitials(name: string): string {
  return (
    name
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U'
  );
}

function toAuthUser(apiUser: ApiUser): AuthUser {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.name,
    initials: getInitials(apiUser.name),
    role: apiUser.role,
  };
}

/** Everything that isn't a known validation error collapses to one safe, generic message. */
function toErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    return err.message || fallback;
  }
  return fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser()
      .then((apiUser) => setUser(toAuthUser(apiUser)))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const apiUser = await login(email, password);
      setUser(toAuthUser(apiUser));
      return { error: null };
    } catch (err) {
      return { error: toErrorMessage(err, 'Invalid email or password. Please try again.') };
    }
  };

  const signUp = async (name: string, email: string, password: string, passwordConfirmation: string, otp: string) => {
    try {
      await register(name, email, password, passwordConfirmation, otp);
      return { error: null };
    } catch (err) {
      return { error: toErrorMessage(err, 'Could not create your account. Please try again.') };
    }
  };

  const signOut = async () => {
    try {
      await logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
