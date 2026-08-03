import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Star, Sparkles, Film, Music, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type FormatInfo } from "@/lib/api";
import { cn } from "@/lib/utils";

// ─── Quality badge helpers ────────────────────────────────

interface Badge {
  label: string;
  dotClass: string;
  rank: number; // higher = better quality (for sorting)
  isHighQuality?: boolean;
}

function parseHeight(resolution: string | null | undefined): number {
  if (!resolution) return 0;
  const xy = resolution.match(/(\d+)\s*[xX×]\s*(\d+)/);
  if (xy) return parseInt(xy[2]);
  const p = resolution.match(/(\d+)p/i);
  if (p) return parseInt(p[1]);
  if (/4k/i.test(resolution)) return 2160;
  if (/2k/i.test(resolution)) return 1440;
  return 0;
}

function getBadge(f: FormatInfo): Badge {
  if (!f.has_video && f.has_audio) {
    const abr = f.abr ? Math.round(f.abr) : 0;
    if (abr >= 256) return { label: `HQ Audio (${abr}kbps)`, dotClass: "bg-amber-500", rank: 15, isHighQuality: true };
    return { label: f.abr ? `${Math.round(f.abr)}kbps Audio` : "Audio Stream", dotClass: "bg-orange-500", rank: 10 };
  }
  const h = parseHeight(f.resolution);
  if (h >= 2160) return { label: "4K Ultra HD (2160p)", dotClass: "bg-amber-400", rank: 40, isHighQuality: true };
  if (h >= 1440) return { label: "2K Quad HD (1440p)", dotClass: "bg-purple-400", rank: 35, isHighQuality: true };
  if (h >= 1080) return { label: "1080p Full HD", dotClass: "bg-emerald-400", rank: 30, isHighQuality: true };
  if (h >= 720) return { label: "720p HD", dotClass: "bg-blue-400", rank: 20 };
  if (h >= 480) return { label: "480p SD", dotClass: "bg-gray-400", rank: 12 };
  if (h > 0) return { label: `${h}p`, dotClass: "bg-gray-400", rank: 10 };
  return { label: f.ext?.toUpperCase() || "Media Format", dotClass: "bg-gray-400", rank: 5 };
}

