import { useState } from "react";
import { Link } from "wouter";
import { siteConfig } from "@/lib/siteConfig";
import { Download } from "lucide-react";

function FooterLogo() {
  const [logoError, setLogoError] = useState(false);
  const mode = siteConfig.logoMode;
  const showImage = mode === "logo-only" || mode === "logo+text";
  const showText  = mode === "text-only"  || mode === "logo+text";

  return (
    <div className="flex items-center gap-2">
      {showImage && !logoError && (
        <img
          src={siteConfig.logo}
          alt={siteConfig.siteName}
          className="w-6 h-6 rounded-[6px] object-cover"
          onError={() => setLogoError(true)}
        />
      )}
      {showImage && logoError && (
        <div className="w-6 h-6 rounded-[6px] bg-primary flex items-center justify-center text-primary-foreground">
          <Download className="w-3.5 h-3.5" />
        </div>
      )}
      {showText && (
        <span className="font-semibold text-sm">{siteConfig.siteName}</span>
      )}
    </div>
  );
}

export function Footer() {
  const activeSocials = Object.entries(siteConfig.socials).filter(([, url]) => !!url);

  return (
    <footer className="w-full border-t border-border/60 bg-background/60 backdrop-blur-sm mt-auto">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">

          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-1">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <FooterLogo />
            </Link>
            <p className="text-xs text-muted-foreground">{siteConfig.tagline}</p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {siteConfig.features.history && (
              <Link href="/history" className="hover:text-foreground transition-colors">History</Link>
            )}
            {siteConfig.features.bulk && (
              <Link href="/bulk" className="hover:text-foreground transition-colors">Bulk</Link>
            )}
            {siteConfig.features.settings && (
              <Link href="/settings" className="hover:text-foreground transition-colors">Settings</Link>
            )}
            {siteConfig.features.developer && (
              <Link href="/developer" className="hover:text-foreground transition-colors">Developer</Link>
            )}
            {activeSocials.map(([key, url]) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground capitalize transition-colors"
              >
                {key}
              </a>
            ))}
            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="hover:text-foreground transition-colors"
            >
              Support
            </a>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-6 pt-5 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>{siteConfig.copyright}</span>
          <span>{siteConfig.footerText}</span>
        </div>
      </div>
    </footer>
  );
}
