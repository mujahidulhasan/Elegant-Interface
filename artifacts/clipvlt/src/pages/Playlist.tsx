import { useState } from "react";
import { extractMetadata, Metadata } from "@/lib/api";
import { UrlInput } from "@/components/shared/UrlInput";
import { ErrorState, SkeletonCard } from "@/components/shared/StateViews";
import { useDownloadQueue } from "@/hooks/useDownloadQueue";
import { Button } from "@/components/ui/button";
import { ListMusic, Download } from "lucide-react";

export function PlaylistDownloader() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "extracting" | "success" | "error">("idle");
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [error, setError] = useState<any>(null);

  const { enqueue } = useDownloadQueue();

  const handleExtract = async () => {
    setStatus("extracting");
    setError(null);
    setMetadata(null);
    try {
      const res = await extractMetadata(url);
      setMetadata(res.metadata);
      setStatus("success");
    } catch (err) {
      setError(err);
      setStatus("error");
    }
  };

  const handleDownload = async (audioFormat?: "mp3") => {
    if (!metadata) return;
    
    await enqueue({
      url,
      kind: "playlist",
      audioFormat,
      label: `Playlist: ${metadata.title?.slice(0, 20)}...`
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Playlist Downloader</h1>
        <p className="text-muted-foreground">Download entire playlists or albums at once.</p>
      </div>

      <UrlInput 
        value={url} 
        onChange={setUrl} 
        onSubmit={handleExtract} 
        isLoading={status === "extracting"} 
      />

      {status === "extracting" && <SkeletonCard />}
      {status === "error" && <ErrorState error={error} onRetry={handleExtract} />}

      {status === "success" && metadata && (
        <div className="space-y-6 animate-in fade-in zoom-in-95">
          {!metadata.is_playlist ? (
            <div className="p-6 bg-accent/10 text-accent rounded-xl border border-accent/20 text-center space-y-4">
              <ListMusic className="w-12 h-12 mx-auto" />
              <h3 className="font-semibold text-lg">Not a Playlist</h3>
              <p className="text-sm opacity-80">This URL looks like a single item. Use the Video downloader instead.</p>
              <Button onClick={() => window.location.href = `/video?url=${encodeURIComponent(url)}`} variant="outline" className="border-accent text-accent hover:bg-accent hover:text-white">
                Go to Video Downloader
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border bg-card overflow-hidden shadow-sm flex flex-col sm:flex-row items-center p-6 gap-6">
              <div className="w-32 h-32 rounded-lg bg-muted relative shrink-0 overflow-hidden shadow-inner flex items-center justify-center">
                {metadata.thumbnail ? (
                  <img src={metadata.thumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ListMusic className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-semibold mb-1">
                  <ListMusic className="w-3 h-3" /> {metadata.playlist_count} items
                </div>
                <h3 className="font-bold text-xl">{metadata.title}</h3>
                <p className="text-muted-foreground text-sm">{metadata.uploader}</p>
                
                <div className="flex flex-wrap items-center gap-3 pt-4 justify-center sm:justify-start">
                  <Button onClick={() => handleDownload()} className="gap-2">
                    <Download className="w-4 h-4" /> Download Playlist (Best Video)
                  </Button>
                  <Button onClick={() => handleDownload("mp3")} variant="secondary" className="gap-2">
                    <Download className="w-4 h-4" /> Download as MP3
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
