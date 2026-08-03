import { useState } from "react";
import { Link, useLocation } from "wouter";
import { UrlInput } from "@/components/shared/UrlInput";
import { siteConfig } from "@/lib/siteConfig";
import { useHistory } from "@/hooks/useHistory";
import { detectPlatform, PLATFORMS } from "@/lib/platforms";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  FastForward,
  Download,
  Shield,
  Sparkles,
  Zap,
  CheckCircle2,
  FileVideo,
  Music2,
  Lock,
  Layers,
  ArrowRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const SAMPLE_URLS = [
  { label: "YouTube Video", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", icon: "fa-brands fa-youtube", color: "#FF0000" },
  { label: "TikTok Reel", url: "https://www.tiktok.com/@tiktok/video/71234567890", icon: "fa-brands fa-tiktok", color: "#00F2FE" },
  { label: "Instagram Post", url: "https://www.instagram.com/p/C1234567890/", icon: "fa-brands fa-instagram", color: "#E4405F" },
  { label: "Twitter / X", url: "https://x.com/twitter/status/1234567890", icon: "fa-brands fa-x-twitter", color: "#1DA1F2" },
];

export function Home() {
  const [url, setUrl] = useState("");
  const [, navigate] = useLocation();
  const { entries } = useHistory();
  const recent = entries.slice(0, 3);

  // Client-side SPA navigation
  const handleExtract = (targetUrl?: string) => {
    const finalUrl = (targetUrl || url).trim();
    if (finalUrl) {
      navigate(`/download?url=${encodeURIComponent(finalUrl)}`);
    }
  };

  // Split hero title: highlight the last word with primary color
  const heroWords = siteConfig.heroTitle.trim().split(/\s+/);
  const heroHighlight = heroWords.pop() ?? "";
  const heroRest = heroWords.join(" ");

  return (
    <div className="flex flex-col gap-12 sm:gap-16 pb-20 relative overflow-hidden">
      {/* ── Background Decoration ─────────────────────────────── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none z-0">
        <div className="absolute top-4 left-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-primary/15 rounded-full blur-3xl opacity-70 animate-pulse" />
        <div className="absolute top-20 right-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-rose-500/10 rounded-full blur-3xl opacity-60" />
      </div>

      {/* ── Hero Section ─────────────────────────────────────── */}
      <section className="relative z-10 text-center space-y-6 pt-6 sm:pt-10 px-2 sm:px-0 max-w-4xl mx-auto w-full flex flex-col items-center">
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/80 border border-border/60 text-xs font-semibold text-foreground shadow-xs animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Fast, Free & High Quality Media Downloader</span>
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground text-balance max-w-2xl mx-auto leading-tight sm:leading-tight">
            {heroRest}{" "}
            <span className="text-primary bg-gradient-to-r from-primary via-rose-500 to-amber-500 bg-clip-text text-transparent">
              {heroHighlight}
            </span>
          </h1>
          <p className="text-xs sm:text-base text-muted-foreground max-w-lg mx-auto text-balance leading-relaxed">
            {siteConfig.heroSubtitle}
          </p>
        </div>

        {/* Search Box - Centered Prominently */}
        <div className="w-full max-w-xl mx-auto pt-2">
          <div className="bg-card/90 backdrop-blur-xl p-4 sm:p-6 rounded-[24px] border border-border/80 card-shadow space-y-4 text-left relative group hover:border-primary/40 transition-colors">
            <UrlInput
              value={url}
              onChange={setUrl}
              onSubmit={() => handleExtract()}
              isLoading={false}
              placeholder="Paste video, audio, or post URL here..."
            />

            {/* Quick Link Chips */}
            <div className="pt-1 border-t border-border/40 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground mr-1">Quick Try:</span>
              {SAMPLE_URLS.map((sample) => (
                <button
                  key={sample.label}
                  onClick={() => {
                    setUrl(sample.url);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/70 hover:bg-secondary text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <i className={sample.icon} style={{ color: sample.color }} />
                  {sample.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Highlights Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-2 text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> No Registration
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" /> High-Speed Downloads
          </span>
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-blue-500 shrink-0" /> Safe & Private
          </span>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto w-full px-2 sm:px-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-card/60 backdrop-blur-md p-4 sm:p-5 rounded-[22px] border border-border/50 card-shadow text-center">
          <div className="space-y-0.5">
            <p className="text-xl sm:text-2xl font-extrabold text-foreground">100+</p>
            <p className="text-xs text-muted-foreground font-medium">Platforms Supported</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xl sm:text-2xl font-extrabold text-primary">4K HDR</p>
            <p className="text-xs text-muted-foreground font-medium">Max Media Quality</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xl sm:text-2xl font-extrabold text-foreground">100%</p>
            <p className="text-xs text-muted-foreground font-medium">Free & Unlimited</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-500">0 Ads</p>
            <p className="text-xs text-muted-foreground font-medium">Clean Experience</p>
          </div>
        </div>
      </section>

      {/* ── Platform Slider (Infinite Marquee) ───────────────── */}
      <section className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="text-center mb-3">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Supported Platforms
          </span>
        </div>
        <div className="relative overflow-hidden py-1">
          {/* Fade edges */}
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          {/* Marquee track */}
          <div className="marquee-track">
            {[...PLATFORMS, ...PLATFORMS].map((p, i) => (
              <div
                key={`${p.id}-${i}`}
                className="flex items-center gap-2 px-3 py-1.5 shrink-0 opacity-80 hover:opacity-100 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shadow-xs">
                  <i className={`${p.icon} text-base`} style={{ color: p.accent }} title={p.label} />
                </div>
                <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">{p.label}</span>
                <span className="w-px h-4 bg-border mx-1 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works (3 Easy Steps) ──────────────────────── */}
      <section className="relative z-10 space-y-6 max-w-4xl mx-auto w-full px-2 sm:px-0">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">How It Works</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Download media in 3 simple steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-[20px] p-5 border border-border/60 card-shadow space-y-3 relative overflow-hidden group hover:border-primary/40 transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-extrabold flex items-center justify-center">
              01
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base flex items-center gap-2">
                <FileVideo className="w-4 h-4 text-primary" /> Copy Media URL
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Copy the link of any video, audio track, or post from your favorite app or platform.
              </p>
            </div>
          </div>

          <div className="bg-card rounded-[20px] p-5 border border-border/60 card-shadow space-y-3 relative overflow-hidden group hover:border-primary/40 transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-extrabold flex items-center justify-center">
              02
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Music2 className="w-4 h-4 text-primary" /> Paste & Analyze
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Paste the URL into the search box above and hit analyze to fetch available formats.
              </p>
            </div>
          </div>

          <div className="bg-card rounded-[20px] p-5 border border-border/60 card-shadow space-y-3 relative overflow-hidden group hover:border-primary/40 transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-extrabold flex items-center justify-center">
              03
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Download className="w-4 h-4 text-primary" /> Instant Download
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Choose your preferred quality (MP4, MP3, 4K) and download directly to your device.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Recent Downloads ─────────────────────────────────── */}
      {recent.length > 0 && (
        <section className="relative z-10 space-y-4 max-w-4xl mx-auto w-full px-2 sm:px-0">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Recent Downloads
            </h2>
            <Link href="/history" className="text-xs text-primary hover:underline font-semibold flex items-center gap-1">
              View history <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-card rounded-[20px] p-2 border border-border/60 card-shadow flex flex-col gap-1.5">
            {recent.map((entry) => {
              const platform = detectPlatform(entry.url);
              return (
                <Link key={entry.id} href={`/download?url=${encodeURIComponent(entry.url)}`}>
                  <div className="rounded-[14px] bg-secondary/50 p-3 flex items-center gap-3 hover:bg-secondary transition-colors cursor-pointer group">
                    <div className="w-[42px] h-[42px] rounded-[10px] bg-muted overflow-hidden shrink-0">
                      {entry.metadata.thumbnail ? (
                        <img src={entry.metadata.thumbnail} alt="" className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-card">
                          <i className={platform?.icon} style={{ color: platform?.accent }} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors">
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

      {/* ── Feature Cards ────────────────────────────────────── */}
      <section className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto w-full px-2 sm:px-0">
        <Card className="bg-card rounded-[20px] border border-border/60 card-shadow">
          <CardContent className="p-6 space-y-3">
            <div className="w-11 h-11 rounded-[14px] bg-primary/10 text-primary flex items-center justify-center mb-1">
              <FastForward className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Blazing Fast Speed</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Direct extraction from high-speed edge nodes with maximum bandwidth utilization.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card rounded-[20px] border border-border/60 card-shadow">
          <CardContent className="p-6 space-y-3">
            <div className="w-11 h-11 rounded-[14px] bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-1">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Best Quality Streams</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Extract up to 4K 60fps video and 320kbps audio without compression loss.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card rounded-[20px] border border-border/60 card-shadow">
          <CardContent className="p-6 space-y-3">
            <div className="w-11 h-11 rounded-[14px] bg-blue-500/10 text-blue-500 flex items-center justify-center mb-1">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Private & Secure</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              No tracking, no popups, and no account required. Your downloads stay private.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* ── FAQ Section ──────────────────────────────────────── */}
      <section className="relative z-10 space-y-5 max-w-4xl mx-auto w-full px-2 sm:px-0">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold">Frequently Asked Questions</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Everything you need to know about {siteConfig.siteName}</p>
        </div>
        <div className="bg-card rounded-[22px] p-3 sm:p-4 border border-border/60 card-shadow flex flex-col gap-2">
          {[
            {
              q: `Is ${siteConfig.siteName} completely free?`,
              a: `Yes, ${siteConfig.siteName} is 100% free with unlimited downloads and no hidden subscription fees.`,
            },
            {
              q: "What video and audio formats are supported?",
              a: "We support MP4, WEBM, MP3, M4A, 3GP, and high-resolution thumbnail images across supported platforms.",
            },
            {
              q: "Does it work on mobile devices?",
              a: "Yes! Saveclp is fully optimized for iOS, Android, tablets, and desktop browsers without requiring app installation.",
            },
            {
              q: "Where are downloaded files saved?",
              a: "Files are saved directly to your browser's default Downloads folder or device storage.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="p-4 rounded-[16px] bg-secondary/40 border border-border/30">
              <h4 className="font-bold mb-1 text-sm sm:text-base text-foreground">{q}</h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
