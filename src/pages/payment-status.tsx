import { useEffect, useRef, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { CircleCheck, CircleX, Loader2 } from "lucide-react"

import { fetchOrderStatus, type PaymentStatus } from "@/lib/cms-api"
import { SEO } from "@/components/seo"

// Landing page after PhonePe's hosted checkout redirects back
// (/payment-status?order=<merchantOrderId>). Polls the order status a few
// times because the payment can still be settling when the user returns; the
// backend webhook remains the source of truth for the stored record.

const POLL_DELAYS_MS = [0, 2000, 4000, 6000, 8000]

type View = "checking" | PaymentStatus | "error"

const PaymentStatusPage: React.FC = () => {
  const [params] = useSearchParams()
  const order = params.get("order") ?? ""
  const [view, setView] = useState<View>(order ? "checking" : "error")
  const [detail, setDetail] = useState<{
    type: "workshop" | "course"
    title: string
    sessionCity: string
    amountPaise: number
  } | null>(null)
  const attempt = useRef(0)

  useEffect(() => {
    if (!order) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>

    const poll = async () => {
      try {
        const res = await fetchOrderStatus(order)
        if (cancelled) return
        setDetail(res)
        if (res.status !== "PENDING" || attempt.current >= POLL_DELAYS_MS.length - 1) {
          setView(res.status)
          return
        }
      } catch {
        if (cancelled) return
        if (attempt.current >= POLL_DELAYS_MS.length - 1) {
          setView("error")
          return
        }
      }
      attempt.current += 1
      timer = setTimeout(poll, POLL_DELAYS_MS[attempt.current])
    }

    poll()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [order])

  const amount = detail ? (detail.amountPaise / 100).toLocaleString("en-IN") : ""

  return (
    <main className="flex min-h-screen items-center justify-center bg-maroon-dark/40 px-6 py-24 text-cream">
      <SEO title="Payment Status - Genesis Kreations" noindex />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md rounded-3xl bg-white/5 p-8 text-center ring-1 ring-white/10"
      >
        {view === "checking" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-maroon" />
            <h1 className="mt-5 text-2xl font-bold">Checking your payment…</h1>
            <p className="mt-2 text-sm text-cream/70">
              Hang tight — this usually takes a few seconds.
            </p>
          </>
        )}

        {view === "COMPLETED" && (
          <>
            <CircleCheck className="mx-auto h-14 w-14 text-green-400" />
            <h1 className="mt-5 text-2xl font-bold">You're registered!</h1>
            <p className="mt-3 text-sm leading-relaxed text-cream/75">
              Payment of <span className="font-semibold text-cream">₹{amount}</span>{" "}
              received{detail?.title ? (
                <>
                  {" "}for <span className="font-semibold text-cream">{detail.title}</span>
                </>
              ) : null}
              {detail?.sessionCity ? ` (${detail.sessionCity})` : ""}. We'll be in
              touch on your email/phone with the session details.
            </p>
          </>
        )}

        {view === "PENDING" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-maroon" />
            <h1 className="mt-5 text-2xl font-bold">Payment is processing</h1>
            <p className="mt-3 text-sm leading-relaxed text-cream/75">
              Your payment hasn't been confirmed yet. If money was deducted, the
              registration completes automatically — no need to pay again. You
              can refresh this page in a minute to check.
            </p>
          </>
        )}

        {(view === "FAILED" || view === "error") && (
          <>
            <CircleX className="mx-auto h-14 w-14 text-red-400" />
            <h1 className="mt-5 text-2xl font-bold">
              {view === "FAILED" ? "Payment failed" : "Something went wrong"}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-cream/75">
              {view === "FAILED"
                ? "The payment didn't go through and you have not been charged. You can try registering again."
                : order
                  ? "We couldn't check the payment status right now. If money was deducted, your registration completes automatically."
                  : "This page needs a payment reference. Head back to workshops to register."}
            </p>
          </>
        )}

        <Link
          to={detail?.type === "course" ? "/academy" : "/workshops"}
          className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-maroon px-6 py-3 text-sm font-semibold text-cream transition-transform hover:scale-[1.02]"
        >
          {detail?.type === "course" ? "Back to the academy" : "Back to workshops"}
        </Link>
      </motion.div>
    </main>
  )
}

export { PaymentStatusPage as PaymentStatus }
export default PaymentStatusPage
