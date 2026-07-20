# PhonePe Payment Gateway — Workshop Registration Plan

> **Status (July 2026): implemented on the `phonepe-payments` branch.** The
> full flow is built and dormant-safe: items without a fee behave exactly as
> before, and the payment endpoints return 503 "not configured" until PhonePe
> credentials land in `GC_PERSIST_DIR/secrets.php`. Beyond this plan, the same
> flow was extended to **academy courses** (per-course "Admission fee (₹)" +
> display price + admissions-closed toggle, all in /admin → Courses); workshop
> and course payments share `public/api/payments/` and one Registrations view.
> No PhonePe account yet — the steps to take once it exists are in
> **`docs/phonepe-go-live-checklist.md`**.

## Context

Workshop "registration" today is just an external link: each workshop has an
optional `registerUrl` (typically a Google Form) and the **"Register now"**
button opens it (`src/pages/workshops.tsx:255`). There is **no fee field, no
in-app registration form, and no payment/attendee tracking** anywhere in the
codebase.

Genesis Kreations wants to **collect workshop fees online via PhonePe**. We will
add a paid, in-app registration flow: an admin sets a fee per workshop, visitors
fill a short form (name/email/phone + which session/city), pay through PhonePe,
and land on a status page. Payments and attendees are stored server-side and
surfaced in a new **Registrations** view in `/admin`.

### Decisions locked with the user
- **No PhonePe account yet** → build for **Standard Checkout V2 (OAuth)** — the
  current model for new merchants (legacy salt-key/X-VERIFY is deprecated).
  Build/test against the **UAT sandbox** first, flip to production later.
- **Fixed fee per workshop.** Workshops with a fee use the new pay-to-register
  flow; workshops with **no fee keep the existing external `registerUrl`**.
- **Attendee picks a session/city** at registration (workshops have a `sessions`
  array of `{city, dates, timing, venue}`).
- **Admin Registrations dashboard** with paid/pending/failed status + CSV export.

### PhonePe V2 model (verified)
OAuth client-credentials → access token (`Authorization: O-Bearer <token>`) →
create order → redirect user to `redirectUrl` → confirm via **webhook**
(source of truth) and/or **order-status** poll.
- Sandbox base: `https://api-preprod.phonepe.com/apis/pg-sandbox`
- Production base: `https://api.phonepe.com/apis/pg` (+ identity-manager for token)
- Token: `POST .../v1/oauth/token` (form-urlencoded: `client_id`, `client_secret`,
  `client_version`, `grant_type=client_credentials`) → `{ access_token, expires_at }`
- Create order: `POST .../checkout/v2/pay` body `{ merchantOrderId, amount(paise),
  paymentFlow:{ type:"PG_CHECKOUT", merchantUrls:{ redirectUrl } } }` →
  `{ orderId, state, redirectUrl }`
- Status: `GET .../checkout/v2/order/{merchantOrderId}/status` → `{ state:
  COMPLETED|FAILED|PENDING, amount, ... }`
- Webhook: validate `Authorization` header == `SHA256(username:password)` set in
  the PhonePe dashboard.

Docs: https://developer.phonepe.com/payment-gateway/website-integration/standard-checkout/api-integration/integration-steps
and .../api-reference/authorization

---

## Key design constraints (important)

1. **Create-order is PUBLIC** (visitors pay, not the admin) — it must NOT call
   `require_auth()`. Only the admin Registrations endpoint uses the password.
2. **Amount is computed server-side** from the workshop's stored `fee` — never
   trust an amount from the client (prevents tampering).
3. **Secrets must survive deploys.** Hostinger rebuilds the web root from git on
   every push, so a gitignored file *inside* the deployed `/api` would be wiped.
   PhonePe keys + webhook creds live in **`GC_PERSIST_DIR/secrets.php`** (above
   the web root, set up once on the server), required by `config.php` if present.
   (`public/api/` is the PHP source of truth — `dist/api/` is generated output.)
4. **Concurrent writes** to `registrations.json` (new orders + webhook + status
   polls) need locking — add a `flock`-based read-modify-write helper; the
   existing `json_save` does a plain `file_put_contents` with no lock.
5. Reuse existing helpers in `public/api/_shared.php`: `send_cors`, `require_post`,
   `require_auth`, `json_out`, `json_load`, `json_save`, `ensure_dir`.

---

## Implementation

