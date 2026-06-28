# CMS Expansion Plan — Genesis Kreations

Make the following site content admin-editable through the existing PHP CMS and
the `/admin` dashboard, instead of being hardcoded in React:

1. **Testimonials** (`src/components/sections/testimonials.tsx`)
2. **Certification courses** (the 8 rich records in `src/pages/academy.tsx`)
3. **Workshops** — *already done*, no work
4. **FAQ** — new content type + new on-page section
5. **Home "Workshops & Courses" list** (`src/components/sections/courses.tsx`)

Plus make four page **background/hero images** admin-uploadable:

- Media Academy (`academy.tsx` → `academy-hero.jpg`)
- Our Services (`services.tsx` → `studio.jpg`)
- Digital Marketing (`digital-marketing.tsx` → `digital-marketing-hero.jpg`)
- About Us (`about.tsx` → `about-hero.jpg`)

All decisions confirmed with the user:
- **Plan first**, then build everything in order.
- **Seed with current content** so the site looks identical after the change.
- Backgrounds live in **one "Backgrounds" admin tab** with named slots.

---

## Architecture (reuses existing patterns — no new infrastructure)

Everything follows the conventions already in `dist/api/`:

- **Storage:** JSON files in `GC_DATA_DIR`, uploads in `GC_UPLOADS_DIR/<section>`
  (both outside the web root, survive deploys). Served via `media.php`.
- **Shared helpers:** `_shared.php` (`json_load/json_save`, `save_one_image`,
  `delete_named`, `require_auth`, `json_out` with no-cache headers).
- **Client:** new functions in `src/lib/cms-api.ts` using the existing
  `getJSON` / `postForm` helpers (cache-buster + `X-Gallery-Password` auth).
- **Admin:** new editor components + tabs in `src/pages/admin.tsx`, mirroring the
  existing `WorkshopsEditor` (incl. the repeatable-row helpers for list fields).

### Seeding strategy — "seed on first read"

Because the persist dir starts empty on the server and lives outside the git
tree, seed content is shipped **inside the API folder** (committed, deployed)
and copied into the persist dir the first time a list is read:

- Each `list.php` does: load the data JSON; **if it doesn't exist yet**,
  initialise it from a committed `seed.php` defaults array, `json_save` it, then
  return. Seeding therefore happens exactly once, then admins edit freely and the
  edits persist across deploys.
- **Testimonial seed images:** the 3 current student photos are shipped in
  `dist/api/testimonials/seed/` and copied into `uploads/testimonials/` during
  the first seed; the seed records point at the copies.
- **Page backgrounds need no seed** — the pages keep importing their current
  bundled hero image and use it as the fallback until an admin uploads a
  replacement. So the page looks identical with an empty backgrounds store.

Every frontend section also keeps its current hardcoded data as a **fallback**
used when the API is empty or unreachable (defensive; matches the gallery/
workshops behaviour).

---

## Part 1 — Backend (PHP)

New endpoint folders under `dist/api/`, each modelled on `workshops/`:

### `testimonials/`
- Record: `{ id, quote, author, role?, image: {name,url}|null, order, createdAt, updatedAt }`
- `list.php` (public GET, seeds on first read) → `{ testimonials: [...] }`
- `save.php` (create/update, optional `image` upload)
- `delete.php` (also removes the image file)
- `reorder.php` (array of ids → persisted order)
- `seed.php` + `seed/*.png` (3 current reviews)

### `courses/` (certification courses — the rich academy records)
- Record mirrors the `Course` type in `academy.tsx`:
  `{ id, kind, badge?, title, subtitle, why, duration, schedule, format,
     certification, learn?[], modules?[{title, items[]}], careers?[],
     included?[], who?, order, timestamps }`
- `list.php` / `save.php` / `delete.php` / `reorder.php` / `seed.php`
- List fields (`learn`, `included`, `careers`) and the nested `modules`
  travel as JSON strings in FormData, decoded server-side — same technique
  workshops already uses for `sessions`/`learn`/`included`.
- `kind` drives the existing animated course icon; admin picks from the known
  set (diploma, photography, videography, graphic-design, video-editing, drone,
  live-sound, studio-recording).

### `faq/`
- Record: `{ id, question, answer, order, timestamps }`
- `list.php` / `save.php` / `delete.php` / `reorder.php` / `seed.php`
- Seed with a starter set drawn from site copy (duration, prerequisites,
  certification, location, fees-enquiry, etc.).

### `home-courses/`  (the home "Workshops & Courses" menu list)
- Record: `{ id, kind, title, text, order, timestamps }`
- Same five-endpoint set. Optional small `heading`/`intro` config kept simple —
  default to the current section copy.
- Seed with the 5 current rows (gimbal, drone, aerial, media-tech, photography).

