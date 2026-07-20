import { useEffect, useState, type FormEvent } from "react"
import { createPortal } from "react-dom"
import { motion } from "framer-motion"
import { Loader2, Lock, Ticket, X } from "lucide-react"

import { type WorkshopSession } from "@/lib/cms-api"

// Shared pay-to-register modal for workshops and courses: collects attendee
// details (+ a session pick when the item lists sessions), then hands off to
// PhonePe's hosted checkout via the caller-supplied createOrder. Rendered as a
// modal above whatever detail view opened it.

const FIELD_CLS =
  "w-full rounded-xl bg-black/30 px-4 py-3 text-sm text-cream ring-1 ring-white/15 transition-shadow placeholder:text-cream/35 focus:outline-none focus:ring-2 focus:ring-maroon"

export function PaymentRegistration({
  title,
  fee,
  feeLabel = "Fee",
  sessions = [],
  onClose,
  createOrder,
}: {
  title: string
  fee: number
  feeLabel?: string
  sessions?: WorkshopSession[]
  onClose: () => void
  // Creates the PhonePe order and resolves to the hosted-checkout URL.
  createOrder: (fields: {
    sessionCity: string
    name: string
    email: string
    phone: string
    dob: string
  }) => Promise<string>
}) {
  const cities = sessions.filter((s) => s.city)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [dob, setDob] = useState("")
  const [sessionCity, setSessionCity] = useState(cities[0]?.city ?? "")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    // Lock background scroll while the modal is open (matches the app's other
    // modals — gallery/reels/academy). Restore the previous value on close so
    // nesting under another already-locked modal stays correct.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      const redirectUrl = await createOrder({
        sessionCity,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        dob,
      })
      // Off to PhonePe's hosted checkout; it redirects back to /payment-status.
      window.location.assign(redirectUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setSubmitting(false)
    }
  }

  // Portal to <body> so the fixed-position overlay is measured against the
  // viewport, not a transformed ancestor. Call sites render this modal from
  // inside animated cards/detail views (e.g. framer-motion's translateY leaves
  // an inline transform), which would otherwise anchor `position: fixed` to the
  // card and push the modal off-centre.
  return createPortal(
    <div
      className="fixed inset-0 z-[80] overflow-y-auto bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      data-lenis-prevent
    >
      {/* Separate scroll container (outer) from centering (this wrapper) so a
          modal taller than the viewport still scrolls fully — margin-auto
          centering inside an overflow container clips the top on short screens. */}
      <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#1a0a0f] ring-1 ring-white/10"
          onClick={(e) => e.stopPropagation()}
        >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-cream transition-colors hover:bg-maroon"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="bg-[linear-gradient(135deg,#6d1f33_0%,#2a0d15_100%)] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cream/60">
            Register
          </p>
          <h2 className="mt-1.5 text-xl font-bold text-cream">{title}</h2>
          <p className="mt-2 text-sm text-cream/80">
            {feeLabel}: <span className="font-bold text-cream">₹{fee.toLocaleString("en-IN")}</span>
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4 p-6">
          <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wider text-cream/60">
            Full name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={120}
              className={FIELD_CLS}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wider text-cream/60">
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={FIELD_CLS}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wider text-cream/60">
            Phone
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98XXXXXXXX"
              minLength={10}
              className={FIELD_CLS}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wider text-cream/60">
            Date of birth
            <input
              required
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className={`${FIELD_CLS} [color-scheme:dark]`}
            />
          </label>

          {cities.length > 0 && (
            <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wider text-cream/60">
              Session
              <select
                required
                value={sessionCity}
                onChange={(e) => setSessionCity(e.target.value)}
                className={FIELD_CLS}
              >
                {cities.map((s) => (
                  <option key={s.city} value={s.city} className="bg-[#1a0a0f]">
                    {s.city}
                    {s.dates ? ` — ${s.dates}` : ""}
                  </option>
                ))}
              </select>
            </label>
          )}

          {error && (
            <p className="rounded-xl bg-maroon/15 px-4 py-3 text-sm text-red-300 ring-1 ring-maroon/30">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-maroon px-6 py-3.5 text-sm font-semibold text-cream transition-transform hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Starting payment…
              </>
            ) : (
              <>
                <Ticket className="h-4 w-4" /> Pay ₹{fee.toLocaleString("en-IN")} &amp; register
              </>
            )}
          </button>
          <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-cream/45">
            <Lock className="h-3 w-3" /> Secure payment via PhonePe
          </p>
        </form>
        </motion.div>
      </div>
    </div>,
    document.body,
  )
}
