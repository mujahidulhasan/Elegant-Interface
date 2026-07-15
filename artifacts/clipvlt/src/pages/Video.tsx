import { useState, useEffect } from "react";
import { extractMetadata, Metadata, FormatInfo } from "@/lib/api";
import { UrlInput } from "@/components/shared/UrlInput";
import { FormatSelector } from "@/components/shared/FormatSelector";
import { SkeletonCard, ErrorState } from "@/components/shared/StateViews";
import { useDownloadQueue } from "@/hooks/useDownloadQueue";
import { useHistory } from "@/hooks/useHistory";
import { detectPlatform } from "@/lib/platforms";

export function VideoDownloader() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "extracting" | "success" | "error">("idle");
  const [statusText, setStatusText] = useState("");
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [formats, setFormats] = useState<FormatInfo[]>([]);
  const [error, setError] = useState<any>(null);

  const { enqueue } = useDownloadQueue();
  const { addEntry } = useHistory();

  // Read ?url= from query string on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialUrl = params.get("url");
    if (initialUrl) {
      setUrl(initialUrl);
      // Auto-extract
      handleExtract(initialUrl);
    }
  }, []);

  const handleExtract = async (targetUrl = url) => {
    if (!targetUrl.trim()) return;
    setStatus("extracting");
    setStatusText("Detecting platform...");
    setError(null);
    setMetadata(null);
    setFormats([]);

    // Update URL to remove query param if it was there, or add it? We don't have to strictly.
    window.history.replaceState({}, '', `/video?url=${encodeURIComponent(targetUrl)}`);

    try {
      setTimeout(() => setStatusText("Fetching metadata..."), 500);
      const res = await extractMetadata(targetUrl);
      
      setMetadata(res.metadata);
      setFormats(res.formats);
      setStatus("success");
    } catch (err) {
      setError(err);
      setStatus("error");
    }
  };

  const handleSelectFormat = async (formatId: string | null, kind: "video" | "audio" | "thumbnail" | "subtitle", audioFormat?: "mp3" | "m4a" | "wav") => {
    if (!metadata) return;
    
    let label = kind.charAt(0).toUpperCase() + kind.slice(1);
    let resolution = null;
    
    if (formatId) {
      const f = formats.find(x => x.format_id === formatId);
      if (f) {
        if (f.resolution) resolution = f.resolution;
        label = f.resolution || (f.abr ? `${f.abr}k` : label);
      }
    }
    
    const jobId = await enqueue({
      url,
      kind,
      formatId,
      audioFormat,
      label: `${metadata.title?.slice(0, 20) || 'Media'} • ${label}`
    });

    if (jobId) {
      addEntry({
        id: crypto.randomUUID(),
        jobId,
        url,
        platformId: detectPlatform(url)?.id || "generic",
        metadata: {
          title: metadata.title || "Unknown Title",
          thumbnail: metadata.thumbnail,
          uploader: metadata.uploader,
          duration: metadata.duration
        },
        kind,
        resolution,
        downloadUrl: null,
        createdAt: Date.now()
      });
    }
  };

  const formatDuration = (secs: number | null) => {
    if (!secs) return null;
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Video Downloader</h1>
        <p className="text-muted-foreground">Download videos in up to 4K resolution.</p>
      </div>

      <UrlInput 
        value={url} 
        onChange={setUrl} 
        onSubmit={() => handleExtract(url)} 
        isLoading={status === "extracting"} 
        statusText={statusText}
      />

      {status === "extracting" && <SkeletonCard />}
      {status === "error" && <ErrorState error={error} onRetry={() => handleExtract(url)} />}

      {status === "success" && metadata && (
        <div className="space-y-6 animate-in fade-in zoom-in-95">
          <div className="rounded-xl border bg-card overflow-hidden shadow-sm flex flex-col sm:flex-row">
            <div className="w-full sm:w-48 h-48 sm:h-auto shrink-0 relative bg-black/90">
              {metadata.thumbnail ? (
                <>
                  <div 
                    className="absolute inset-0 bg-cover bg-center blur-xl opacity-50"
                    style={{ backgroundImage: `url(${metadata.thumbnail})` }}
                  />
                  <img 
                    src={metadata.thumbnail} 
                    alt={metadata.title} 
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted">
                  <i className="fa-solid fa-video text-4xl" />
                </div>
              )}
              {metadata.duration && (
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded backdrop-blur-sm">
                  {formatDuration(metadata.duration)}
                </div>
              )}
            </div>
            
            <div className="p-4 flex-1 flex flex-col min-w-0">
              <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground font-medium">
                {detectPlatform(url) && (
                  <span className="flex items-center gap-1" style={{ color: detectPlatform(url)?.accent }}>
                    <i className={detectPlatform(url)?.icon} /> {detectPlatform(url)?.label}
                  </span>
                )}
                {metadata.uploader && <span>• {metadata.uploader}</span>}
              </div>
              <h3 className="font-semibold text-lg leading-tight line-clamp-2 mb-3" title={metadata.title}>
                {metadata.title}
              </h3>
              
              <div className="mt-auto grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                {metadata.view_count != null && (
                  <div className="flex items-center gap-1">
                    <i className="fa-solid fa-eye w-3" /> {(metadata.view_count).toLocaleString()} views
                  </div>
                )}
                {metadata.upload_date && (
                  <div className="flex items-center gap-1">
                    <i className="fa-regular fa-calendar w-3" /> 
                    {metadata.upload_date.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")}
                  </div>
                )}
                {metadata.is_playlist && (
                  <div className="col-span-2 text-primary bg-primary/10 px-2 py-1 rounded inline-block w-fit mt-1">
                    <i className="fa-solid fa-list mr-1" /> Part of a playlist ({metadata.playlist_count} items)
                  </div>
                )}
              </div>
            </div>
          </div>

          <FormatSelector formats={formats} onSelect={handleSelectFormat} isLoading={false} />
        </div>
      )}
    </div>
  );
}
