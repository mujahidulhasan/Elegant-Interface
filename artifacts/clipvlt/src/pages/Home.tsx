import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { getPlatforms, HealthResponse, PlatformsResponse } from "@/lib/api";
import { UrlInput } from "@/components/shared/UrlInput";
import { siteConfig } from "@/lib/siteConfig";
import { useHistory } from "@/hooks/useHistory";
import { detectPlatform, PLATFORMS } from "@/lib/platforms";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Download, FastForward, Shield, Zap } from "lucide-react";

export function Home() {
  const [, setLocation] = useLocation();
  const [url, setUrl] = useState("");
  const { entries } = useHistory();
  const [platformData, setPlatformData] = useState<PlatformsResponse | null>(null);

  useEffect(() => {
    getPlatforms().then(setPlatformData).catch(() => {});
  }, []);

  const handleExtract = () => {
    // Navigate to /video with the URL as a param? The backend doesn't support query params here, 
    // but we can pass it through a global state or just route to /video and let user paste again.
    // Actually, let's encode it in the URL so /video can read it: `/video?url=...`
    // Wouter doesn't have a built-in hook for query strings easily, so we just use window.location
    window.location.href = `/video?url=${encodeURIComponent(url)}`;
  };

  const recent = entries.slice(0, 3);

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
          <Zap className="w-3 h-3" /> Universal Downloader
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
          Download media from <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">anywhere.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
          {siteConfig.tagline}. High quality, no watermarks, completely free.
        </p>
        
        <div className="max-w-2xl mx-auto w-full pt-4">
          <UrlInput 
            value={url} 
            onChange={setUrl} 
            onSubmit={handleExtract} 
            isLoading={false}
            className="shadow-xl shadow-primary/5"
          />
        </div>

        {platformData && (
          <p className="text-xs text-muted-foreground font-medium pt-2">
            Supporting {platformData.count > 0 ? `${platformData.count}+` : "dozens of"} platforms
          </p>
        )}
      </section>

      {/* Platform Slider */}
      <section className="w-full overflow-hidden relative py-6 opacity-80">
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />
        <div className="flex w-[200%] animate-shimmer" style={{ animation: "shimmer 30s linear infinite" }}>
          {[...PLATFORMS, ...PLATFORMS].map((p, i) => (
            <div key={`${p.id}-${i}`} className="flex items-center justify-center min-w-[120px] opacity-50 hover:opacity-100 transition-opacity">
              <i className={`${p.icon} text-3xl`} style={{ color: p.accent }} title={p.label} />
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-muted">
          <CardContent className="pt-6 space-y-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
              <FastForward className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg">Blazing Fast</h3>
            <p className="text-sm text-muted-foreground">Direct extraction from edge servers, downloading at your maximum connection speed.</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-muted">
          <CardContent className="pt-6 space-y-2">
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg">Best Quality</h3>
            <p className="text-sm text-muted-foreground">Up to 4K HDR video and 320kbps audio. We automatically merge the best streams.</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-muted">
          <CardContent className="pt-6 space-y-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg">No Nonsense</h3>
            <p className="text-sm text-muted-foreground">No popups, no fake download buttons, no tracking. Just the file you requested.</p>
          </CardContent>
        </Card>
      </section>

      {/* Recent Downloads */}
      {recent.length > 0 && (
        <section className="space-y-4 pt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" /> Recent Downloads
            </h2>
            <Link href="/history" className="text-sm text-primary hover:underline font-medium">View all</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recent.map((entry) => {
              const platform = detectPlatform(entry.url);
              return (
                <Link key={entry.id} href={`/video?url=${encodeURIComponent(entry.url)}`}>
                  <div className="rounded-xl border bg-card p-3 flex items-center gap-3 hover:border-primary/50 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded bg-muted overflow-hidden shrink-0 relative">
                      {entry.metadata.thumbnail ? (
                        <img src={entry.metadata.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <i className={platform?.icon} style={{ color: platform?.accent }} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {entry.metadata.title || entry.url}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
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
      
      {/* FAQ */}
      <section className="space-y-6 pt-12 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border bg-card/50">
            <h4 className="font-semibold mb-1">Is this tool free?</h4>
            <p className="text-sm text-muted-foreground">Yes, Clipvlt is completely free to use with no limits on downloads.</p>
          </div>
          <div className="p-4 rounded-lg border bg-card/50">
            <h4 className="font-semibold mb-1">What platforms are supported?</h4>
            <p className="text-sm text-muted-foreground">We support almost every major social and media platform including X, TikTok, Instagram, Reddit, Vimeo, Soundcloud, and hundreds more.</p>
          </div>
          <div className="p-4 rounded-lg border bg-card/50">
            <h4 className="font-semibold mb-1">Where do the files go?</h4>
            <p className="text-sm text-muted-foreground">Files are downloaded directly to your device's default Downloads folder.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
