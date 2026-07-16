import { useState } from "react";
import { useHistory } from "@/hooks/useHistory";
import { detectPlatform } from "@/lib/platforms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Clock,
  Download,
  Trash2,
  Video,
  FileAudio,
  Image as ImageIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

export function HistoryPage() {
  const { entries, removeEntry, clearHistory } = useHistory();
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState("all");

  const filtered = entries.filter((e) => {
    if (kindFilter !== "all" && e.kind !== kindFilter) return false;
    if (
      search &&
      !e.metadata.title?.toLowerCase().includes(search.toLowerCase()) &&
      !e.url.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const getKindIcon = (kind: string) => {
    if (kind === "audio") return <FileAudio className="w-4 h-4" />;
    if (kind === "thumbnail") return <ImageIcon className="w-4 h-4" />;
    return <Video className="w-4 h-4" />;
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-6 border-border">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 text-foreground">
            Download History
          </h1>
          <p className="text-muted-foreground">Your locally saved download records.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-[11px] w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search history…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-[180px] rounded-[16px] h-10 bg-secondary border-none focus-visible:ring-1"
            />
          </div>
          <Select value={kindFilter} onValueChange={setKindFilter}>
            <SelectTrigger className="w-[130px] rounded-[16px] h-10 bg-secondary border-none">
              <SelectValue placeholder="Filter type" />
            </SelectTrigger>
            <SelectContent className="rounded-[14px] shadow-sm">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="thumbnail">Thumbnails</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearHistory}
            title="Clear all history"
            className="rounded-[16px] bg-secondary hover:bg-destructive/10 hover:text-destructive text-muted-foreground w-10 h-10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-4">
            <Clock className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No history found</h3>
          <p className="text-muted-foreground text-sm">Your recent downloads will appear here.</p>
        </div>
      ) : (
        <div className="bg-card rounded-[20px] p-2 card-shadow flex flex-col gap-1.5">
          {filtered.map((entry) => {
            const platform = detectPlatform(entry.url);
            return (
              <div
                key={entry.id}
                className="group rounded-[14px] bg-secondary/50 p-3 flex items-center gap-4 hover:bg-secondary transition-colors relative"
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 bg-muted rounded-[10px] overflow-hidden shrink-0 relative flex items-center justify-center">
                  {entry.metadata.thumbnail ? (
                    <img
                      src={entry.metadata.thumbnail}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  ) : (
                    <i
                      className={platform?.icon}
                      style={{ fontSize: "1.5rem", color: platform?.accent }}
                    />
                  )}
                  <div className="absolute bottom-1 right-1 bg-black/60 text-white p-0.5 rounded backdrop-blur-sm">
                    {getKindIcon(entry.kind)}
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-col min-w-0 flex-1 justify-center">
                  <h4
                    className="font-semibold text-sm line-clamp-1 text-foreground"
                    title={entry.metadata.title ?? undefined}
                  >
                    {entry.metadata.title || entry.url}
                  </h4>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                    {platform && (
                      <span className="flex items-center gap-1 font-medium">
                        <i className={platform.icon} style={{ color: platform.accent }} />{" "}
                        {platform.label}
                      </span>
                    )}
                    <span>·</span>
                    <span>{formatDistanceToNow(entry.createdAt, { addSuffix: true })}</span>
                    {entry.resolution && (
                      <>
                        <span>·</span>
                        <span className="font-mono bg-background px-1.5 rounded uppercase tracking-wide">
                          {entry.resolution}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/download?url=${encodeURIComponent(entry.url)}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-9 h-9 rounded-[10px] bg-background text-muted-foreground hover:text-foreground"
                      title="Re-download"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-9 h-9 rounded-[10px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeEntry(entry.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
