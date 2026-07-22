// Clipvlt Site Settings
// Edit this file to update branding, features, and appearance without rebuilding.
// Drop logo.png, favicon.png, bg.mp4, and developer.png next to this file to enable custom assets.
window.__SITE_SETTINGS__ = {
  // ── Identity ──────────────────────────────────────────────
  siteName:     "Saveclp",
  shortName:    "Sc",
  tagline:      "Download media from anywhere",
  heroTitle:    "Download media from anywhere.",
  heroSubtitle: "High quality, no watermarks, completely free.",
  description:  "Saveclp lets you download video, audio, and thumbnails from dozens of platforms — fast, clean, and free.",
  websiteUrl:   "https://saveclp.vercel.app",

  // ── Branding ──────────────────────────────────────────────
  // logoMode: "logo+text" | "logo-only" | "text-only"
  logoMode:     "logo+text",
  logo:         "/site/logo.png",
  favicon:      "/site/favicon.png",

  // ── Colors ────────────────────────────────────────────────
  primaryColor: "#D23535",
  accentColor:  "#FF3E3E",

  // ── Background ────────────────────────────────────────────
  // backgroundType: "none" | "video"
  // If "video", place bg.mp4 in /public/site/
  backgroundType: "none",

  // ── Theme ─────────────────────────────────────────────────
  // defaultTheme: "system" | "light" | "dark"
  defaultTheme: "system",

  // ── Footer ────────────────────────────────────────────────
  copyright:    "© 2025 Clipvlt",
  footerText:   "For personal use only. Respect copyright laws.",
  supportEmail: "support@clipvlt.app",
  contactEmail: "contact@clipvlt.app",

  // ── Social links (empty string = hidden) ──────────────────
  socials: {
    twitter:  "",
    github:   "",
    discord:  "",
    telegram: ""
  },

  // ── Features ──────────────────────────────────────────────
  features: {
    history:        true,   // download history page
    bulk:           true,   // bulk downloader page
    nsfw:           true,   // adult content gate
    settings:       true,   // user settings page
    developer:      false,  // developer info page (set developer.json too)
    toast:          true,   // in-app toast notifications
    animations:     true,   // ambient animations (aurora, particles)
    adultPlatforms: false   // show adult platforms slider on home page
  }
};
