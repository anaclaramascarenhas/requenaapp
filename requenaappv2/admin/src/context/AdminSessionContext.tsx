import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, setToken } from '../api/client';
import type { Admin } from '../api/types';

type SessionState =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'ready'; admin: Admin };

type SessionContextValue = SessionState & {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    api.getMe()
      .then((admin) => { if (!cancelled) setState({ status: 'ready', admin }); })
      .catch(() => { if (!cancelled) { setToken(null); setState({ status: 'anonymous' }); } });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { token, admin } = await api.login(username, password);
    setToken(token);
    setState({ status: 'ready', admin });
  }, []);

  const logout = useCallback(() => {
    api.logout().catch(() => {});
    setToken(null);
    setState({ status: 'anonymous' });
  }, []);

  return <SessionContext.Provider value={{ ...state, login, logout }}>{children}</SessionContext.Provider>;
}

export function useAdminSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useAdminSession must be used within AdminSessionProvider');
  return ctx;
}
