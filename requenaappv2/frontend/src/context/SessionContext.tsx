import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, setToken } from '../api/client';
import type { Account } from '../api/types';

type SessionState =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'ready'; account: Account };

type SessionContextValue = SessionState & {
  login: (cnpj: string, password: string) => Promise<void>;
  logout: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

// Accounts are created by REQUENA staff (via the admin panel), not by public
// self-signup — so this only ever restores an existing session or shows the
// login form; there is no "create account" path here.
export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    api.getMe()
      .then((account) => { if (!cancelled) setState({ status: 'ready', account }); })
      .catch(() => { if (!cancelled) { setToken(null); setState({ status: 'anonymous' }); } });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (cnpj: string, password: string) => {
    const { token, account } = await api.login(cnpj, password);
    setToken(token);
    setState({ status: 'ready', account });
  }, []);

  const logout = useCallback(() => {
    api.logout().catch(() => {});
    setToken(null);
    setState({ status: 'anonymous' });
  }, []);

  return <SessionContext.Provider value={{ ...state, login, logout }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
