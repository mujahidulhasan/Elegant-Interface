import { useState, useEffect, useRef } from "react";
import {
  extractMetadata,
  type ExtractResponse,
  type FormatInfo,
} from "@/lib/api";
import { UrlInput } from "@/components/shared/UrlInput";
import { FormatSelector } from "@/components/shared/FormatSelector";
import { DownloadAction } from "@/components/shared/DownloadAction";
import { ErrorState, SkeletonCard } from "@/components/shared/StateViews";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHistory } from "@/hooks/useHistory";
import { detectPlatform, isAdultUrl } from "@/lib/platforms";
import { Link } from "wouter";
import {
  Eye, EyeOff, Calendar, User, PlayCircle,
  Image as ImageIcon, Music, Video, Clock, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

// ─── NSFW gate ────────────────────────────────────────────

const NSFW_KEY = "clipvlt.nsfwAccepted";

function NsfwGate({ onContinue, onLeave }: { onContinue: () => void; onLeave: () => void }) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-6 backdrop-blur-sm bg-background/60 rounded-[20px]">
      <div className="bg-card rounded-[18px] p-8 max-w-sm w-full text-center space-y-4 card-shadow border border-border">
        <div className="w-14 h-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <EyeOff className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-xl font-bold mb-1">18+ Content Warning</h3>
          <p className="text-sm text-muted-foreground">
            This link may contain adult content. You must be 18 or older to continue.
          </p>
        </div>
        <div className="flex flex-col gap-2 pt-2">
          <Button
            className="w-full h-12 rounded-[16px] font-semibold"
            onClick={() => {
              localStorage.setItem(NSFW_KEY, "true");
              onContinue();
            }}
          >
            <Eye className="w-4 h-4 mr-2" /> I'm 18+ — Continue
          </Button>
          <Button
            variant="ghost"
            className="w-full h-10 rounded-[16px] text-muted-foreground"
            onClick={onLeave}
          >
            Leave
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Formatting helpers ───────────────────────────────────

function fmtViews(n: number | null | undefined): string {
  if (!n) return "";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K views`;
  return `${n} views`;
}

/** Safely format a duration in seconds to HH:MM:SS or MM:SS. Handles floats. */
function fmtDuration(secs: number | null | undefined): string {
  if (secs == null || secs <= 0) return "";
  const total = Math.floor(secs); // floor floats like 44.327 → 44
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Format a YYYYMMDD upload date string to human-readable "Jan 1, 2024". */
function fmtUploadDate(date: string | null | undefined): string {
  if (!date) return "";
  if (/^\d{8}$/.test(date)) {
    const y = parseInt(date.slice(0, 4), 10);
    const m = parseInt(date.slice(4, 6), 10) - 1;
    const d = parseInt(date.slice(6, 8), 10);
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(y, m, d));
    } catch {
      return date;
    }
  }
  return date;
}

// ─── Main Downloader page ─────────────────────────────────

export function Downloader() {
  // Parse ?url= from query string without causing a re-render on every navigation
  const getUrlParam = () => {
    try {
      return new URLSearchParams(window.location.search).get("url") ?? "";
    } catch {
      return "";
    }
  };

  const [inputUrl, setInputUrl] = useState(getUrlParam);
  const [status, setStatus] = useState<"idle" | "extracting" | "success" | "error">("idle");
  const [data, setData] = useState<ExtractResponse | null>(null);
  const [error, setError] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"video" | "audio" | "thumbnail">("video");
  const [selectedFormat, setSelectedFormat] = useState<FormatInfo | null>(null);
  const [nsfwGated, setNsfwGated] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  const { entries, addEntry } = useHistory();
  const extractedUrl = useRef<string>("");

  const handleExtract = async (urlToExtract?: string) => {
    const url = urlToExtract ?? inputUrl;
    if (!url.trim()) return;
    setStatus("extracting");
    setError(null);
    setData(null);
    setSelectedFormat(null);
    setActiveTab("video");
    setThumbnailError(false);
    extractedUrl.current = url;

    try {
      const res = await extractMetadata(url);
      setData(res);
      setStatus("success");

      // Adult content gate
      const accepted = localStorage.getItem(NSFW_KEY) === "true";
      setNsfwGated(isAdultUrl(url) && !accepted);

      // Auto-select best video format
      const videoFormats = res.formats.filter((f) => f.has_video);
      if (videoFormats.length > 0) {
        const best = videoFormats.reduce((a, b) =>
          (b.filesize ?? b.filesize_approx ?? 0) > (a.filesize ?? a.filesize_approx ?? 0) ? b : a
        );
        setSelectedFormat(best);
      }
    } catch (err) {
      setError(err);
      setStatus("error");
    }
  };

  // Auto-extract when ?url= is present on mount
  useEffect(() => {
    const param = getUrlParam();
    if (param && status === "idle") {
      setInputUrl(param);
      handleExtract(param);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as "video" | "audio" | "thumbnail");
    setSelectedFormat(null);
    if (data) {
      if (tab === "video") {
        const vf = data.formats.filter((f) => f.has_video);
        if (vf.length) setSelectedFormat(vf[0]);
      } else if (tab === "audio") {
        const af = data.formats.filter((f) => f.has_audio && !f.has_video);
        if (af.length) setSelectedFormat(af[0]);
      }
    }
  };

  const handleDownloadComplete = () => {
    if (!data || !extractedUrl.current) return;
    const platform = detectPlatform(extractedUrl.current);
    addEntry({
      id: crypto.randomUUID(),
      jobId: crypto.randomUUID(),
      url: extractedUrl.current,
      platformId: platform?.id ?? "generic",
      metadata: {
        title:     data.metadata.title     ?? null,
        thumbnail: data.metadata.thumbnail ?? null,
        uploader:  data.metadata.uploader  ?? null,
        duration:  data.metadata.duration  ?? null,
      },
      kind:        activeTab === "thumbnail" ? "thumbnail" : activeTab,
      resolution:  selectedFormat?.resolution ?? null,
      downloadUrl: null,
      createdAt:   Date.now(),
    });
  };

  const getDownloadSpec = () => {
    const url = extractedUrl.current;
    if (activeTab === "thumbnail") {
      return {
        url,
        kind: "thumbnail" as const,
        formatId: null,
        label: `Thumbnail — ${data?.metadata.title?.slice(0, 30) ?? url}`,
      };
    }
    if (activeTab === "audio") {
      return {
        url,
        kind: "audio" as const,
        formatId: selectedFormat?.format_id ?? null,
        label: selectedFormat
          ? `Audio ${selectedFormat.resolution ?? selectedFormat.ext ?? ""} — ${data?.metadata.title?.slice(0, 30) ?? url}`
          : `Best Audio — ${data?.metadata.title?.slice(0, 30) ?? url}`,
      };
    }
    return {
      url,
      kind: "video" as const,
      formatId: selectedFormat?.format_id ?? null,
      label: selectedFormat
        ? `${selectedFormat.resolution ?? "Video"} ${selectedFormat.ext?.toUpperCase() ?? ""} — ${data?.metadata.title?.slice(0, 30) ?? url}`
        : `Best Video — ${data?.metadata.title?.slice(0, 30) ?? url}`,
    };
  };

  const platform = extractedUrl.current ? detectPlatform(extractedUrl.current) : null;
  const meta = data?.metadata;
  const recentEntries = entries.slice(0, 3);

  const videoFormats = data ? data.formats.filter((f) => f.has_video) : [];
  const audioFormats = data ? data.formats.filter((f) => f.has_audio && !f.has_video) : [];
  const hasThumbnail = !!meta?.thumbnail;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* URL Input */}
      <UrlInput
        value={inputUrl}
        onChange={setInputUrl}
        onSubmit={() => handleExtract()}
        isLoading={status === "extracting"}
        statusText="Analyzing…"
      />

      {/* Loading skeleton */}
      {status === "extracting" && <SkeletonCard />}

      {/* Error state */}
      {status === "error" && (
        <ErrorState error={error} onRetry={() => handleExtract()} />
      )}

      {/* Results */}
      {status === "success" && data && (
        <div className="relative space-y-5">
          {/* NSFW gate overlay */}
          {nsfwGated && (
            <NsfwGate
              onContinue={() => setNsfwGated(false)}
              onLeave={() => {
                setInputUrl("");
                setStatus("idle");
                setData(null);
              }}
            />
          )}

          {/* Blurred wrapper when NSFW gated */}
          <div className={cn("space-y-5", nsfwGated && "nsfw-blurred")}>

            {/* ── 1. Thumbnail ─────────────────────────────────── */}
            {hasThumbnail && !thumbnailError && (
              <div className="relative w-full rounded-[18px] overflow-hidden bg-black/10 aspect-video max-h-[340px]">
                <div
                  className="absolute inset-0 bg-cover bg-center scale-105 blur-xl opacity-30"
                  style={{ backgroundImage: `url(${meta!.thumbnail})` }}
                />
                <img
                  src={meta!.thumbnail!}
                  alt={meta!.title ?? "Thumbnail"}
                  className="relative w-full h-full object-contain"
                  loading="lazy"
                  onError={() => setThumbnailError(true)}
                />
                {meta!.duration != null && meta!.duration > 0 && (
                  <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs font-mono px-2 py-0.5 rounded-[6px] backdrop-blur-sm">
                    {fmtDuration(meta!.duration)}
                  </div>
                )}
              </div>
            )}

            {/* ── 2. Metadata ──────────────────────────────────── */}
            <div className="bg-card rounded-[18px] p-5 card-shadow space-y-3">
              {platform && platform.id !== "generic" && (
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary">
                  <i className={platform.icon} style={{ color: platform.accent }} />
                  {platform.label}
                </div>
              )}

              <h1 className="font-bold text-lg leading-snug text-balance" title={meta!.title ?? undefined}>
                {meta!.title || extractedUrl.current}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                {meta!.uploader && (
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> {meta!.uploader}
                  </span>
                )}
                {meta!.view_count != null && (
                  <span className="flex items-center gap-1.5">
                    <PlayCircle className="w-3.5 h-3.5" /> {fmtViews(meta!.view_count)}
                  </span>
                )}
                {meta!.upload_date && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {fmtUploadDate(meta!.upload_date)}
                  </span>
                )}
                {meta!.webpage_url && (
                  <a
                    href={meta!.webpage_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Original
                  </a>
                )}
              </div>
            </div>

            {/* ── 3. Mode tabs ─────────────────────────────────── */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
              <TabsList className="w-full rounded-[16px] h-11 bg-secondary p-1">
                <TabsTrigger
                  value="video"
                  className="flex-1 rounded-[12px] text-sm gap-1.5 data-[state=active]:shadow-sm"
                  disabled={videoFormats.length === 0}
                >
                  <Video className="w-4 h-4" /> Video
                  {videoFormats.length > 0 && (
                    <span className="ml-0.5 text-[10px] text-muted-foreground">({videoFormats.length})</span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="audio"
                  className="flex-1 rounded-[12px] text-sm gap-1.5 data-[state=active]:shadow-sm"
                  disabled={audioFormats.length === 0}
                >
                  <Music className="w-4 h-4" /> Audio
                  {audioFormats.length > 0 && (
                    <span className="ml-0.5 text-[10px] text-muted-foreground">({audioFormats.length})</span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="thumbnail"
                  className="flex-1 rounded-[12px] text-sm gap-1.5 data-[state=active]:shadow-sm"
                  disabled={!hasThumbnail}
                >
                  <ImageIcon className="w-4 h-4" /> Thumbnail
                </TabsTrigger>
              </TabsList>

              {/* ── 4. Formats + Download ──────────────────────── */}
              <TabsContent value="video" className="space-y-4 mt-0">
                {videoFormats.length > 0 ? (
                  <FormatSelector
                    formats={data.formats}
                    mode="video"
                    selectedFormat={selectedFormat}
                    onSelectFormat={setSelectedFormat}
                  />
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-6">
                    No video formats available for this link.
                  </p>
                )}
                <DownloadAction
                  {...getDownloadSpec()}
                  disabled={videoFormats.length === 0}
                  onComplete={handleDownloadComplete}
                />
              </TabsContent>

              <TabsContent value="audio" className="space-y-4 mt-0">
                {audioFormats.length > 0 ? (
                  <FormatSelector
                    formats={data.formats}
                    mode="audio"
                    selectedFormat={selectedFormat}
                    onSelectFormat={setSelectedFormat}
                  />
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-6">
                    No audio-only formats available. Use the Video tab to download with audio included.
                  </p>
                )}
                <DownloadAction
                  {...getDownloadSpec()}
                  disabled={audioFormats.length === 0}
                  onComplete={handleDownloadComplete}
                />
              </TabsContent>

              <TabsContent value="thumbnail" className="space-y-4 mt-0">
                {hasThumbnail ? (
                  <div className="bg-secondary/50 rounded-[14px] overflow-hidden">
                    <img
                      src={meta!.thumbnail!}
                      alt="Thumbnail"
                      className="w-full object-cover max-h-[400px]"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="py-10 text-center space-y-2">
                    <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No thumbnail available for this link.</p>
                  </div>
                )}
                <DownloadAction
                  {...getDownloadSpec()}
                  disabled={!hasThumbnail}
                  onComplete={handleDownloadComplete}
                />
              </TabsContent>
            </Tabs>

          </div>
        </div>
      )}

      {/* ── 5. Recent activity ──────────────────────────────── */}
      {recentEntries.length > 0 && status !== "extracting" && (
        <section className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" /> Recent Downloads
            </h2>
            <Link href="/history" className="text-xs text-info hover:underline font-semibold">
              View all
            </Link>
          </div>
          <div className="bg-card rounded-[18px] p-2 card-shadow flex flex-col gap-1.5">
            {recentEntries.map((entry) => {
              const p = detectPlatform(entry.url);
              return (
                <Link key={entry.id} href={`/download?url=${encodeURIComponent(entry.url)}`}>
                  <div className="rounded-[12px] bg-secondary/50 p-3 flex items-center gap-3 hover:bg-secondary transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-[10px] bg-muted overflow-hidden shrink-0">
                      {entry.metadata.thumbnail ? (
                        <img src={entry.metadata.thumbnail} alt="" className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className={p?.icon} style={{ color: p?.accent }} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{entry.metadata.title || entry.url}</p>
                      <p className="text-xs text-muted-foreground">
                        {p?.label} · {formatDistanceToNow(entry.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
