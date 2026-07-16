import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type FormatInfo } from "@/lib/api";
import { cn } from "@/lib/utils";

// ─── Quality badge helpers ────────────────────────────────

interface Badge {
  label: string;
  dotClass: string;
  rank: number; // higher = better quality (for sorting)
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
    return { label: "Audio", dotClass: "bg-orange-500", rank: 10 };
  }
  const h = parseHeight(f.resolution);
  if (h >= 2160) return { label: "4K",  dotClass: "bg-violet-500", rank: 40 };
  if (h >= 1080) return { label: "FHD", dotClass: "bg-green-500",  rank: 30 };
  if (h >= 720)  return { label: "HD",  dotClass: "bg-blue-500",   rank: 20 };
  if (h > 0)     return { label: "SD",  dotClass: "bg-gray-400",   rank: 10 };
  return { label: f.ext?.toUpperCase() || "?", dotClass: "bg-gray-400", rank: 5 };
}

function formatSize(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "";
  const mb = bytes / 1_048_576;
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  if (mb >= 1)    return `${mb.toFixed(0)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function bestSize(f: FormatInfo): number {
  return f.filesize ?? f.filesize_approx ?? 0;
}

// ─── Quality chip component ───────────────────────────────

function QualityChip({ badge, selected }: { badge: Badge; selected?: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold shrink-0",
      selected ? "bg-primary/15 text-primary" : "bg-secondary text-foreground"
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", badge.dotClass)} />
      {badge.label}
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

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-[14px] transition-all text-left",
        isSelected
          ? "bg-primary/10 border border-primary/30 shadow-sm"
          : "bg-secondary/50 hover:bg-secondary border border-transparent"
      )}
    >
      <QualityChip badge={badge} selected={isSelected} />

      <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-2 gap-y-0.5">
        {res && (
          <span className="text-sm font-semibold text-foreground">{res}</span>
        )}
        {fps && (
          <span className="text-xs text-muted-foreground">{fps}</span>
        )}
        {abr && !res && (
          <span className="text-sm font-semibold text-foreground">{abr}</span>
        )}
        {isRecommended && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
            <Star className="w-2.5 h-2.5 fill-current" /> Recommended
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {size > 0 && (
          <span className="text-xs text-muted-foreground font-mono">{formatSize(size)}</span>
        )}
        <div className={cn(
          "w-4 h-4 rounded-full border-2 transition-all shrink-0",
          isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
        )}>
          {isSelected && (
            <div className="w-full h-full rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
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
    <div className="overflow-x-auto rounded-[14px] border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b bg-secondary/50 text-muted-foreground">
            <th className="text-left px-3 py-2 font-semibold">ID</th>
            <th className="text-left px-3 py-2 font-semibold">Ext</th>
            <th className="text-left px-3 py-2 font-semibold">Resolution</th>
            <th className="text-left px-3 py-2 font-semibold hidden sm:table-cell">Video</th>
            <th className="text-left px-3 py-2 font-semibold hidden sm:table-cell">Audio</th>
            <th className="text-left px-3 py-2 font-semibold">Size</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {formats.map((f) => (
            <tr
              key={f.format_id}
              onClick={() => onSelect(f)}
              className={cn(
                "border-b last:border-0 cursor-pointer transition-colors",
                f.format_id === selectedId
                  ? "bg-primary/8"
                  : "hover:bg-secondary/50"
              )}
            >
              <td className="px-3 py-2 font-mono text-muted-foreground">{f.format_id}</td>
              <td className="px-3 py-2 uppercase font-semibold">{f.ext}</td>
              <td className="px-3 py-2">{f.resolution || "—"}</td>
              <td className="px-3 py-2 font-mono hidden sm:table-cell text-muted-foreground max-w-[80px] truncate">{f.vcodec || "—"}</td>
              <td className="px-3 py-2 font-mono hidden sm:table-cell text-muted-foreground max-w-[80px] truncate">{f.acodec || "—"}</td>
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
    <div className="space-y-2">
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
            <ChevronDown className="w-4 h-4" /> Show all formats ({modeFormats.length})
          </>
        )}
      </Button>

      {/* Advanced raw table (only in expanded view) */}
      {showAll && (
        <div className="pt-2 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            All formats — raw data from backend
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
