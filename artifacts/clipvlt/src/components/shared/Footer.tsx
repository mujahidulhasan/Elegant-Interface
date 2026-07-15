import { siteConfig } from "@/lib/siteConfig";

export function Footer() {
  return (
    <footer className="w-full border-t bg-muted/20 py-8 mt-auto">
      <div className="container mx-auto max-w-5xl px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center md:items-start">
          <span className="font-semibold">{siteConfig.siteName}</span>
          <span className="text-xs text-muted-foreground">{siteConfig.tagline}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {siteConfig.footerText}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {Object.entries(siteConfig.socials).map(([key, url]) => (
            url ? (
              <a key={key} href={url} target="_blank" rel="noreferrer" className="hover:text-foreground capitalize">
                {key}
              </a>
            ) : null
          ))}
          <a href={`mailto:${siteConfig.supportEmail}`} className="hover:text-foreground">Support</a>
        </div>
      </div>
    </footer>
  );
}
