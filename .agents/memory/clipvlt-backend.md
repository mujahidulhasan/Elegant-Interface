---
name: Clipvlt external download backend
description: Contract and constraints for the external yt-dlp backend used by the Clipvlt media downloader app.
---

Clipvlt's frontend (artifacts/clipvlt) talks directly to an external FastAPI service at
`https://ohyah-ytback.hf.space` — it is NOT part of this monorepo's `artifacts/api-server`.
Do not add routes there or write an OpenAPI spec/codegen for this; the client is a
hand-written typed fetch wrapper at `artifacts/clipvlt/src/lib/api.ts`.

**Why:** the backend is owned/hosted by the user outside the workspace, so there is no
spec to codegen from and no reason to proxy through our own server.

**How to apply:** if asked to add downloader features, extend `src/lib/api.ts` to match
that service's actual OpenAPI schema (fetch `https://ohyah-ytback.hf.space/openapi.json`
to check for new/changed endpoints before assuming a shape). Known constraints on that
backend: no history/database endpoints (history is client-side localStorage only, see
`useHistory`), and no clip/timestamp-trim parameters on `/api/download` (the `/timestamp`
page must say so rather than faking trimming).
