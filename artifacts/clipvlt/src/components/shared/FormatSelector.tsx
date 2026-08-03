import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type FormatInfo } from "@/lib/api";
import { cn } from "@/lib/utils";

// ─── Quality badge helpers ────────────────────────────────

interface Badge {
  label: string;
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
    return { label: "Audio", rank: 10 };
  }
  const h = parseHeight(f.resolution);
  if (h >= 2160) return { label: "4K", rank: 40 };
  if (h >= 1440) return { label: "2K", rank: 35 };
  if (h >= 1080) return { label: "FHD", rank: 30 };
  if (h >= 720) return { label: "HD", rank: 20 };
  if (h >= 480) return { label: "SD", rank: 12 };
  if (h > 0) return { label: `${h}p`, rank: 10 };
  return { label: f.ext?.toUpperCase() || "Media", rank: 5 };
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

// ─── Minimal Quality Badge (Website theme color + shine effect) ──

function QualityBadge({ label, selected }: { label: string; selected?: boolean }) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center px-2 py-0.5 rounded-[6px] text-[11px] sm:text-xs font-bold shrink-0 overflow-hidden transition-colors border",
        selected
          ? "bg-primary text-primary-foreground border-primary shadow-xs"
          : "bg-primary/10 text-primary border-primary/30"
      )}
    >
      {/* Clean shine effect animation overlay */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full animate-[shine_2.5s_infinite]" />
      <span>{label}</span>
    </span>
  );
}

// ─── Format row (Strictly 1 line in mobile mode) ─────────

interface FormatRowProps {
  format: FormatInfo;
  badge: Badge;
  isSelected: boolean;
  onClick: () => void;
}

function FormatRow({ format, badge, isSelected, onClick }: FormatRowProps) {
  const size = bestSize(format);
  const res = format.resolution && format.resolution !== "audio only" ? format.resolution : null;
  const abr = format.abr ? `${Math.round(format.abr)}kbps` : null;
  const ext = format.ext ? format.ext.toUpperCase() : "MP4";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between gap-2 px-3 sm:px-4 py-3 rounded-[14px] transition-all text-left whitespace-nowrap overflow-hidden group",
        isSelected
          ? "bg-primary/10 border border-primary/40 shadow-xs"
          : "bg-secondary/50 hover:bg-secondary border border-border/40"
      )}
    >
      {/* Left side: Badge + Format details in 1 line */}
      <div className="flex items-center gap-2 min-w-0 truncate">
        <QualityBadge label={badge.label} selected={isSelected} />
        <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
          {ext} {res ? `· ${res}` : abr ? `· ${abr}` : ""}
        </span>
      </div>

      {/* Right side: File size + Radio selection in 1 line */}
      <div className="flex items-center gap-2 shrink-0">
        {size > 0 && (
          <span className="text-xs font-mono text-muted-foreground">{formatSize(size)}</span>
        )}
        <div
          className={cn(
            "w-4 h-4 rounded-full border-2 transition-all shrink-0 flex items-center justify-center",
            isSelected ? "border-primary bg-primary" : "border-muted-foreground/40 group-hover:border-primary/60"
          )}
        >
          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
      </div>
    </button>
  );
}

// ─── Advanced raw table ───────────────────────────────────

function AdvancedTable({
  formats,
  onSelect,
  selectedId,
}: {
  formats: FormatInfo[];
  onSelect: (f: FormatInfo) => void;
  selectedId: string | null;
}) {
  return (
    <div className="overflow-x-auto rounded-[14px] border border-border/60 bg-card">
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
                "border-b border-border/40 last:border-0 cursor-pointer transition-colors whitespace-nowrap",
                f.format_id === selectedId
                  ? "bg-primary/10 font-semibold text-primary"
                  : "hover:bg-secondary/50 text-foreground"
              )}
            >
              <td className="px-3 py-2 font-mono text-muted-foreground">{f.format_id}</td>
              <td className="px-3 py-2 uppercase font-semibold">{f.ext}</td>
              <td className="px-3 py-2">{f.resolution || (f.abr ? `${Math.round(f.abr)}kbps` : "—")}</td>
              <td className="px-3 py-2 font-mono hidden sm:table-cell text-muted-foreground max-w-[90px] truncate">
                {f.vcodec || "—"}
              </td>
              <td className="px-3 py-2 font-mono hidden sm:table-cell text-muted-foreground max-w-[90px] truncate">
                {f.acodec || "—"}
              </td>
              <td className="px-3 py-2 font-mono">{formatSize(bestSize(f))}</td>
              <td className="px-3 py-2">
                <div
                  className={cn(
                    "w-3.5 h-3.5 rounded-full border-2",
                    f.format_id === selectedId ? "border-primary bg-primary" : "border-muted-foreground/40"
                  )}
                />
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
      const sorted = [...modeFormats].sort((a, b) => (b.abr ?? 0) - (a.abr ?? 0));
      const seen = new Set<string>();
      return sorted.filter((f) => {
        const b = getBadge(f);
        if (seen.has(b.label)) return false;
        seen.add(b.label);
        return true;
      });
    }
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
            onClick={() => onSelectFormat(f)}
          />
        ))}
      </div>

      {/* Expand / collapse */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full rounded-[14px] text-muted-foreground hover:text-foreground gap-1.5 mt-1 h-9 text-xs sm:text-sm"
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
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
            All formats — raw stream data
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
