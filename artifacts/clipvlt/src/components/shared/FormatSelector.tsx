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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <FileVideo className="w-4 h-4" /> Video
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {bestVideo && (
                <Button
                  variant="default"
                  className="w-full justify-between h-auto py-3 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary border border-primary/20 dark:border-primary/30"
                  onClick={() => onSelect(bestVideo.format_id, "video")}
                  disabled={isLoading}
                >
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-semibold text-sm">Best Quality</span>
                    <span className="text-xs opacity-80">{bestVideo.resolution || "Unknown"} • {bestVideo.ext}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono opacity-70">{formatSize(bestVideo.filesize ?? bestVideo.filesize_approx)}</span>
                    <Download className="w-4 h-4" />
                  </div>
                </Button>
              )}
              {bucketedVideos.map(f => {
                if (f.format_id === bestVideo?.format_id) return null;
                const h = parseInt(f.resolution?.split('x')[1] || "0");
                return (
                  <Button
                    key={f.format_id}
                    variant="outline"
                    className="w-full justify-between h-auto py-2"
                    onClick={() => onSelect(f.format_id, "video")}
                    disabled={isLoading}
                  >
                    <div className="flex items-center gap-2">
                      <span className="bg-muted px-2 py-0.5 rounded text-xs font-medium">{getResBadge(h)}</span>
                      <span className="text-sm">{f.resolution}</span>
                      {f.fps && f.fps > 30 && <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold">{f.fps}fps</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground font-mono">{formatSize(f.filesize ?? f.filesize_approx)}</span>
                      <Download className="w-3 h-3" />
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <FileAudio className="w-4 h-4" /> Audio
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {bucketedAudio.map(({ label, f }, i) => (
                <Button
                  key={f.format_id}
                  variant={i === 0 ? "secondary" : "outline"}
                  className="w-full justify-between h-auto py-3"
                  onClick={() => onSelect(f.format_id, "audio", "mp3")}
                  disabled={isLoading}
                >
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-semibold text-sm">{label}</span>
                    <span className="text-xs opacity-80">{f.abr ? `${f.abr} kbps • ` : ''}MP3</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs opacity-70 font-mono">{formatSize(f.filesize ?? f.filesize_approx)}</span>
                    <Download className="w-4 h-4" />
                  </div>
                </Button>
              ))}
            </div>
            
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mt-4">
              <FileImage className="w-4 h-4" /> Extras
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => onSelect(null, "thumbnail")} disabled={isLoading} className="h-10">
                Thumbnail
              </Button>
              <Button variant="outline" size="sm" onClick={() => onSelect(null, "subtitle")} disabled={isLoading} className="h-10">
                Subtitles
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-md border bg-card text-card-foreground overflow-hidden text-sm">
          <div className="max-h-[300px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-muted/50 sticky top-0 backdrop-blur-sm z-10">
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="p-2 font-medium">ID</th>
                  <th className="p-2 font-medium">Type</th>
                  <th className="p-2 font-medium">Res/Bitrate</th>
                  <th className="p-2 font-medium">Size</th>
                  <th className="p-2 font-medium">Codec</th>
                  <th className="p-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {formats.map(f => (
                  <tr key={f.format_id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-2 font-mono text-[10px] whitespace-nowrap">{f.format_id}</td>
                    <td className="p-2 text-xs">
                      {f.has_video && f.has_audio ? "A+V" : f.has_video ? "Video" : f.has_audio ? "Audio" : "Other"}
                    </td>
                    <td className="p-2 text-xs">
                      {f.resolution || (f.abr ? `${f.abr}k` : '-')} {f.fps ? `@${f.fps}` : ''}
                    </td>
                    <td className="p-2 text-xs font-mono">
                      {formatSize(f.filesize ?? f.filesize_approx) || '-'}
                    </td>
                    <td className="p-2 text-[10px] text-muted-foreground max-w-[120px] truncate">
                      {f.vcodec !== 'none' ? f.vcodec : ''} {f.acodec !== 'none' ? f.acodec : ''}
                    </td>
                    <td className="p-2">
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onSelect(f.format_id, f.has_video ? "video" : "audio")} disabled={isLoading}>
                        <Download className="w-3 h-3" />
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
        className="w-full text-xs text-muted-foreground mt-2"
        onClick={() => setAdvanced(!advanced)}
      >
        {advanced ? <><ChevronUp className="w-3 h-3 mr-1" /> Show Simple</> : <><ChevronDown className="w-3 h-3 mr-1" /> Show Advanced</>}
      </Button>
    </div>
  );
}
