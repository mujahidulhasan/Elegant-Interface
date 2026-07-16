import { useState } from "react";
import { detectPlatform, isLikelyUrl } from "@/lib/platforms";
import { useDownloadQueue } from "@/hooks/useDownloadQueue";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Layers, X, Download, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface BulkUrl {
  url: string;
  valid: boolean;
}

export function BulkDownloader() {
  const [raw, setRaw] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const { enqueue } = useDownloadQueue();
  const { toast } = useToast();

  const lines: BulkUrl[] = raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((url) => ({ url, valid: isLikelyUrl(url) }));

  const validLines = lines.filter((l) => l.valid);
  const invalidCount = lines.filter((l) => !l.valid).length;

  const handleDownloadAll = async () => {
    if (validLines.length === 0) return;
    setIsDownloading(true);

    let completed = 0;
    let failed = 0;

    for (const { url } of validLines) {
      try {
        const platform = detectPlatform(url);
        const jobId = await enqueue({
          url,
          kind: "video",
          label: `${platform?.label ?? "Video"}: ${url.slice(0, 40)}`,
        });
        if (jobId) {
          completed++;
        } else {
          failed++;
        }
        // Small delay between submissions to avoid overwhelming the server
        await new Promise((r) => setTimeout(r, 400));
      } catch {
        failed++;
      }
    }

    setIsDownloading(false);
    toast({
      title: `Bulk download submitted`,
      description: `${completed} downloads started${failed > 0 ? `, ${failed} failed` : ""}.`,
    });
  };

  const removeUrl = (urlToRemove: string) => {
    const updatedLines = raw
      .split("\n")
      .filter((line) => line.trim() !== urlToRemove);
    setRaw(updatedLines.join("\n"));
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-primary/10 text-primary flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          Bulk Downloader
        </h1>
        <p className="text-muted-foreground">
          Paste multiple URLs — one per line. Each will be downloaded at best quality.
        </p>
      </div>

      {/* URL textarea */}
      <div className="space-y-2">
        <Textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={"https://youtube.com/watch?v=...\nhttps://tiktok.com/@user/video/...\nhttps://instagram.com/p/..."}
          className="min-h-[160px] rounded-[16px] resize-y font-mono text-sm bg-input border-none focus-visible:ring-2 focus-visible:ring-ring"
          disabled={isDownloading}
        />
        <p className="text-xs text-muted-foreground px-1">
          {lines.length === 0
            ? "Enter one URL per line"
            : `${validLines.length} valid URL${validLines.length !== 1 ? "s" : ""}${
                invalidCount > 0 ? `, ${invalidCount} invalid (skipped)` : ""
              }`}
        </p>
      </div>

      {/* URL preview list */}
      {lines.length > 0 && (
        <div className="bg-card rounded-[18px] p-2 card-shadow flex flex-col gap-1.5">
          {lines.map(({ url, valid }, i) => {
            const platform = valid ? detectPlatform(url) : null;
            return (
              <div
                key={`${url}-${i}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-[12px] transition-colors",
                  valid ? "bg-secondary/50" : "bg-destructive/5 border border-destructive/20"
                )}
              >
                {/* Platform icon */}
                <div className={cn(
                  "w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0",
                  valid ? "bg-secondary" : "bg-destructive/10"
                )}>
                  {platform && platform.id !== "generic" ? (
                    <i className={`${platform.icon} text-sm`} style={{ color: platform.accent }} />
                  ) : (
                    <Globe className={cn("w-4 h-4", valid ? "text-muted-foreground" : "text-destructive")} />
                  )}
                </div>

                {/* URL text */}
                <div className="min-w-0 flex-1">
                  <p className={cn(
                    "text-xs truncate font-mono",
                    valid ? "text-foreground" : "text-destructive"
                  )}>
                    {url}
                  </p>
                  {platform && valid && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">{platform.label}</p>
                  )}
                  {!valid && (
                    <p className="text-[10px] text-destructive mt-0.5">Not a valid URL — will be skipped</p>
                  )}
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeUrl(url)}
                  className="w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Action button */}
      <Button
        onClick={handleDownloadAll}
        disabled={validLines.length === 0 || isDownloading}
        className="w-full h-[51px] rounded-[16px] font-semibold text-base gap-2"
      >
        {isDownloading ? (
          <>
            <i className="fa-solid fa-circle-notch fa-spin" /> Submitting downloads…
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            Download All ({validLines.length} URL{validLines.length !== 1 ? "s" : ""})
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Downloads are submitted sequentially. Progress appears in the active downloads list.
        Best video quality is selected automatically.
      </p>
    </div>
  );
}
