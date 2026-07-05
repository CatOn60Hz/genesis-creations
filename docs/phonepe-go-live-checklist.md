# PhonePe — What To Do After Getting the Business Account

Everything in code is already built and merged into the `phonepe-payments`
branch: workshop registrations (Fee field in /admin → Workshops) and course
admissions (Admission fee field in /admin → Courses) both charge through
PhonePe Standard Checkout V2 and land in /admin → Registrations.

Until the steps below are done, the site behaves exactly as before: no fee set
= no payment button, and the payment endpoints answer
`503 "Payments are not configured yet"`.

---

## 1. PhonePe Business onboarding (one-time, on phonepe.com)

1. Sign up at **business.phonepe.com** and complete KYC / merchant onboarding
   for Genesis Kreations.
2. In the dashboard's **developer / API section**, collect the
   **Standard Checkout V2 (UAT/sandbox)** credential set:
   - Client ID
   - Client Secret
   - Client Version
   (There is a separate production set — you'll pick that up in step 5.)
3. Configure the **webhook**:
   - URL: `https://genesiskreationsmedia.com/api/payments/webhook.php`
   - Choose a username + password (anything strong — you invent these; they
     are only used to authenticate PhonePe's callbacks).

## 2. Put the secrets on the Hostinger server (one-time)

The code reads secrets from `gc-data/secrets.php` — the same persistent folder
**above the web root** that already holds uploads/content, so deploys never
wipe it. Create it once via Hostinger's file manager or SSH:

1. Copy the committed template `public/api/secrets.php.example` (also deployed
   at `<webroot>/api/secrets.php.example`) to `<folder above webroot>/gc-data/secrets.php`.
2. Fill in:
   - `GC_ADMIN_PASSWORD` — move the real admin password here too.
   - `GC_PHONEPE_ENV` — keep `'sandbox'` for now.
   - `GC_PHONEPE_CLIENT_ID / _SECRET / _VERSION` — the sandbox set from step 1.
   - `GC_PHONEPE_WEBHOOK_USER / _PASS` — the username/password from step 1.3.

No deploy needed — the API picks the file up on the next request.

## 3. Merge + deploy the code

Merge the `phonepe-payments` branch into `main` (this auto-deploys). Only do
this when you're ready — the branch is inert without credentials, so merging
early is safe, but it's your call.

## 4. Sandbox end-to-end test (on the live domain)

PhonePe sandbox = real flow, fake money. In `/admin`:

1. Set a Fee (₹) on a test **workshop** → on /workshops, "Register — ₹X" →
   fill the form → complete the sandbox payment → you should land on
   `/payment-status` showing **success**, and the row in
   /admin → Registrations should flip to **PAID** (webhook confirms it).
2. Set an Admission fee on a test **course** → same flow from the Academy
   page's course popup ("Enroll — pay ₹X").
3. **Failure path**: cancel a sandbox payment → status page shows failed,
   row shows FAILED.
4. Sanity checks:
   - A course marked **Admissions closed** must refuse payment.
   - /admin → Registrations must ask for the password; CSV export works.
5. Remove the test fees (set back to 0) when done.

## 5. Switch to production

1. In the PhonePe dashboard, request/collect the **production** credential set
   (PhonePe reviews the integration before enabling live payments).
2. In `gc-data/secrets.php` on the server, replace the sandbox values with the
   production Client ID/Secret/Version and set `GC_PHONEPE_ENV = 'production'`.
3. Make one small real payment end-to-end (you can refund it from the PhonePe
   dashboard) before announcing.

## Where things live (reference)

| Thing | Place |
|---|---|
| Workshop fee | /admin → Workshops → "Fee (₹)" |
| Course admission fee | /admin → Courses → "Admission fee (₹)" |
| Course display price / closed toggle | /admin → Courses |
| Payments & attendees | /admin → Registrations (filter + CSV export) |
| Secrets | `gc-data/secrets.php` on the server (never in git) |
| Backend code | `public/api/payments/` (deployed to `/api/payments/`) |
| Full design/plan | `docs/phonepe-integration-plan.md` |
