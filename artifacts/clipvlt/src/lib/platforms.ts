// Client-side platform detection from a pasted URL. Cosmetic only (icon + accent
// color) -- the backend does its own platform resolution when extracting metadata.

export interface PlatformDef {
  id: string;
  label: string;
  icon: string; // Font Awesome brand icon class, e.g. "fa-brands fa-tiktok"
  accent: string; // hex color used for accent theming when this platform is detected
  hosts: string[];
}

export const PLATFORMS: PlatformDef[] = [
  { id: "facebook", label: "Facebook", icon: "fa-brands fa-facebook", accent: "#1877F2", hosts: ["facebook.com", "fb.watch"] },
  { id: "instagram", label: "Instagram", icon: "fa-brands fa-instagram", accent: "#E1306C", hosts: ["instagram.com"] },
  { id: "tiktok", label: "TikTok", icon: "fa-brands fa-tiktok", accent: "#25F4EE", hosts: ["tiktok.com"] },
  { id: "twitter", label: "X / Twitter", icon: "fa-brands fa-x-twitter", accent: "#0F1419", hosts: ["twitter.com", "x.com"] },
  { id: "pinterest", label: "Pinterest", icon: "fa-brands fa-pinterest", accent: "#E60023", hosts: ["pinterest.com", "pin.it"] },
  { id: "reddit", label: "Reddit", icon: "fa-brands fa-reddit", accent: "#FF4500", hosts: ["reddit.com", "redd.it"] },
  { id: "threads", label: "Threads", icon: "fa-brands fa-threads", accent: "#000000", hosts: ["threads.net"] },
  { id: "snapchat", label: "Snapchat", icon: "fa-brands fa-snapchat", accent: "#FFFC00", hosts: ["snapchat.com"] },
  { id: "vimeo", label: "Vimeo", icon: "fa-brands fa-vimeo", accent: "#1AB7EA", hosts: ["vimeo.com"] },
  { id: "dailymotion", label: "Dailymotion", icon: "fa-solid fa-clapperboard", accent: "#0D68F0", hosts: ["dailymotion.com"] },
  { id: "bilibili", label: "Bilibili", icon: "fa-brands fa-bilibili", accent: "#00A1D6", hosts: ["bilibili.com"] },
  { id: "soundcloud", label: "SoundCloud", icon: "fa-brands fa-soundcloud", accent: "#FF5500", hosts: ["soundcloud.com"] },
  { id: "bandcamp", label: "Bandcamp", icon: "fa-brands fa-bandcamp", accent: "#1DA0C3", hosts: ["bandcamp.com"] },
  { id: "kick", label: "Kick", icon: "fa-solid fa-tv", accent: "#53FC18", hosts: ["kick.com"] },
  { id: "twitch", label: "Twitch", icon: "fa-brands fa-twitch", accent: "#9146FF", hosts: ["twitch.tv"] },
  { id: "linkedin", label: "LinkedIn", icon: "fa-brands fa-linkedin", accent: "#0A66C2", hosts: ["linkedin.com"] },
  { id: "telegram", label: "Telegram", icon: "fa-brands fa-telegram", accent: "#26A5E4", hosts: ["t.me", "telegram.org"] },
  { id: "vk", label: "VK", icon: "fa-brands fa-vk", accent: "#0077FF", hosts: ["vk.com"] },
  { id: "tumblr", label: "Tumblr", icon: "fa-brands fa-tumblr", accent: "#36465D", hosts: ["tumblr.com"] },
];

export const DEFAULT_PLATFORM: PlatformDef = {
  id: "generic",
  label: "Media link",
  icon: "fa-solid fa-link",
  accent: "#6C5CE7",
  hosts: [],
};

export function detectPlatform(rawUrl: string): PlatformDef | null {
  if (!rawUrl.trim()) return null;
  let host = "";
  try {
    host = new URL(rawUrl).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
  const match = PLATFORMS.find((p) => p.hosts.some((h) => host === h || host.endsWith(`.${h}`)));
  return match ?? DEFAULT_PLATFORM;
}

export function isLikelyUrl(value: string): boolean {
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
