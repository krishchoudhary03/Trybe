import { useCallback, useEffect, useRef, useState } from 'react';
import { isAiAvailable, type AiOutcome } from './aiService';

/**
 * Shows the rules-based `fallback` immediately and upgrades to an AI result when the AI
 * service is available. The AI is called once per `signature` (never on every render) and
 * results are additionally cached by aiService, so unchanged data never re-calls the model.
 */
export function useAiOutcome<T>(opts: {
  enabled: boolean;
  signature: string;
  fallback: T;
  fetcher: (fresh: boolean) => Promise<AiOutcome<T> | null>;
}) {
  const { enabled, signature, fallback, fetcher } = opts;
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [state, setState] = useState<{ sig: string; outcome: AiOutcome<T> | null }>({ sig: signature, outcome: null });
  const [loading, setLoading] = useState(false);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setState(prev => (prev.sig === signature ? prev : { sig: signature, outcome: null }));
    void isAiAvailable().then(available => {
      if (!available || cancelled) return;
      setLoading(true);
      fetcherRef.current(nonce > 0).then(o => {
        if (cancelled) return;
        setState({ sig: signature, outcome: o });
        setLoading(false);
      });
    });
    return () => {
      cancelled = true;
      setLoading(false);
    };
  }, [enabled, signature, nonce]);

  const current = state.sig === signature ? state.outcome : null;
  const outcome: AiOutcome<T> =
    current && current.source === 'ai'
      ? current
      : { data: fallbackRef.current, source: 'rules', status: current?.status ?? 'unavailable' };

  const retry = useCallback(() => setNonce(n => n + 1), []);
  return { outcome, loading, retry };
}
