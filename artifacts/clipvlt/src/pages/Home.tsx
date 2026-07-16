import { useState } from "react";
import { Link } from "wouter";
import { UrlInput } from "@/components/shared/UrlInput";
import { siteConfig } from "@/lib/siteConfig";
import { useHistory } from "@/hooks/useHistory";
import { detectPlatform, PLATFORMS } from "@/lib/platforms";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, FastForward, Download, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function Home() {
  const [url, setUrl] = useState("");
  const { entries } = useHistory();
  const recent = entries.slice(0, 3);

  const handleExtract = () => {
    if (url.trim()) {
      window.location.href = `/download?url=${encodeURIComponent(url.trim())}`;
    }
  };

  return (
    <div className="flex flex-col gap-10 pb-16">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="text-center space-y-6 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-[40px] leading-[1.1] md:text-6xl font-bold tracking-tight text-balance text-foreground">
          Download media from{" "}
          <span className="text-primary">anywhere.</span>
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto text-balance">
          {siteConfig.tagline}. High quality, no watermarks, completely free.
        </p>
        <div className="max-w-xl mx-auto w-full pt-2">
          <UrlInput
            value={url}
            onChange={setUrl}
            onSubmit={handleExtract}
            isLoading={false}
          />
        </div>
      </section>

      {/* ── Platform slider (infinite marquee) ───────────────── */}
      <section className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-4">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Supported Platforms
          </span>
        </div>
        <div className="relative overflow-hidden">
          {/* Fade edges */}
          <div className="absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          {/* Marquee track — duplicated 2x so translateX(-50%) creates seamless loop */}
          <div className="marquee-track">
            {[...PLATFORMS, ...PLATFORMS].map((p, i) => (
              <div
                key={`${p.id}-${i}`}
                className="flex items-center gap-2 px-3 py-1.5 shrink-0 opacity-75 hover:opacity-100 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <i className={`${p.icon} text-lg`} style={{ color: p.accent }} title={p.label} />
                </div>
                <span className="text-sm font-medium whitespace-nowrap">{p.label}</span>
                <span className="w-px h-5 bg-border mx-1 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent Downloads ─────────────────────────────────── */}
      {recent.length > 0 && (
        <section className="space-y-4 pt-2 max-w-3xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" /> Recent Downloads
            </h2>
            <Link href="/history" className="text-xs text-info hover:underline font-semibold">
              View all
            </Link>
          </div>
          <div className="bg-card rounded-[20px] p-2 card-shadow flex flex-col gap-1.5">
            {recent.map((entry) => {
              const platform = detectPlatform(entry.url);
              return (
                <Link key={entry.id} href={`/download?url=${encodeURIComponent(entry.url)}`}>
                  <div className="rounded-[14px] bg-secondary/50 p-3 flex items-center gap-3 hover:bg-secondary transition-colors cursor-pointer group">
                    <div className="w-[42px] h-[42px] rounded-[10px] bg-muted overflow-hidden shrink-0">
                      {entry.metadata.thumbnail ? (
                        <img src={entry.metadata.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-card">
                          <i className={platform?.icon} style={{ color: platform?.accent }} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-semibold truncate text-foreground">
                        {entry.metadata.title || entry.url}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        {platform && (
                          <><i className={platform.icon} style={{ color: platform.accent }} /> {platform.label} ·</>
                        )}
                        {formatDistanceToNow(entry.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Feature cards ────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 max-w-4xl mx-auto">
        <Card className="bg-card rounded-[18px] border-none card-shadow">
          <CardContent className="p-6 space-y-3">
            <div className="w-11 h-11 rounded-[12px] bg-primary/10 text-primary flex items-center justify-center mb-2">
              <FastForward className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Blazing Fast</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Direct extraction from edge servers at your maximum connection speed.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card rounded-[18px] border-none card-shadow">
          <CardContent className="p-6 space-y-3">
            <div className="w-11 h-11 rounded-[12px] bg-info/10 text-info flex items-center justify-center mb-2">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Best Quality</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Up to 4K HDR video and high-bitrate audio from real format streams.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card rounded-[18px] border-none card-shadow">
          <CardContent className="p-6 space-y-3">
            <div className="w-11 h-11 rounded-[12px] bg-accent/10 text-accent flex items-center justify-center mb-2">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">No Nonsense</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              No popups, no fake download buttons, no tracking. Just the file.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="space-y-6 pt-6 max-w-3xl mx-auto w-full">
        <h2 className="text-xl font-bold text-center">Frequently Asked Questions</h2>
        <div className="bg-card rounded-[20px] p-3 card-shadow flex flex-col gap-2">
          {[
            {
              q: "Is this tool free?",
              a: "Yes, Clipvlt is completely free to use with no limits on downloads.",
            },
            {
              q: "What platforms are supported?",
              a: "YouTube, TikTok, Instagram, X/Twitter, Reddit, Vimeo, SoundCloud, and hundreds more.",
            },
            {
              q: "Where do the files go?",
              a: "Files are downloaded directly to your device's default Downloads folder.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="p-4 rounded-[14px] bg-secondary/50">
              <h4 className="font-bold mb-1.5 text-[15px]">{q}</h4>
              <p className="text-sm text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
