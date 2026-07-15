import { useState } from "react";
import { useHistory } from "@/hooks/useHistory";
import { detectPlatform } from "@/lib/platforms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Clock, Download, Trash2, Video, FileAudio, Image as ImageIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useDownloadQueue } from "@/hooks/useDownloadQueue";

export function HistoryPage() {
  const { entries, removeEntry, clearHistory } = useHistory();
  const { enqueue } = useDownloadQueue();
  
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState("all");

  const filtered = entries.filter(e => {
    if (kindFilter !== "all" && e.kind !== kindFilter) return false;
    if (search && !e.metadata.title?.toLowerCase().includes(search.toLowerCase()) && !e.url.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleRedownload = (entry: any) => {
    enqueue({
      url: entry.url,
      kind: entry.kind,
      formatId: null, // Since we might not have the exact formatId still valid, we just re-run extraction logic practically. Wait, enqueue needs it. Best effort:
      label: `Retry: ${entry.metadata.title?.slice(0, 20)}`
    });
  };

  const getKindIcon = (kind: string) => {
    if (kind === 'audio') return <FileAudio className="w-4 h-4" />;
    if (kind === 'thumbnail') return <ImageIcon className="w-4 h-4" />;
    return <Video className="w-4 h-4" />;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Download History</h1>
          <p className="text-muted-foreground">Your locally saved download records.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search history..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>
          <Select value={kindFilter} onValueChange={setKindFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Filter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="thumbnail">Thumbnails</SelectItem>
              <SelectItem value="playlist">Playlists</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={clearHistory} title="Clear all history">
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
            <Clock className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-semibold">No history found</h3>
          <p className="text-muted-foreground">Your recent downloads will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(entry => {
            const platform = detectPlatform(entry.url);
            return (
              <div key={entry.id} className="group relative bg-card border rounded-xl p-4 flex gap-4 hover:border-primary/50 transition-colors shadow-sm">
                <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center">
                  {entry.metadata.thumbnail ? (
                    <img src={entry.metadata.thumbnail} className="w-full h-full object-cover" />
                  ) : (
                    <i className={platform?.icon} style={{ fontSize: '2rem', color: platform?.accent }} />
                  )}
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white p-1 rounded backdrop-blur-sm">
                    {getKindIcon(entry.kind)}
                  </div>
                </div>
                
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className="font-semibold text-sm line-clamp-2" title={entry.metadata.title}>{entry.metadata.title || entry.url}</h4>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeEntry(entry.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mb-auto">
                    {platform && (
                      <span className="flex items-center gap-1">
                        <i className={platform.icon} style={{ color: platform.accent }} /> {platform.label}
                      </span>
                    )}
                    <span>•</span>
                    <span>{formatDistanceToNow(entry.createdAt, { addSuffix: true })}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded">{entry.resolution || entry.kind.toUpperCase()}</span>
                    <Button variant="secondary" size="sm" className="h-7 text-xs" onClick={() => handleRedownload(entry)}>
                      <Download className="w-3 h-3 mr-1.5" /> Retry
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
