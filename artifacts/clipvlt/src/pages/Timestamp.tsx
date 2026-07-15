import { useState } from "react";
import { extractMetadata, Metadata } from "@/lib/api";
import { UrlInput } from "@/components/shared/UrlInput";
import { ErrorState, SkeletonCard } from "@/components/shared/StateViews";
import { useDownloadQueue } from "@/hooks/useDownloadQueue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scissors, AlertTriangle, Download } from "lucide-react";
import { Label } from "@/components/ui/label";

export function TimestampDownloader() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "extracting" | "success" | "error">("idle");
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [error, setError] = useState<any>(null);
  
  const [start, setStart] = useState("00:00");
  const [end, setEnd] = useState("");

  const { enqueue } = useDownloadQueue();

  const handleExtract = async () => {
    setStatus("extracting");
    setError(null);
    setMetadata(null);
    try {
      const res = await extractMetadata(url);
      setMetadata(res.metadata);
      
      if (res.metadata.duration) {
        const m = Math.floor(res.metadata.duration / 60);
        const s = res.metadata.duration % 60;
        setEnd(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
      
      setStatus("success");
    } catch (err) {
      setError(err);
      setStatus("error");
    }
  };

  const handleDownload = async () => {
    if (!metadata) return;
    // Backend doesn't support trimming. We explicitly call this out.
    await enqueue({
      url,
      kind: "video",
      label: `Full Video: ${metadata.title?.slice(0, 20)}...`
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Timestamp Clipper</h1>
        <p className="text-muted-foreground">Extract specific segments of a video.</p>
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
          <div className="rounded-xl border bg-card p-6 space-y-6 shadow-sm">
            
            <div className="flex items-center gap-4 border-b pb-6">
               <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden shrink-0">
                  {metadata.thumbnail ? <img src={metadata.thumbnail} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-black" />}
               </div>
               <div>
                 <h3 className="font-semibold line-clamp-1">{metadata.title}</h3>
                 <p className="text-sm text-muted-foreground">{metadata.duration ? `${Math.floor(metadata.duration/60)}m ${metadata.duration%60}s` : "Unknown length"}</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input value={start} onChange={e => setStart(e.target.value)} placeholder="00:00" className="font-mono text-lg" />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input value={end} onChange={e => setEnd(e.target.value)} placeholder="01:30" className="font-mono text-lg" />
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-500 p-4 rounded-lg flex items-start gap-3 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-1">Server-side trimming unavailable</strong>
                <p>The backend extraction service does not currently support cutting clips. Clicking download will fetch the <b>entire full-length video</b>. You can trim it locally on your device.</p>
              </div>
            </div>

            <Button onClick={handleDownload} className="w-full py-6 text-lg gap-2">
              <Download className="w-5 h-5" /> Download Full Video Instead
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
