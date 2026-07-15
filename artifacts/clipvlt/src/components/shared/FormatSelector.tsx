import { AlertCircle, Download, FileAudio, FileImage, FileVideo, ChevronDown, ChevronUp } from "lucide-react";
import { FormatInfo } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FormatSelectorProps {
  formats: FormatInfo[];
  onSelect: (formatId: string | null, kind: "video" | "audio" | "thumbnail" | "subtitle", audioFormat?: "mp3" | "m4a" | "wav") => void;
  isLoading?: boolean;
}

export function FormatSelector({ formats, onSelect, isLoading }: FormatSelectorProps) {
  const [advanced, setAdvanced] = useState(false);

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "";
    const mb = bytes / 1024 / 1024;
    return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;
  };

  const getResBadge = (height: number) => {
    if (height >= 2160) return "4K";
    if (height >= 1440) return "2K";
    if (height >= 1080) return "FHD";
    if (height >= 720) return "HD";
    return "SD";
  };

  // Filter video formats (must have video). Heuristically pick best of each res.
  const videoFormats = formats.filter(f => f.has_video).sort((a, b) => {
    const resA = a.resolution ? parseInt(a.resolution.split('x')[1]) || 0 : 0;
    const resB = b.resolution ? parseInt(b.resolution.split('x')[1]) || 0 : 0;
    if (resB !== resA) return resB - resA;
    return (b.tbr || 0) - (a.tbr || 0);
  });

  const bestVideo = videoFormats[0];
  const bucketedVideos: FormatInfo[] = [];
  const seenRes = new Set<string>();
  
  for (const f of videoFormats) {
    if (!f.resolution) continue;
    const height = parseInt(f.resolution.split('x')[1]) || 0;
    const badge = getResBadge(height);
    if (!seenRes.has(badge)) {
      seenRes.add(badge);
      bucketedVideos.push(f);
    }
  }

  // Audio formats
  const audioFormats = formats.filter(f => !f.has_video && f.has_audio).sort((a, b) => (b.abr || 0) - (a.abr || 0));
  const bestAudio = audioFormats[0];
  const bucketedAudio: { label: string, f: FormatInfo }[] = [];
  
  if (audioFormats.length > 0) {
    bucketedAudio.push({ label: "High Quality", f: audioFormats[0] });
    if (audioFormats.length > 1) {
      const midIdx = Math.floor(audioFormats.length / 2);
      bucketedAudio.push({ label: "Standard", f: audioFormats[midIdx] });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {!advanced ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2 px-2">
              <FileVideo className="w-4 h-4" /> Video
            </h4>
            <div className="bg-card rounded-[32px] p-2 card-shadow flex flex-col gap-2">
              {bestVideo && (
                <div
                  className="flex items-center justify-between p-3 rounded-[20px] bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                  onClick={() => onSelect(bestVideo.format_id, "video")}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[10px] bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Download className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-foreground">Best Quality</span>
                      <span className="text-xs text-muted-foreground">{bestVideo.resolution || "Unknown"} • {bestVideo.ext}</span>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground bg-background px-2 py-1 rounded-md">
                    {formatSize(bestVideo.filesize ?? bestVideo.filesize_approx)}
                  </div>
                </div>
              )}
              {bucketedVideos.map(f => {
                if (f.format_id === bestVideo?.format_id) return null;
                const h = parseInt(f.resolution?.split('x')[1] || "0");
                return (
                  <div
                    key={f.format_id}
                    className="flex items-center justify-between p-3 rounded-[20px] bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                    onClick={() => onSelect(f.format_id, "video")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[10px] bg-background text-muted-foreground flex items-center justify-center shrink-0 font-bold text-xs">
                        {getResBadge(h)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-foreground">{f.resolution}</span>
                        {f.fps && f.fps > 30 ? (
                          <span className="text-[10px] font-bold text-primary">{f.fps}fps</span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">Standard</span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs font-mono text-muted-foreground">
                      {formatSize(f.filesize ?? f.filesize_approx)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2 px-2">
              <FileAudio className="w-4 h-4" /> Audio & Extras
            </h4>
            <div className="bg-card rounded-[32px] p-2 card-shadow flex flex-col gap-2">
              {bucketedAudio.map(({ label, f }, i) => (
                <div
                  key={f.format_id}
                  className="flex items-center justify-between p-3 rounded-[20px] bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                  onClick={() => onSelect(f.format_id, "audio", "mp3")}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0", i === 0 ? "bg-info/10 text-info" : "bg-background text-muted-foreground")}>
                      <FileAudio className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-foreground">{label}</span>
                      <span className="text-xs text-muted-foreground">{f.abr ? `${f.abr} kbps • ` : ''}MP3</span>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    {formatSize(f.filesize ?? f.filesize_approx)}
                  </div>
                </div>
              ))}

              <div
                className="flex items-center justify-between p-3 rounded-[20px] bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                onClick={() => onSelect(null, "thumbnail")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-background text-muted-foreground flex items-center justify-center shrink-0">
                    <FileImage className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-foreground">Thumbnail</span>
                    <span className="text-xs text-muted-foreground">JPG/WEBP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[32px] bg-card card-shadow overflow-hidden text-sm">
          <div className="max-h-[300px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-secondary/50 sticky top-0 backdrop-blur-sm z-10">
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="p-3 pl-4 font-semibold">ID</th>
                  <th className="p-3 font-semibold">Type</th>
                  <th className="p-3 font-semibold">Res/Bitrate</th>
                  <th className="p-3 font-semibold">Size</th>
                  <th className="p-3 font-semibold">Codec</th>
                  <th className="p-3 pr-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {formats.map(f => (
                  <tr key={f.format_id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-3 pl-4 font-mono text-[10px] whitespace-nowrap">{f.format_id}</td>
                    <td className="p-3 text-xs">
                      {f.has_video && f.has_audio ? "A+V" : f.has_video ? "Video" : f.has_audio ? "Audio" : "Other"}
                    </td>
                    <td className="p-3 text-xs">
                      {f.resolution || (f.abr ? `${f.abr}k` : '-')} {f.fps ? `@${f.fps}` : ''}
                    </td>
                    <td className="p-3 text-xs font-mono">
                      {formatSize(f.filesize ?? f.filesize_approx) || '-'}
                    </td>
                    <td className="p-3 text-[10px] text-muted-foreground max-w-[120px] truncate">
                      {f.vcodec !== 'none' ? f.vcodec : ''} {f.acodec !== 'none' ? f.acodec : ''}
                    </td>
                    <td className="p-3 pr-4 text-right">
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => onSelect(f.format_id, f.has_video ? "video" : "audio")} disabled={isLoading}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="w-fit mx-auto text-xs text-muted-foreground mt-2 rounded-full"
        onClick={() => setAdvanced(!advanced)}
      >
        {advanced ? <><ChevronUp className="w-4 h-4 mr-1" /> Show Simple Cards</> : <><ChevronDown className="w-4 h-4 mr-1" /> Show Advanced Table</>}
      </Button>
    </div>
  );
}
