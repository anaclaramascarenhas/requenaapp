import { useCallback, useEffect, useState, type DependencyList } from 'react';

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: T };

export function useAsync<T>(fn: () => Promise<T>, deps: DependencyList) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });

  const refresh = useCallback(() => {
    setState({ status: 'loading' });
    fn()
      .then((data) => setState({ status: 'ready', data }))
      .catch((err: Error) => setState({ status: 'error', message: err.message }));
    // deps controlled by caller
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { refresh(); }, [refresh]);

  return [state, refresh] as const;
}
