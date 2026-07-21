// Site configuration — reads from window.__SITE_SETTINGS__ (populated by /site/settings.js)
// with hardcoded defaults as fallback. Edit /public/site/settings.js to change branding
// without a code rebuild.

export type LogoMode = "logo+text" | "logo-only" | "text-only";
export type BackgroundType = "none" | "video";
export type DefaultTheme = "system" | "light" | "dark";

export interface SiteFeatures {
  history: boolean;
  bulk: boolean;
  nsfw: boolean;
  settings: boolean;
  developer: boolean;
  toast: boolean;
  animations: boolean;
  adultPlatforms: boolean;
}

export interface SiteSettings {
  // Identity
  siteName: string;
  shortName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  description: string;
  websiteUrl: string;
  // Branding
  logoMode: LogoMode;
  logo: string;
  favicon: string;
  // Colors
  primaryColor: string;
  accentColor: string;
  // Background
  backgroundType: BackgroundType;
  // Theme
  defaultTheme: DefaultTheme;
  // Footer
  copyright: string;
  footerText: string;
  supportEmail: string;
  contactEmail: string;
  // Social
  socials: Record<string, string>;
  // Features
  features: SiteFeatures;
}

const DEFAULTS: SiteSettings = {
  siteName:     "Clipvlt",
  shortName:    "CV",
  tagline:      "Download media from anywhere",
  heroTitle:    "Download media from anywhere.",
  heroSubtitle: "High quality, no watermarks, completely free.",
  description:  "Download video, audio, and thumbnails from dozens of platforms.",
  websiteUrl:   "",
  logoMode:     "logo+text",
  logo:         "/site/logo.png",
  favicon:      "/site/favicon.png",
  primaryColor: "#D23535",
  accentColor:  "#FF3E3E",
  backgroundType: "none",
  defaultTheme: "system",
  copyright:    "© 2025 Clipvlt",
  footerText:   "For personal use only. Respect copyright laws.",
  supportEmail: "support@clipvlt.app",
  contactEmail: "",
  socials:      { twitter: "", github: "" },
  features: {
    history:        true,
    bulk:           true,
    nsfw:           true,
    settings:       true,
    developer:      false,
    toast:          true,
    animations:     true,
    adultPlatforms: false,
  },
};

function loadSettings(): SiteSettings {
  try {
    const raw = (window as any).__SITE_SETTINGS__;
    if (!raw || typeof raw !== "object") return DEFAULTS;
    const f = raw.features ?? {};
    return {
      siteName:       raw.siteName       ?? DEFAULTS.siteName,
      shortName:      raw.shortName      ?? DEFAULTS.shortName,
      tagline:        raw.tagline        ?? DEFAULTS.tagline,
      heroTitle:      raw.heroTitle      ?? DEFAULTS.heroTitle,
      heroSubtitle:   raw.heroSubtitle   ?? DEFAULTS.heroSubtitle,
      description:    raw.description    ?? DEFAULTS.description,
      websiteUrl:     raw.websiteUrl     ?? DEFAULTS.websiteUrl,
      logoMode:       raw.logoMode       ?? DEFAULTS.logoMode,
      logo:           raw.logo           ?? DEFAULTS.logo,
      favicon:        raw.favicon        ?? DEFAULTS.favicon,
      primaryColor:   raw.primaryColor   ?? DEFAULTS.primaryColor,
      accentColor:    raw.accentColor    ?? DEFAULTS.accentColor,
      backgroundType: raw.backgroundType ?? DEFAULTS.backgroundType,
      defaultTheme:   raw.defaultTheme   ?? DEFAULTS.defaultTheme,
      copyright:      raw.copyright      ?? DEFAULTS.copyright,
      footerText:     raw.footerText     ?? DEFAULTS.footerText,
      supportEmail:   raw.supportEmail   ?? DEFAULTS.supportEmail,
      contactEmail:   raw.contactEmail   ?? DEFAULTS.contactEmail,
      socials:        raw.socials        ?? DEFAULTS.socials,
      features: {
        history:        f.history        ?? DEFAULTS.features.history,
        bulk:           f.bulk           ?? DEFAULTS.features.bulk,
        nsfw:           f.nsfw           ?? DEFAULTS.features.nsfw,
        settings:       f.settings       ?? DEFAULTS.features.settings,
        developer:      f.developer      ?? DEFAULTS.features.developer,
        toast:          f.toast          ?? DEFAULTS.features.toast,
        animations:     f.animations     ?? DEFAULTS.features.animations,
        adultPlatforms: f.adultPlatforms ?? DEFAULTS.features.adultPlatforms,
      },
    };
  } catch {
    return DEFAULTS;
  }
}

export const siteConfig = loadSettings();
