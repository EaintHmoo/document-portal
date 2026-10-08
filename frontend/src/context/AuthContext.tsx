import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Role } from '../data/mockData';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  initials: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'docportal_auth_user';
const ACCOUNTS_KEY = 'docportal_accounts';

interface StoredAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
}

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

function loadAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) as StoredAccount[] : [];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: StoredAccount[]): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function toAuthUser(account: StoredAccount): AuthUser {
  return {
    id: account.id,
    email: account.email,
    name: account.name,
    initials: getInitials(account.name),
    role: account.role,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as AuthUser);
    } catch {
      // ignore parse errors
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const accounts = loadAccounts();
    const account = accounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );

    if (!account) {
      return { error: 'Invalid email or password. Please try again.' };
    }

    const authUser = toAuthUser(account);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
    return { error: null };
  };

  const signUp = async (name: string, email: string, password: string) => {
    const accounts = loadAccounts();
    const exists = accounts.some((a) => a.email.toLowerCase() === email.toLowerCase());

    if (exists) {
      return { error: 'An account with this email already exists.' };
    }

    const account: StoredAccount = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      role: 'user',
    };

    saveAccounts([...accounts, account]);
    const authUser = toAuthUser(account);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
    return { error: null };
  };

  const signOut = async () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
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
