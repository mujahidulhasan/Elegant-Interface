// Central site configuration. Never hardcode branding elsewhere -- import from here.
// Swap values here (or wire this up to a remote settings.js later) to rebrand the app.

export const siteConfig = {
  siteName: "Clipvlt",
  shortName: "CV",
  tagline: "Download video, audio & thumbnails from any link",
  logo: "/site/logo.png",
  favicon: "/site/favicon.png",

  primaryColor: "#6C5CE7",
  accentColor: "#00D2D3",

  footerText: `(c) ${new Date().getFullYear()} Clipvlt. All rights reserved.`,
  supportEmail: "support@clipvlt.app",

  socials: {
    discord: "",
    telegram: "",
    github: "",
  },

  features: {
    playlist: true,
    timestamp: true,
    thumbnail: true,
    nsfw: true,
    bulk: true,
    history: true,
  },
} as const;

export type SiteConfig = typeof siteConfig;
