---
name: Clipvlt Phase 2 architecture decisions
description: Key decisions made during the premium SaaS overhaul of the Clipvlt frontend — what was removed, merged, and why.
---

## Removed features (and why)
- **Playlist page** (`/playlist`, `Playlist.tsx`) — deleted; backend does not support it reliably.
- **Timestamp/Clipper page** (`/timestamp`, `Timestamp.tsx`) — deleted; it silently downloaded the full video while showing fake time-range inputs, violating the "no fake functionality" rule.
- **NSFW standalone route** (`/nsfw`, `Nsfw.tsx`) — deleted; replaced with automatic inline content gate on the unified Downloader page triggered by `isAdultUrl()` heuristic.
- **DownloadQueue floating widget** (`DownloadQueue.tsx`) — deleted; replaced with per-download inline progress in `DownloadAction.tsx`.

**Why:** Every removed feature was either non-functional or misleading. The principle: if a visible feature cannot actually work, remove it rather than show it.

## Page unification
- `/video` and `/thumbnail` merged into `/download` (new `Downloader.tsx`) with Video/Audio/Thumbnail tabs.
- `/video?url=...` redirected to `/download?url=...` via wouter route function calling `window.location.replace`.
- Nav links: only **Download**, **Bulk**, **History**. All playlist/timestamp/nsfw/18+ nav entries gone.

## Download UX (inline, no queue UI)
- `DownloadAction.tsx` is a reusable component: accepts url/kind/formatId/label, calls `enqueue()` (which returns real `job_id`), tracks job state via `jobs` array, auto-triggers browser download via hidden `<a>.click()` exactly once per completed job (guarded by a `useRef<Set<string>>`), fires toasts via `useToast`.
- `useDownloadQueue.enqueue()` already returned `res.job_id` — no changes needed to the hook.

## FormatSelector
- Receives `mode: "video" | "audio"` prop; filters `formats[]` accordingly.
- Default (collapsed) view: one representative per quality badge bucket (4K/FHD/HD/SD/Audio) built from real backend `FormatInfo.resolution` field, top pick marked "Recommended."
- "Show all formats (N)" expands to full raw table with codec column; N = real `formats.length`.
- Quality badges derived from `parseHeight(resolution)`: ≥2160→4K violet, ≥1080→FHD green, ≥720→HD blue, else SD gray; audio-only→orange.

## NSFW gate
- `isAdultUrl()` in `platforms.ts` checks hostname against a curated Set of adult domains.
- Gate is an overlay inside `Downloader.tsx`: blurs result area with CSS class `nsfw-blurred` (filter:blur(20px)), shows centered modal. Continue → sets `localStorage["clipvlt.nsfwAccepted"]="true"`, removes blur. Leave → resets to idle (no navigation).
- Backend data is already fetched before gate is checked; gate is purely cosmetic/UX.

## Dynamic site settings
- `/public/site/settings.js` sets `window.__SITE_SETTINGS__` before the React bundle loads.
- `siteConfig.ts` reads from that global with full fallback defaults — no build needed to change branding.
- Logo in Navbar has `onError` fallback to icon component (since no real logo.png binary exists).
- Layout reads `siteConfig.background`: if .mp4 → fixed `<video>` bg; if image → fixed cover div; if null → default aurora+mesh+particles layers.

## Radius scale
- New CSS token scale: `--radius-sm:16px` (buttons/inputs), `--radius-md:18px` (cards), `--radius-lg:20px` (containers).
- Components updated away from rounded-[32px]/rounded-full. Quality badges/small pills remain pill-shaped (intentional accent).

## Platform slider
- CSS `@keyframes marquee { to { transform: translateX(-50%) } }` on `.marquee-track`.
- Content is `[...PLATFORMS, ...PLATFORMS]` (2x list). At -50% translateX the loop is seamless.
- `.marquee-track:hover { animation-play-state: paused }` for pause-on-hover.

**Why:** These are all discoverable from code, but the _reasoning_ behind each deletion/merge decision is what code alone can't convey.
