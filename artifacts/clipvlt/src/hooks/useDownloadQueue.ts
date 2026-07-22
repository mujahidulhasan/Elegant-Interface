import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  getProgress,
  startDownload,
  type DownloadKind,
  type AudioFormat,
  type JobStatus,
} from "@/lib/api";

export interface QueueJob {
  jobId: string;
  url: string;
  kind: DownloadKind;
  formatId: string | null;
  label: string;
  status: JobStatus | "error";
  stage: string;
  percent: number;
  speed: string | null;
  eta: string | null;
  filename: string | null;
  downloadUrl: string | null;
  error: string | null;
}

const POLL_INTERVAL_MS = 1500;
const API_BASE = "https://ohyah-ytback.hf.space";

export function useDownloadQueue() {
  const [jobs, setJobs] = useState<QueueJob[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  useEffect(() => {
    return () => {
      timers.current.forEach((t) => clearInterval(t));
      timers.current.clear();
    };
  }, []);

  const updateJob = useCallback((jobId: string, patch: Partial<QueueJob>) => {
    setJobs((prev) => prev.map((j) => (j.jobId === jobId ? { ...j, ...patch } : j)));
  }, []);

  const pollJob = useCallback(
    (jobId: string) => {
      const timer = setInterval(async () => {
        try {
          const progress = await getProgress(jobId);
          updateJob(jobId, {
            status: progress.status,
            stage: progress.stage,
            percent: progress.percent,
            speed: progress.speed,
            eta: progress.eta,
            filename: progress.filename,
            downloadUrl: progress.download_url?.startsWith('/')
              ? `${API_BASE}${progress.download_url}`
              : progress.download_url,
            error: progress.error,
          });
          if (progress.status === "completed" || progress.status === "failed") {
            clearInterval(timer);
            timers.current.delete(jobId);
          }
        } catch (err) {
          updateJob(jobId, {
            status: "error",
            error: err instanceof ApiError ? err.message : "Network error",
          });
          clearInterval(timer);
          timers.current.delete(jobId);
        }
      }, POLL_INTERVAL_MS);
      timers.current.set(jobId, timer);
    },
    [updateJob],
  );

  const enqueue = useCallback(
    async (params: {
      url: string;
      kind: DownloadKind;
      formatId?: string | null;
      audioFormat?: AudioFormat;
      subtitleLang?: string | null;
      label: string;
    }) => {
      const placeholderId = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setJobs((prev) => [
        {
          jobId: placeholderId,
          url: params.url,
          kind: params.kind,
          formatId: params.formatId ?? null,
          label: params.label,
          status: "queued",
          stage: "Starting",
          percent: 0,
          speed: null,
          eta: null,
          filename: null,
          downloadUrl: null,
          error: null,
        },
        ...prev,
      ]);

      try {
        const res = await startDownload({
          url: params.url,
          kind: params.kind,
          format_id: params.formatId ?? null,
          audio_format: params.audioFormat,
          subtitle_lang: params.subtitleLang ?? null,
        });
        setJobs((prev) =>
          prev.map((j) => (j.jobId === placeholderId ? { ...j, jobId: res.job_id, status: res.status } : j)),
        );
        pollJob(res.job_id);
        return res.job_id;
      } catch (err) {
        updateJob(placeholderId, {
          status: "error",
          error: err instanceof ApiError ? err.message : "Network error",
        });
        return null;
      }
    },
    [pollJob, updateJob],
  );

  const cancelJob = useCallback((jobId: string) => {
    const timer = timers.current.get(jobId);
    if (timer) {
      clearInterval(timer);
      timers.current.delete(jobId);
    }
    setJobs((prev) => prev.filter((j) => j.jobId !== jobId));
  }, []);

  const retryJob = useCallback(
    (jobId: string) => {
      const job = jobs.find((j) => j.jobId === jobId);
      if (!job) return;
      cancelJob(jobId);
      void enqueue({ url: job.url, kind: job.kind, formatId: job.formatId, label: job.label });
    },
    [jobs, cancelJob, enqueue],
  );

  return { jobs, enqueue, cancelJob, retryJob };
}
