import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { authExpiredEvent, endpoints, setAuthToken } from '../api/client';
import type { LoginResponse, Role } from '../types/api';

interface AuthContextValue {
  session?: LoginResponse;
  role?: Role;
  login: (email: string, password: string) => Promise<void>;
  devLogin: (role: Role) => Promise<void>;
  logout: () => void;
  canAccess: (page: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const storageKey = 'intraflow.session';
const devAccounts: Record<Role, { email: string; password: string }> = {
  Admin: { email: 'admin@intraflow.local', password: 'Admin123!' },
  Manager: { email: 'manager@intraflow.local', password: 'Manager123!' },
  Employee: { email: 'employee@intraflow.local', password: 'Employee123!' },
};

const accessMap: Record<Role, string[]> = {
  Admin: ['dashboard', 'employees', 'projects', 'approvals', 'erp', 'legacy', 'audit', 'roles'],
  Manager: ['dashboard', 'employees', 'projects', 'approvals', 'roles'],
  Employee: ['projects', 'approvals', 'roles'],
};

function readStoredSession() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return undefined;
    }

    const parsed = JSON.parse(raw) as LoginResponse;
    if (parsed.expiresAt && new Date(parsed.expiresAt).getTime() <= Date.now()) {
      localStorage.removeItem(storageKey);
      return undefined;
    }

    return parsed;
  } catch {
    localStorage.removeItem(storageKey);
    return undefined;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<LoginResponse | undefined>(readStoredSession);

  useEffect(() => {
    const handleAuthExpired = () => setSession(undefined);
    window.addEventListener(authExpiredEvent, handleAuthExpired);

    return () => window.removeEventListener(authExpiredEvent, handleAuthExpired);
  }, []);

  useEffect(() => {
    setAuthToken(session?.token);
    if (session) {
      localStorage.setItem(storageKey, JSON.stringify(session));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [session]);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    role: session?.role,
    async login(email: string, password: string) {
      setSession(await endpoints.login(email, password));
    },
    async devLogin(role: Role) {
      const account = devAccounts[role];
      setSession(await endpoints.login(account.email, account.password));
    },
    logout() {
      setSession(undefined);
    },
    canAccess(page: string) {
      if (!session) {
        return false;
      }

      return accessMap[session.role].includes(page);
    },
  }), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return value;
}
