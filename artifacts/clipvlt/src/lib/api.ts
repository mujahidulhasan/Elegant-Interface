// Typed client for the external video-download backend.
// Backend: https://ohyah-ytback.hf.space (FastAPI, yt-dlp based). Not part of this
// monorepo -- do not add routes for this in artifacts/api-server. This file mirrors
// that service's OpenAPI schema exactly; keep it in sync if the backend contract changes.

export const API_BASE_URL = "https://ohyah-ytback.hf.space";

export type JobStatus = "queued" | "running" | "merging" | "completed" | "failed";
export type DownloadKind = "video" | "audio" | "thumbnail" | "subtitle" | "playlist" | "best";
export type AudioFormat = "mp3" | "m4a" | "wav";

export interface Metadata {
  id: string;
  title: string;
  thumbnail: string | null;
  duration: number | null;
  uploader: string | null;
  upload_date: string | null;
  view_count: number | null;
  platform: string | null;
  webpage_url: string | null;
  is_playlist: boolean;
  playlist_count: number | null;
}

export interface FormatInfo {
  format_id: string;
  ext: string | null;
  resolution: string | null;
  fps: number | null;
  vcodec: string | null;
  acodec: string | null;
  filesize: number | null;
  filesize_approx: number | null;
  tbr: number | null;
  abr: number | null;
  vbr: number | null;
  has_video: boolean;
  has_audio: boolean;
  note: string | null;
}

export interface ExtractResponse {
  metadata: Metadata;
  formats: FormatInfo[];
  subtitles: string[];
}

export interface DownloadRequest {
  url: string;
  kind?: DownloadKind;
  format_id?: string | null;
  audio_format?: AudioFormat;
  subtitle_lang?: string | null;
}

export interface DownloadResponse {
  job_id: string;
  status: JobStatus;
}

export interface ProgressResponse {
  job_id: string;
  status: JobStatus;
  stage: string;
  percent: number;
  speed: string | null;
  eta: string | null;
  filename: string | null;
  error: string | null;
  download_url: string | null;
}

export interface HealthResponse {
  status: string;
  version: string;
  ffmpeg: boolean;
  active_jobs: number;
}

export interface PlatformsResponse {
  count: number;
  examples: string[];
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch (err) {
    throw new ApiError(
      err instanceof Error ? err.message : "Network error",
      0,
      null,
    );
  }

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const message =
      (body && typeof body === "object" && "detail" in body
        ? String((body as { detail: unknown }).detail)
        : null) ?? res.statusText;
    throw new ApiError(message, res.status, body);
  }

  return body as T;
}

export function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/api/health");
}

export function getPlatforms(): Promise<PlatformsResponse> {
  return request<PlatformsResponse>("/api/platforms");
}

export function extractMetadata(url: string): Promise<ExtractResponse> {
  return request<ExtractResponse>("/api/extract", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export function startDownload(payload: DownloadRequest): Promise<DownloadResponse> {
  return request<DownloadResponse>("/api/download", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getProgress(jobId: string): Promise<ProgressResponse> {
  return request<ProgressResponse>(`/api/progress/${encodeURIComponent(jobId)}`);
}

/** Direct URL to fetch/download the finished file for a job. Use as an href, not via fetch. */
export function getFileUrl(jobId: string): string {
  return `${API_BASE_URL}/api/file/${encodeURIComponent(jobId)}`;
}
