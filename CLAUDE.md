# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Marketing site for **Genesis Kreations**, a Chennai media house (academy, digital marketing, production, studio, broadcasting). React 19 + TypeScript + Vite 8 SPA frontend, with a small self-hosted PHP CMS backend for visitor-editable content. Use **genesiskreationsmedia.com** as the source of truth for website copy/content.

## Commands

```bash
npm run dev        # Vite dev server (HTTP)
npm run dev:https  # Vite over self-signed cert + --host; needed to test phone
                   # sensor APIs (e.g. projector-screen deviceorientation tilt)
                   # on a real device over the LAN
npm run build      # tsc -b (typecheck) then vite build
npm run lint       # eslint .
npm run preview    # serve the production build locally
```

There is no test runner configured. `npm run build` is the gate — it typechecks the whole project before bundling.

## Deployment (important)

- Hosted on **Hostinger**, which **auto-deploys from GitHub `main`** and **builds on the server**. A push to `main` goes straight to production.
- **Never commit/push to `main` unless the user explicitly says to.**
- Because the server rebuilds on every push, the web root is wiped each deploy. The PHP backend therefore stores all runtime data **outside** the web root (see backend section) so uploads/content survive deploys.
- Hostinger runs **LiteSpeed**, which aggressively caches. The API guards against stale responses two ways: backend sends `no-store` + `X-LiteSpeed-Cache-Control: no-cache` headers, and the frontend appends a `?t=<timestamp>` cache-buster to every GET. Keep both when touching API code.

## Frontend architecture

- **Entry:** `src/main.tsx` → `BrowserRouter` → `HelmetProvider` → `App`. It also manages the static "app-shell splash" defined in `index.html`, fading it out on React's first paint for fast FCP on mobile.
- **Routing & scroll (`src/App.tsx`):** The trickiest file. Routes are in `src/pages/*`; all pages except `home` are `React.lazy` code-split. Smooth scrolling uses **Lenis**, set up in three distinct modes — read the comments before editing:
  - `home` and `gallery` mount their **own scoped Lenis** instances (home adds a `Snap` addon for slideshow-style section locking via `.snap-section` class).
  - Every other public page shares one **root Lenis**; an effect resets its scroll on route change and handles `#hash` anchors.
  - Lazy chunks mount after root Lenis measures the page, so a `MutationObserver` on `#root` re-measures (`lenis.resize()`) when chunks land. Admin pages use no Lenis.
- **`/admin`** (aliased `/gallery-admin`) renders without the nav/announcement banner; it's the CMS dashboard for all editable content.
- **Path alias:** `@/` → `src/` (configured in both `vite.config.ts` and `tsconfig`).
- **Components:** shadcn/ui (new-york style) in `src/components/ui/`, page sections in `src/components/sections/`, full pages in `src/pages/`. Tailwind CSS v4 (config lives in `src/index.css`, not a JS file). Use `cn()` from `@/lib/utils`. Animations via `framer-motion`; icons via `lucide-react`.
- **Theme:** brand tokens in `src/index.css` — `maroon` (#cb2957 crimson primary), `maroon-dark` (#000 / black), `cream` (#eeeeee), `tan`. Use these Tailwind color names rather than raw hex.
- **SEO:** per-page `<SEO>` component (`src/components/seo.tsx`, wraps react-helmet-async) sets title/description.

## Backend (PHP CMS)

**Source of truth is `public/api/`** — Vite copies `public/` into `dist/` on every build, so `dist/api/` is generated output (a local `npm run build` wipes and recreates it). **Always edit the PHP under `public/api/`, never `dist/api/`.** Deployed to the web root's `/api`. Pure PHP, no framework. Serves content types consumed by the frontend via `src/lib/cms-api.ts` (announcement, workshops, certification courses, home-course list, testimonials, projector images, page backgrounds) and `src/lib/gallery-api.ts` (gallery photos).

Content-collection endpoints follow a consistent five-file pattern (`_common.php` with seed-on-first-read + `list`/`save`/`delete`/`reorder.php`); see `public/api/testimonials/` or `public/api/courses/` for the template. Each frontend section keeps its current hardcoded content as a built-in fallback, and the matching `_common.php` seeds the same content on first read so `/admin` starts populated.

- **Config:** `public/api/config.php` is the single source of truth — admin password (`GC_ADMIN_PASSWORD`), allowed image types, max upload size, and `GC_PERSIST_DIR` (defaults to a `gc-data/` folder **above** the web root so deploys don't wipe it). Data is JSON files under `gc-data/data/`; uploads under `gc-data/uploads/`.
- **Shared helpers:** `public/api/_shared.php` — CORS, `json_out` (sets all the no-cache headers), `require_auth` (constant-time check of `X-Gallery-Password` header / `password` field), image validation + save with random-suffixed filenames, path-traversal-safe deletes.
- **Media serving:** uploads sit outside the web root, so they aren't directly reachable as static files — `public/api/media.php` streams them with a path-traversal guard and a 1-year immutable cache header. Image URLs returned by the API look like `/api/media.php?f=/<section>/<file>`.
- **Auth:** a single admin password gates all write endpoints. The frontend sends it as the `X-Gallery-Password` header (see `postForm` in `cms-api.ts`).
- **Dev against live API:** set `VITE_API_BASE` and/or `VITE_GALLERY_API` (e.g. `https://genesiskreationsmedia.com/api`) in a `.env` file. When the base is a full URL, the API clients absolutize the root-relative image URLs so `<img>` tags load from the live server.
