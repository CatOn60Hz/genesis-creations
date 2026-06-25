# Gallery backend (Hostinger)

The gallery photos are no longer bundled into the build — they live on the
Hostinger server and are managed from a browser. Adding/removing photos no
longer requires a rebuild or redeploy.

## Pieces

| Path | Role |
| --- | --- |
| `public/api/gallery/*.php` | PHP API (ships into `dist/api/gallery/` on build) |
| `public_html/uploads/gallery/` | Where photos are stored on the server (created automatically) |
| `src/pages/gallery.tsx` | Public page — fetches photos from the API at runtime |
| `src/pages/gallery-admin.tsx` | `/gallery-admin` — password-protected upload/delete UI |
| `src/lib/gallery-api.ts` | Frontend API client |

## One-time setup

1. **Set your password.** Edit `public/api/gallery/config.php` and change
   `ADMIN_PASSWORD` from the default to your own secret. (Do this before the
   first deploy, or edit it directly on the server via hPanel File Manager.)
2. **Deploy as usual:** `npm run build`, then upload the contents of `dist/`
   to `public_html/` on Hostinger. This includes `api/` and `.htaccess`.
3. The `uploads/gallery/` folder is created automatically the first time you
   upload a photo — nothing to set up by hand.

## Adding photos

- Go to `https://<your-domain>/gallery-admin`
- Enter the admin password
- Click the upload box, select one or many images (JPG/PNG/WebP/GIF, ≤15 MB each)
- They appear immediately on `/gallery`. Hover a photo in the admin to delete it.

## Notes

- **Fallback:** if the API can't be reached (e.g. local `npm run dev`, where PHP
  doesn't run), the page shows the bundled photos in `src/assets/gallery/` so it
  is never empty. On the live site the backend photos take over.
- **Local dev against live API:** create a `.env` file with
  `VITE_GALLERY_API=https://<your-domain>/api/gallery` to test uploads locally.
- **Security:** uploads are validated as real images and the uploads folder is
  given an `.htaccess` that disables script execution. The admin password is a
  shared secret sent over HTTPS — fine for this use, but keep it private.
- **Existing `.htaccess`:** if `public_html` already has one for SPA routing,
  make sure it does **not** rewrite `/api/...` or `/uploads/...` to `index.html`.
  The `.htaccess` shipped here excludes real files/folders, so it is safe.
