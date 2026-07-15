import { useCallback, useEffect, useState } from "react";
import type { Metadata } from "@/lib/api";

// The backend has no history/database endpoints -- history is a client-side
// convenience persisted to localStorage, keyed per browser.

export interface HistoryEntry {
  id: string; // unique per download action (not the same as job_id, since a video
  // can be re-downloaded in different qualities)
  jobId: string;
  url: string;
  platformId: string;
  metadata: Pick<Metadata, "title" | "thumbnail" | "uploader" | "duration">;
  kind: string;
  resolution: string | null;
  downloadUrl: string | null;
  createdAt: number;
}

const STORAGE_KEY = "clipvlt.history";
const MAX_ENTRIES = 100;

function readAll(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries: HistoryEntry[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => readAll());

  useEffect(() => {
    const listener = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setEntries(readAll());
    };
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, []);

  const addEntry = useCallback((entry: HistoryEntry) => {
    setEntries((prev) => {
      const next = [entry, ...prev];
      writeAll(next);
      return next;
    });
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      writeAll(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setEntries([]);
    writeAll([]);
  }, []);

  return { entries, addEntry, removeEntry, clearHistory };
}
