# Genesis Kreations admin / backend (Hostinger)

Site content that changes often — the announcement banner, workshops, gallery
photos, and the home-page projector images — is managed from a browser at
**`/admin`** and stored on the Hostinger server. None of it requires a rebuild
or redeploy to change.

## One login for everything

- Admin URL: `https://<your-domain>/admin` (the old `/gallery-admin` still works).
- Password: `GC_ADMIN_PASSWORD` in **`public/api/config.php`** — one secret for
  all tabs. Change it there before going live (currently `gcweb@2026`).

## Tabs

| Tab | What it does | Stored at |
| --- | --- | --- |
| Announcement | Edit banner text + button, toggle it on/off | `data/announcement.json` |
| Workshops | Add/edit/delete workshops, each with a banner image | `data/workshops.json` + `uploads/workshops/` |
| Gallery | Upload/delete the `/gallery` photos | `uploads/gallery/` |
| Projector | Upload/delete the home-page projector images | `uploads/projector/` |

All `data/` and `uploads/` folders are created automatically on first use and
live **outside the build**, so deploys never wipe them.

## Backend layout (`public/` → ships into `dist/` on build)

```
public/api/
  config.php          # password + shared settings (single source)
  _shared.php         # cors, auth, json store, image upload/list helpers
  announcement/get.php  save.php
  workshops/list.php    save.php   delete.php
  gallery/list.php      upload.php delete.php
  projector/list.php    upload.php delete.php
```

Frontend clients: `src/lib/cms-api.ts` (announcement, workshops, projector) and
`src/lib/gallery-api.ts` (gallery).

## How the front end uses it

- **Announcement banner** (`src/components/ui/announcement-banner.tsx`) fetches
  the current message; hidden entirely when you toggle it off.
- **Home projector** (`src/components/ui/projector-screen.tsx`) plays the
  projector images (replaced the old morph text + photo fan).
- **`/workshops`** renders the posted workshops with their banners.
- **`/gallery`** renders the gallery photos.
- All four fall back to bundled images / default text when the API can't be
  reached (e.g. local `npm run dev`, where PHP doesn't run).

## Deploy

`npm run build`, then publish `dist/` to `public_html/` (your usual Hostinger
flow). The PHP under `dist/api/` and the SPA `.htaccess` go with it. To test the
admin locally against the live API, add `VITE_API_BASE=https://<domain>/api`
(and `VITE_GALLERY_API=https://<domain>/api/gallery`) to a `.env` file.

## Security notes

- One shared password over HTTPS gates all writes. Uploads are validated as real
  images and the upload folders get an `.htaccess` that disables script
  execution.
- Keep the `/admin` URL + password private — there's no per-user login.
