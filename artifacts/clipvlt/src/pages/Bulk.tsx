import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDownloadQueue } from "@/hooks/useDownloadQueue";
import { detectPlatform, isLikelyUrl } from "@/lib/platforms";
import { CheckCircle2, Download, Layers, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function BulkDownloader() {
  const [text, setText] = useState("");
  const { enqueue } = useDownloadQueue();

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  const items = lines.map(line => ({
    url: line,
    valid: isLikelyUrl(line),
    platform: detectPlatform(line)
  }));

  const validCount = items.filter(i => i.valid).length;

  const handleDownloadAll = async () => {
    for (const item of items) {
      if (item.valid) {
        await enqueue({
          url: item.url,
          kind: "best",
          label: `Bulk: ${item.platform?.label || "Media"} Link`
        });
      }
    }
    setText(""); // clear on success
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Bulk Downloader</h1>
        <p className="text-muted-foreground">Paste multiple links to download them all sequentially.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="https://tiktok.com/@user/video/123&#10;https://instagram.com/p/abc&#10;https://x.com/user/status/456"
            className="min-h-[400px] font-mono text-sm leading-relaxed p-4 resize-none focus-visible:ring-primary shadow-inner"
          />
          <Button 
            className="w-full gap-2 h-12 text-lg" 
            disabled={validCount === 0}
            onClick={handleDownloadAll}
          >
            <Layers className="w-5 h-5" /> Download {validCount} {validCount === 1 ? 'Item' : 'Items'}
          </Button>
        </div>

        <div className="bg-card border rounded-xl shadow-sm p-4 overflow-hidden flex flex-col h-[400px]">
          <h3 className="font-semibold border-b pb-3 mb-3 flex items-center justify-between">
            Detected Links
            <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">{items.length} total</span>
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                <Layers className="w-12 h-12 mb-2" />
                <p>Paste links to see preview</p>
              </div>
            ) : (
              items.map((item, i) => (
                <div key={i} className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border text-sm transition-colors",
                  item.valid ? "bg-card" : "bg-destructive/5 border-destructive/20"
                )}>
                  <div className="shrink-0">
                    {item.valid ? (
                      item.platform ? (
                        <i className={cn(item.platform.icon, "text-xl")} style={{ color: item.platform.accent }} />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-mono text-xs">{item.url}</p>
                    {item.valid && item.platform && (
                      <p className="text-[10px] font-medium text-muted-foreground mt-0.5 uppercase tracking-wider">{item.platform.label}</p>
                    )}
                    {!item.valid && (
                      <p className="text-[10px] font-medium text-destructive mt-0.5">Invalid URL</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