### `backgrounds/`
- Store: `data/backgrounds.json` = `{ <slot>: {name,url} }`
- Slots: `academy`, `services`, `digital-marketing`, `about`
  (structured so `home-hero`, `contact`, `workshops` can be added later).
- `list.php` (public GET) → `{ backgrounds: { slot: {name,url} } }`
- `set.php` (POST: `slot` + `image` upload; replaces + deletes the old file)
- `delete.php` (POST: `slot` → clears it, reverting the page to its bundled image)

---

## Part 2 — Client (`src/lib/cms-api.ts`)

Add types + functions following the existing explicit style:

- **Testimonials:** `Testimonial` type, `fetchTestimonials`, `saveTestimonial`,
  `deleteTestimonial`, `reorderTestimonials`.
- **Certification courses:** `CertCourse` type (+ `CourseModule`),
  `fetchCertCourses`, `saveCertCourse`, `deleteCertCourse`, `reorderCertCourses`.
- **FAQ:** `FaqItem`, `fetchFaqs`, `saveFaq`, `deleteFaq`, `reorderFaqs`.
- **Home courses:** `HomeCourse`, `fetchHomeCourses`, `saveHomeCourse`,
  `deleteHomeCourse`, `reorderHomeCourses`.
- **Backgrounds:** `fetchBackgrounds(): Promise<Record<string,string>>` (URLs
  absolutised via the existing `abs()`), `setBackground(slot, file, password)`,
  `clearBackground(slot, password)`.

Image URLs run through the existing `abs()` so remote-API dev mode still works.

---

## Part 3 — Admin dashboard (`src/pages/admin.tsx`)

Extend the `Tab` union + `TABS` array with: **Testimonials, Courses, FAQ,
Home Courses, Backgrounds**. New editor components:

- `TestimonialsEditor` — list with quote/author/role + single image upload,
  add / edit / delete / drag-reorder. (Pattern: `WorkshopsEditor`.)
- `CoursesEditor` — the richest: title/subtitle/why/duration/schedule/format/
  certification/badge/kind + repeatable `learn`, `included`, `careers` rows and
  repeatable `modules` (each a title + items list). Reuses the existing
  repeatable-row helpers.
- `FaqEditor` — simple question/answer rows + reorder.
- `HomeCoursesEditor` — kind/title/text rows + reorder.
- `BackgroundsEditor` — one labelled uploader per slot with a live thumbnail,
  upload-to-replace and "reset to default" (clear) buttons.

No changes to the auth model — the single admin password gates all of it.

---

## Part 4 — Wire up the frontend

Each section fetches its data on mount and **falls back to the current
hardcoded content** if the API is empty/unreachable:

- `testimonials.tsx` → `fetchTestimonials()`; map to `ScrollReelTestimonial`.
- `courses.tsx` → `fetchHomeCourses()`; keep icon mapping by `kind`.
- `academy.tsx` → `fetchCertCourses()` for the certification courses grid;
  `fetchBackgrounds().academy` for the hero (fallback `academy-hero.jpg`).
- `services.tsx` / `digital-marketing.tsx` / `about.tsx` → background slot with
  bundled fallback.
- **New `Faq` section** (`src/components/sections/faq.tsx`) using the existing
  accordion/Reveal styling; rendered on the **Academy page** (FAQ is course-
  focused) and trivially reusable elsewhere. *Placement is the one open choice —
  default is the Academy page; tell me if you'd rather it sit on Home or its own
  route.*

---

## Part 5 — Verify

- `npm run build` (tsc typecheck + bundle) is the gate — must pass clean.
- `npm run lint`.
- Manual smoke in `/admin`: add/edit/delete/reorder each new type; upload and
  reset each background; confirm public pages reflect changes and still render
  correctly when the backend is empty (fallback path).
- **No commit/push** — per project rule, `main` auto-deploys; you push when ready.

---

## Suggested build order

1. Testimonials (full vertical slice — proves the end-to-end pattern).
2. FAQ + new FAQ section (simple, high value).
3. Backgrounds (one tab, 4 slots).
4. Home "Workshops & Courses" list.
5. Certification courses (largest editor) — last, since it's the most involved.

Each slice = PHP endpoints + seed + `cms-api.ts` + admin editor + page wiring +
`npm run build`. I'll keep them independent so you can review/deploy incrementally.

## Notes / things to confirm while building

- **FAQ placement** (Academy page by default — see Part 4).
- **Course `kind` set** is fixed to the existing icon variants; adding a brand-new
  icon kind would need a small frontend icon addition (not just CMS data).
- Background slots are deliberately limited to the four requested pages but the
  store is keyed so Home hero / Contact / Workshops can be added later with no
  schema change.
