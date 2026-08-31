import { useEffect, useState, type DependencyList } from 'react';

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: T };

export function useAsync<T>(fn: () => Promise<T>, deps: DependencyList): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    fn()
      .then((data) => { if (!cancelled) setState({ status: 'ready', data }); })
      .catch((err: Error) => { if (!cancelled) setState({ status: 'error', message: err.message }); });
    return () => { cancelled = true; };
    // deps controlled by caller
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
