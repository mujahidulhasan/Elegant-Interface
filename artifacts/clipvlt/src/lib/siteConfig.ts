// Site configuration — reads from window.__SITE_SETTINGS__ (populated by /site/settings.js)
// with hardcoded defaults as fallback. Edit /public/site/settings.js to change branding
// without a code rebuild.

interface SiteSettings {
  siteName: string;
  shortName: string;
  tagline: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  accentColor: string;
  background: string | null;
  footerText: string;
  supportEmail: string;
  socials: Record<string, string>;
  features: {
    history: boolean;
    bulk: boolean;
  };
}

const DEFAULTS: SiteSettings = {
  siteName: "Clipvlt",
  shortName: "CV",
  tagline: "Download media from anywhere",
  logo: "/site/logo.png",
  favicon: "/site/favicon.png",
  primaryColor: "#D23535",
  accentColor: "#FF3E3E",
  background: null,
  footerText: "© 2025 Clipvlt. For personal use only. Respect copyright laws.",
  supportEmail: "support@clipvlt.app",
  socials: { twitter: "", github: "" },
  features: {
    history: true,
    bulk: true,
  },
};

function loadSettings(): SiteSettings {
  try {
    const raw = (window as any).__SITE_SETTINGS__;
    if (!raw || typeof raw !== "object") return DEFAULTS;
    return {
      siteName: raw.siteName ?? DEFAULTS.siteName,
      shortName: raw.shortName ?? DEFAULTS.shortName,
      tagline: raw.tagline ?? DEFAULTS.tagline,
      logo: raw.logo ?? DEFAULTS.logo,
      favicon: raw.favicon ?? DEFAULTS.favicon,
      primaryColor: raw.primaryColor ?? DEFAULTS.primaryColor,
      accentColor: raw.accentColor ?? DEFAULTS.accentColor,
      background: raw.background ?? DEFAULTS.background,
      footerText: raw.footerText ?? DEFAULTS.footerText,
      supportEmail: raw.supportEmail ?? DEFAULTS.supportEmail,
      socials: raw.socials ?? DEFAULTS.socials,
      features: {
        history: raw.features?.history ?? DEFAULTS.features.history,
        bulk: raw.features?.bulk ?? DEFAULTS.features.bulk,
      },
    };
  } catch {
    return DEFAULTS;
  }
}

export const siteConfig = loadSettings();