### 1. Secrets & config — `public/api/config.php` (+ new `secrets.php.example`)
- At the **end** of `config.php` (after `GC_PERSIST_DIR` is defined), load
  external secrets if present:
  ```php
  if (is_file(GC_PERSIST_DIR . '/secrets.php')) require GC_PERSIST_DIR . '/secrets.php';
  ```
- Provide safe defaults so endpoints never fatal when unset, using
  `defined(...) || define(...)`:
  `GC_PHONEPE_ENV` ('sandbox'), `GC_PHONEPE_CLIENT_ID`, `GC_PHONEPE_CLIENT_SECRET`,
  `GC_PHONEPE_CLIENT_VERSION`, `GC_PHONEPE_WEBHOOK_USER`, `GC_PHONEPE_WEBHOOK_PASS`,
  `GC_SITE_ORIGIN` ('https://genesiskreationsmedia.com').
- **Also move `GC_ADMIN_PASSWORD` to `defined()||define()`** so the real password
  + PhonePe keys all live in the out-of-git `secrets.php` (security win).
- Commit a `public/api/secrets.php.example` template documenting the constants.
- `.gitignore`: add `secrets.php` (defense in depth).

### 2. Workshop gains a `fee` field
- `src/lib/cms-api.ts`: add `fee?: number` to `Workshop` (rupees, integer).
- `public/api/workshops/save.php`: read `$_POST['fee']`, cast to int, persist on the
  record (mirror existing field handling ~line 100-116).
- `src/pages/admin.tsx`: add a **Fee (₹)** number input to the workshop editor
  (near `registerUrl`); include in `EMPTY_FORM` and the save payload.
- `src/pages/workshops.tsx`: button logic — if `fee > 0`, render
  **"Register — ₹{fee}"** that opens the new registration form; else keep the
  current `registerUrl` button (`:255`).

### 3. Backend — new `public/api/payments/` directory
Reuse the 7-step endpoint pattern (require `_shared.php` → `send_cors` → [auth] →
`require_post` → parse → validate → persist → `json_out`).

