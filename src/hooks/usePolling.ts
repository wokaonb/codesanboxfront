import { useEffect, useRef, useState } from "react";

export function usePolling<T>(
  fetcher: () => Promise<T>,
  isDone: (data: T) => boolean,
  intervalMs = 1000,
  timeoutMs?: number
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  const isDoneRef = useRef(isDone);

  useEffect(() => {
    fetcherRef.current = fetcher;
    isDoneRef.current = isDone;
  }, [fetcher, isDone]);

  useEffect(() => {
    let stopped = false;
    let timer: number | undefined;
    const startedAt = Date.now();

    const tick = async () => {
      try {
        const result = await fetcherRef.current();
        if (stopped) return;
        setData(result);
        setError(null);
        if (isDoneRef.current(result)) {
          setLoading(false);
        } else if (timeoutMs !== undefined && Date.now() - startedAt > timeoutMs) {
          setError("判题等待超时，请确认判题服务已启动");
          setLoading(false);
        } else {
          timer = window.setTimeout(tick, intervalMs);
        }
      } catch (err) {
        if (stopped) return;
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      }
    };

    void tick();
    return () => {
      stopped = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [intervalMs, timeoutMs]);

  return { data, loading, error };
}
