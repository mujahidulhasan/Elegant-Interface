import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { getPlatforms, HealthResponse, PlatformsResponse } from "@/lib/api";
import { UrlInput } from "@/components/shared/UrlInput";
import { siteConfig } from "@/lib/siteConfig";
import { useHistory } from "@/hooks/useHistory";
import { detectPlatform, PLATFORMS } from "@/lib/platforms";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Download, FastForward, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Home() {
  const [, setLocation] = useLocation();
  const [url, setUrl] = useState("");
  const { entries } = useHistory();
  const [platformData, setPlatformData] = useState<PlatformsResponse | null>(null);

  useEffect(() => {
    getPlatforms().then(setPlatformData).catch(() => {});
  }, []);

  const handleExtract = () => {
    window.location.href = `/video?url=${encodeURIComponent(url)}`;
  };

  const recent = entries.slice(0, 3);

  return (
    <div className="flex flex-col gap-10 pb-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-[40px] leading-[1.1] md:text-6xl font-bold tracking-tight text-balance text-foreground">
          Download media from <span className="text-primary">anywhere.</span>
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

      {/* Platform Chips Slider */}
      <section className="w-full max-w-3xl mx-auto overflow-hidden relative">
        <div className="text-center mb-4">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Supported Platforms</span>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          <div className="flex w-max animate-shimmer" style={{ animation: "shimmer 30s linear infinite" }}>
            {[...PLATFORMS, ...PLATFORMS].map((p, i) => (
              <div key={`${p.id}-${i}`} className="flex items-center">
                <div className="flex items-center gap-2 px-3 py-1.5 shrink-0 opacity-80 hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <i className={`${p.icon} text-lg`} style={{ color: p.accent }} title={p.label} />
                  </div>
                  <span className="text-sm font-medium">{p.label}</span>
                </div>
                {i < [...PLATFORMS, ...PLATFORMS].length - 1 && (
                  <div className="w-px h-6 bg-border mx-1 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Downloads */}
      {recent.length > 0 && (
        <section className="space-y-4 pt-4 max-w-3xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" /> Recent Downloads
            </h2>
            <Link href="/history" className="text-sm text-info hover:underline font-semibold">View all</Link>
          </div>
          <div className="bg-card rounded-[32px] p-2 card-shadow flex flex-col gap-2">
            {recent.map((entry) => {
              const platform = detectPlatform(entry.url);
              return (
                <Link key={entry.id} href={`/video?url=${encodeURIComponent(entry.url)}`}>
                  <div className="rounded-[20px] bg-secondary/50 p-3 flex items-center gap-4 hover:bg-secondary transition-colors cursor-pointer group">
                    <div className="w-[46px] h-[46px] rounded-[10px] bg-muted overflow-hidden shrink-0 relative">
                      {entry.metadata.thumbnail ? (
                        <img src={entry.metadata.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-card">
                          <i className={platform?.icon} style={{ color: platform?.accent }} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-semibold truncate transition-colors text-foreground">
                        {entry.metadata.title || entry.url}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <i className={platform?.icon} style={{ color: platform?.accent }} /> {platform?.label} • {entry.resolution || entry.kind}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 max-w-4xl mx-auto">
        <Card className="bg-card rounded-[32px] border-none card-shadow">
          <CardContent className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-[14px] bg-primary/10 text-primary flex items-center justify-center mb-2">
              <FastForward className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">Blazing Fast</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Direct extraction from edge servers, downloading at your maximum connection speed.</p>
          </CardContent>
        </Card>
        <Card className="bg-card rounded-[32px] border-none card-shadow">
          <CardContent className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-[14px] bg-info/10 text-info flex items-center justify-center mb-2">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">Best Quality</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Up to 4K HDR video and 320kbps audio. We automatically merge the best streams.</p>
          </CardContent>
        </Card>
        <Card className="bg-card rounded-[32px] border-none card-shadow">
          <CardContent className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-[14px] bg-accent/10 text-accent flex items-center justify-center mb-2">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">No Nonsense</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">No popups, no fake download buttons, no tracking. Just the file you requested.</p>
          </CardContent>
        </Card>
      </section>
      
      {/* FAQ */}
      <section className="space-y-6 pt-8 max-w-3xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-center">Frequently Asked Questions</h2>
        <div className="bg-card rounded-[32px] p-3 card-shadow flex flex-col gap-2">
          <div className="p-4 rounded-[20px] bg-secondary/50">
            <h4 className="font-bold mb-1.5 text-[15px]">Is this tool free?</h4>
            <p className="text-sm text-muted-foreground">Yes, Clipvlt is completely free to use with no limits on downloads.</p>
          </div>
          <div className="p-4 rounded-[20px] bg-secondary/50">
            <h4 className="font-bold mb-1.5 text-[15px]">What platforms are supported?</h4>
            <p className="text-sm text-muted-foreground">We support almost every major social and media platform including X, TikTok, Instagram, Reddit, Vimeo, Soundcloud, and hundreds more.</p>
          </div>
          <div className="p-4 rounded-[20px] bg-secondary/50">
            <h4 className="font-bold mb-1.5 text-[15px]">Where do the files go?</h4>
            <p className="text-sm text-muted-foreground">Files are downloaded directly to your device's default Downloads folder.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
