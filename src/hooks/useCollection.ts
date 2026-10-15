"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseCollectionOptions {
  sort?: string;
  perPage?: number;
  intervalMs?: number;
}

export interface UseCollectionResult<T> {
  records: T[];
  loading: boolean;
  error: string | null;
  connected: boolean;
  lastEvent: number;
  reload: () => Promise<void>;
}

const DEFAULT_INTERVAL_MS = 8000;

/**
 * Loads a collection from our API and keeps it refreshed automatically
 * (polling + on tab focus + after any write from any device).
 * Replaces the old PocketBase realtime subscription.
 */
export function useCollection<T extends { id: string }>(
  name: string,
  options: UseCollectionOptions = {},
): UseCollectionResult<T> {
  const { sort = "-created", perPage = 500, intervalMs = DEFAULT_INTERVAL_MS } =
    options;

  const [records, setRecords] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(0);
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/${name}`, { cache: "no-store" });
      const data: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          typeof data === "object" && data !== null && "error" in data
            ? String((data as { error: unknown }).error)
            : "Error al cargar datos";
        throw new Error(message);
      }
      const list = Array.isArray(data) ? (data as T[]) : [];
      const descending = sort.startsWith("-");
      const key = (descending ? sort.slice(1) : sort) || "created";
      const sorted = [...list].sort((a, b) => {
        const av = String((a as Record<string, unknown>)[key] ?? "");
        const bv = String((b as Record<string, unknown>)[key] ?? "");
        return descending ? bv.localeCompare(av) : av.localeCompare(bv);
      });
      if (!mountedRef.current) return;
      setRecords(sorted.slice(0, perPage));
      setError(null);
      setConnected(true);
      setLastEvent(Date.now());
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "Error al cargar datos");
      setConnected(false);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [name, sort, perPage]);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    void load();

    const run = () => {
      if (document.visibilityState === "visible") void load();
    };

    const interval = setInterval(run, intervalMs);
    window.addEventListener("focus", run);
    window.addEventListener("donacion:data-changed", run);
    document.addEventListener("visibilitychange", run);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
      window.removeEventListener("focus", run);
      window.removeEventListener("donacion:data-changed", run);
      document.removeEventListener("visibilitychange", run);
    };
  }, [load, intervalMs]);

  return { records, loading, error, connected, lastEvent, reload: load };
}