function formatSize(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "";
  const mb = bytes / 1_048_576;
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  if (mb >= 1) return `${mb.toFixed(0)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function bestSize(f: FormatInfo): number {
  return f.filesize ?? f.filesize_approx ?? 0;
}

// ─── Quality chip component ───────────────────────────────

function QualityChip({ badge, selected }: { badge: Badge; selected?: boolean }) {
  if (badge.isHighQuality) {
    return (
      <span className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold shrink-0 transition-all",
        selected
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 ring-2 ring-primary/40"
          : "bg-gradient-to-r from-amber-500/20 via-primary/20 to-rose-500/20 text-primary border border-primary/30 shadow-xs"
      )}>
        <Sparkles className="w-3 h-3 text-amber-500 animate-spin-slow shrink-0" />
        <span>{badge.label}</span>
      </span>
    );
  }

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 border border-border/40",
      selected ? "bg-primary/15 text-primary border-primary/30" : "bg-secondary text-foreground"
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", badge.dotClass)} />
      <span>{badge.label}</span>
    </span>
  );
}

// ─── Format row ───────────────────────────────────────────

interface FormatRowProps {
  format: FormatInfo;
  badge: Badge;
  isSelected: boolean;
  isRecommended?: boolean;
  onClick: () => void;
}

function FormatRow({ format, badge, isSelected, isRecommended, onClick }: FormatRowProps) {
  const size = bestSize(format);
  const fps = format.fps && format.fps > 0 ? `${format.fps}fps` : null;
  const res = format.resolution && format.resolution !== "audio only" ? format.resolution : null;
  const abr = format.abr ? `${Math.round(format.abr)}kbps` : null;
  const ext = format.ext ? format.ext.toUpperCase() : "MP4";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] transition-all text-left relative overflow-hidden group",
        isSelected
          ? "bg-primary/10 border-2 border-primary shadow-md shadow-primary/10"
          : badge.isHighQuality
          ? "bg-card hover:bg-secondary/70 border border-primary/30 shadow-xs"
          : "bg-secondary/50 hover:bg-secondary border border-border/50"
      )}
    >
      {/* High Quality Glow background highlight */}
      {badge.isHighQuality && !isSelected && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
      )}

      <QualityChip badge={badge} selected={isSelected} />

      <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <span className="text-xs sm:text-sm font-semibold text-foreground">
          {ext} {res ? `· ${res}` : ""}
        </span>
        {fps && (
          <span className="text-xs text-muted-foreground font-mono">({fps})</span>
        )}
        {abr && (
          <span className="text-xs text-muted-foreground font-mono">({abr})</span>
        )}
        {isRecommended && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
            <Star className="w-2.5 h-2.5 fill-current" /> Best Option
          </span>
        )}
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {size > 0 && (
          <span className="text-xs font-mono font-medium text-muted-foreground">{formatSize(size)}</span>
        )}
        <div className={cn(
          "w-4 h-4 rounded-full border-2 transition-all shrink-0 flex items-center justify-center",
          isSelected ? "border-primary bg-primary" : "border-muted-foreground/40 group-hover:border-primary/60"
        )}>
          {isSelected && (
            <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Advanced raw table ───────────────────────────────────

function AdvancedTable({ formats, onSelect, selectedId }: {
  formats: FormatInfo[];
  onSelect: (f: FormatInfo) => void;
  selectedId: string | null;
}) {
  return (
    <div className="overflow-x-auto rounded-[16px] border border-border/60 bg-card">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border/50 bg-secondary/50 text-muted-foreground">
            <th className="text-left px-3 py-2 font-semibold">Format ID</th>
            <th className="text-left px-3 py-2 font-semibold">Ext</th>
            <th className="text-left px-3 py-2 font-semibold">Resolution / Bitrate</th>
            <th className="text-left px-3 py-2 font-semibold hidden sm:table-cell">Video Codec</th>
            <th className="text-left px-3 py-2 font-semibold hidden sm:table-cell">Audio Codec</th>
            <th className="text-left px-3 py-2 font-semibold">File Size</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {formats.map((f) => (
            <tr
              key={f.format_id}
              onClick={() => onSelect(f)}
              className={cn(
                "border-b border-border/40 last:border-0 cursor-pointer transition-colors",
                f.format_id === selectedId
                  ? "bg-primary/10 font-semibold text-primary"
                  : "hover:bg-secondary/50 text-foreground"
              )}
            >
              <td className="px-3 py-2 font-mono text-muted-foreground">{f.format_id}</td>
              <td className="px-3 py-2 uppercase font-semibold">{f.ext}</td>
              <td className="px-3 py-2">{f.resolution || (f.abr ? `${Math.round(f.abr)}kbps` : "—")}</td>
              <td className="px-3 py-2 font-mono hidden sm:table-cell text-muted-foreground max-w-[90px] truncate">{f.vcodec || "—"}</td>
              <td className="px-3 py-2 font-mono hidden sm:table-cell text-muted-foreground max-w-[90px] truncate">{f.acodec || "—"}</td>
              <td className="px-3 py-2 font-mono">{formatSize(bestSize(f))}</td>
              <td className="px-3 py-2">
                <div className={cn(
                  "w-3.5 h-3.5 rounded-full border-2",
                  f.format_id === selectedId ? "border-primary bg-primary" : "border-muted-foreground/40"
                )} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main FormatSelector ──────────────────────────────────

interface FormatSelectorProps {
  formats: FormatInfo[];
  mode: "video" | "audio";
  selectedFormat: FormatInfo | null;
  onSelectFormat: (f: FormatInfo) => void;
}

export function FormatSelector({ formats, mode, selectedFormat, onSelectFormat }: FormatSelectorProps) {
  const [showAll, setShowAll] = useState(false);

  // Filter by mode
  const modeFormats = useMemo(() => {
    if (mode === "video") return formats.filter((f) => f.has_video);
    return formats.filter((f) => f.has_audio && !f.has_video);
  }, [formats, mode]);

  // Build curated default set
  const curatedFormats = useMemo(() => {
    if (mode === "audio") {
      // Best audio per bitrate tier
      const sorted = [...modeFormats].sort((a, b) => (b.abr ?? 0) - (a.abr ?? 0));
      const seen = new Set<string>();
      return sorted.filter((f) => {
        const b = getBadge(f);
        if (seen.has(b.label)) return false;
        seen.add(b.label);
        return true;
      });
    }
    // Video: one representative per quality badge, sorted best-first
    const withBadge = modeFormats.map((f) => ({ f, badge: getBadge(f) }));
    withBadge.sort((a, b) => b.badge.rank - a.badge.rank || (b.f.fps ?? 0) - (a.f.fps ?? 0));
    const seen = new Set<string>();
    return withBadge
      .filter(({ badge }) => {
        if (seen.has(badge.label)) return false;
        seen.add(badge.label);
        return true;
      })
      .map(({ f }) => f);
  }, [modeFormats, mode]);

  const displayFormats = showAll ? modeFormats : curatedFormats;
  const topFormat = curatedFormats[0] ?? null;

  if (modeFormats.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">
        No {mode} formats available for this link.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Format list */}
      <div className="flex flex-col gap-2">
        {displayFormats.map((f) => (
          <FormatRow
            key={f.format_id}
            format={f}
            badge={getBadge(f)}
            isSelected={selectedFormat?.format_id === f.format_id}
            isRecommended={!showAll && f === topFormat}
            onClick={() => onSelectFormat(f)}
          />
        ))}
      </div>

      {/* Expand / collapse */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full rounded-[14px] text-muted-foreground hover:text-foreground gap-1.5 mt-1 h-9 text-sm"
        onClick={() => setShowAll((v) => !v)}
      >
        {showAll ? (
          <>
            <ChevronUp className="w-4 h-4" /> Show fewer formats
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" /> Show all available formats ({modeFormats.length})
          </>
        )}
      </Button>

      {/* Advanced raw table (only in expanded view) */}
      {showAll && (
        <div className="pt-2 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            All formats — raw resolution stream data
          </p>
          <AdvancedTable
            formats={modeFormats}
            onSelect={onSelectFormat}
            selectedId={selectedFormat?.format_id ?? null}
          />
        </div>
      )}
    </div>
  );
}
