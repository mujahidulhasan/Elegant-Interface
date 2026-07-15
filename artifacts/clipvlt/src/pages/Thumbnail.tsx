import { useState } from "react";
import { extractMetadata, Metadata } from "@/lib/api";
import { UrlInput } from "@/components/shared/UrlInput";
import { ErrorState } from "@/components/shared/StateViews";
import { useDownloadQueue } from "@/hooks/useDownloadQueue";
import { Button } from "@/components/ui/button";
import { Download, Image as ImageIcon, Loader2 } from "lucide-react";

export function ThumbnailDownloader() {
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

  const handleDownload = async () => {
    if (!metadata) return;
    await enqueue({
      url,
      kind: "thumbnail",
      label: `Thumbnail: ${metadata.title?.slice(0, 20)}...`
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Thumbnail Downloader</h1>
        <p className="text-muted-foreground">Extract high-resolution cover images from any link.</p>
      </div>

      <UrlInput 
        value={url} 
        onChange={setUrl} 
        onSubmit={handleExtract} 
        isLoading={status === "extracting"} 
      />

      {status === "extracting" && (
        <div className="w-full h-64 border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      )}
      
      {status === "error" && <ErrorState error={error} onRetry={handleExtract} />}

      {status === "success" && metadata && (
        <div className="space-y-6 animate-in fade-in zoom-in-95">
          {!metadata.thumbnail ? (
             <div className="p-12 bg-muted/50 rounded-xl border text-center space-y-4">
               <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground" />
               <h3 className="font-semibold">No Thumbnail Found</h3>
               <p className="text-sm text-muted-foreground">This media does not have a recognizable thumbnail image.</p>
             </div>
          ) : (
            <div className="rounded-xl border bg-card overflow-hidden shadow-sm p-2 space-y-4">
              <div className="w-full relative bg-black/5 rounded-lg overflow-hidden flex items-center justify-center min-h-[300px]">
                <img 
                  src={metadata.thumbnail} 
                  alt="Extracted Thumbnail" 
                  className="max-w-full max-h-[600px] object-contain shadow-md"
                />
              </div>
              <div className="flex items-center justify-between px-4 pb-2">
                <div className="text-sm font-medium truncate pr-4">{metadata.title}</div>
                <Button onClick={handleDownload} className="shrink-0">
                  <Download className="w-4 h-4 mr-2" /> Save HD Image
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