- **`_phonepe.php`** (helper, not routable):
  - `phonepe_base()` / token + pay + status URLs per `GC_PHONEPE_ENV`.
  - `phonepe_token()`: curl the OAuth endpoint; **cache** the token in
    `GC_DATA_DIR/phonepe-token.json` until `expires_at`; refresh when stale.
  - `phonepe_post($url,$body,$token)` / `phonepe_get($url,$token)`: curl wrappers
    (`Authorization: O-Bearer`, `CURLOPT_SSL_VERIFYPEER => true`, timeout 10).
  - `registrations_update(callable $fn)`: `flock(LOCK_EX)` read-modify-write of
    `GC_DATA_DIR/registrations.json` (the locking helper from constraint #4).

- **`create-order.php`** (PUBLIC, POST):
  parse `workshopId, sessionCity, name, email, phone`; validate email/phone shape;
  load `workshops.json`, find workshop, require `fee > 0`; verify `sessionCity` is
  one of its `sessions[].city`; `amountPaise = fee*100` (server-side);
  `merchantOrderId = 'GK-'.date.random`; create the PhonePe order with
  `redirectUrl = GC_SITE_ORIGIN.'/payment-status?order='.merchantOrderId`; append a
  **PENDING** registration record; return `{ redirectUrl }`.

- **`order-status.php`** (PUBLIC, GET): param `order` (merchantOrderId); call
  PhonePe status; update the local record's status (locked); return minimal
  `{ status, workshopTitle, amount }`.

- **`webhook.php`** (PUBLIC, POST, no auth): validate `Authorization` ==
  `hash('sha256', GC_PHONEPE_WEBHOOK_USER.':'.GC_PHONEPE_WEBHOOK_PASS)` with
  `hash_equals`; read event; update the matching registration status (locked) —
  **source of truth**; return 200.

- **`registrations.php`** (ADMIN, GET): `require_auth()`; return registrations,
  optional `?workshopId=` filter.

Registration record shape (`GC_DATA_DIR/registrations.json`, array, newest first):
```
{ id, workshopId, workshopTitle, sessionCity, name, email, phone,
  amountPaise, merchantOrderId, phonepeOrderId,
  status: "PENDING"|"COMPLETED"|"FAILED", createdAt, updatedAt }
```

### 4. Frontend — registration flow
- `src/lib/cms-api.ts`: add
  - `createWorkshopOrder({workshopId,sessionCity,name,email,phone})` → public POST
    to `payments/create-order.php` (a small `postPublic` helper — like `postForm`
    but **no password header**) → `{ redirectUrl }`, then `window.location.assign`.
  - `fetchOrderStatus(order)` → GET `payments/order-status.php`.
  - `fetchRegistrations(password)` → GET `payments/registrations.php` with the
    `X-Gallery-Password` header (reuse the auth pattern).
- **`src/components/workshop-registration.tsx`** (new): modal/inline form — name,
  email, phone, **session/city `<select>`** (from `workshop.sessions`), shows the
  fee; on submit calls `createWorkshopOrder` and redirects to PhonePe. Match
  existing UI (shadcn/ui, brand tokens, framer-motion).
- **`src/pages/payment-status.tsx`** (new, lazy): reads `?order=`, polls
  `fetchOrderStatus` (a few attempts), shows success / pending / failed with a
  retry link back to the workshop. Add `<SEO ... noindex />` (transactional page).
- `src/App.tsx`: add `<Route path="/payment-status" element={<PaymentStatus />} />`
  (lazy import alongside the others ~`:15-25`). Not added to the prerender list
  (it's dynamic), so `scripts/prerender.mjs` is unchanged.

### 5. Admin — Registrations view
- `src/pages/admin.tsx`: add a **Registrations** section/tab that calls
  `fetchRegistrations(pw)` and renders a table (workshop, name, email, phone,
  session, amount, status, date) with a **status filter** and **client-side CSV
  export** (build CSV from the JSON in the browser; no new endpoint needed).

---

## Critical files

| File | Change |
|---|---|
| `public/api/config.php` | load `GC_PERSIST_DIR/secrets.php`; `define()` PhonePe + admin-password constants with defaults |
| `public/api/secrets.php.example` | **new** — documented secrets template |
| `public/api/payments/_phonepe.php` | **new** — token cache, curl wrappers, locked registrations update |
| `public/api/payments/create-order.php` | **new** — public; server-side amount; PhonePe pay |
| `public/api/payments/order-status.php` | **new** — public status poll |
| `public/api/payments/webhook.php` | **new** — signature-validated confirmation (source of truth) |
| `public/api/payments/registrations.php` | **new** — admin list (auth) |
| `public/api/workshops/save.php` | persist `fee` |
| `src/lib/cms-api.ts` | `fee` field; `createWorkshopOrder`, `fetchOrderStatus`, `fetchRegistrations`, `postPublic` |
| `src/components/workshop-registration.tsx` | **new** — registration form |
| `src/pages/payment-status.tsx` | **new** — post-payment status page |
| `src/pages/workshops.tsx` | fee-aware register button |
| `src/pages/admin.tsx` | fee input + Registrations view + CSV |
| `src/App.tsx` | `/payment-status` route |

---

## PhonePe onboarding (user, before go-live — no account yet)
1. Sign up at PhonePe Business, complete KYC/merchant onboarding.
2. Obtain **Standard Checkout V2** keys: Client ID, Client Secret, Client Version
   (sandbox set first, then production).
3. In the dashboard, configure the **webhook URL**
   (`https://genesiskreationsmedia.com/api/payments/webhook.php`) with a
   username/password.
4. On the server, create `GC_PERSIST_DIR/secrets.php` with the keys + webhook
   creds (never committed). Start with `GC_PHONEPE_ENV='sandbox'`; switch to
   `'production'` when live.

## Verification
- **Typecheck/build:** `npm run build` (the project's gate) must pass.
- **Sandbox happy path:** set sandbox creds in `secrets.php`; set a fee on a test
  workshop in `/admin`; from `/workshops` register → complete a PhonePe **sandbox**
  payment → land on `/payment-status` showing **success**; confirm the record flips
  to `COMPLETED` (via webhook) in the admin Registrations view.
- **Failure path:** cancel/fail a sandbox payment → status page shows failed →
  record `FAILED`.
- **Security checks:** posting a tampered amount has no effect (amount derived from
  `fee`); `create-order` works without the admin password; `registrations.php`
  returns 401 without it; `webhook.php` rejects a bad `Authorization` signature.
- **Note:** webhook + redirect need a public URL, so end-to-end testing happens on
  the live domain in **sandbox** mode (or via a tunnel), not pure localhost.

## Out of scope (suggested follow-ups)
Email/SMS confirmation to attendees (PHP `mail()` / provider), refunds API, seat
capacity limits, per-session pricing.
