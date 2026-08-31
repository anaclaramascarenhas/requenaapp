import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, setToken } from '../api/client';
import type { Account } from '../api/types';

type SessionState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; account: Account };

const SessionContext = createContext<SessionState>({ status: 'loading' });

// The design's core pricing assumption ("Preço só logado") means every
// screen needs an authenticated buyer. There's no login screen in the
// approved design, so we sign in as the demo buyer on boot.
export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    api.login().then(({ token, account }) => {
      if (cancelled) return;
      setToken(token);
      setState({ status: 'ready', account });
    }).catch((err: Error) => {
      if (cancelled) return;
      setState({ status: 'error', message: err.message });
    });
    return () => { cancelled = true; };
  }, []);

  return <SessionContext.Provider value={state}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}
