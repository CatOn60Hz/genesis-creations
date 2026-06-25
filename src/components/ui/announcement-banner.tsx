import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { Megaphone, X } from "lucide-react"

import { fetchAnnouncement, type Announcement } from "@/lib/cms-api"

// Used until the backend responds, and in dev where PHP isn't running.
const DEFAULT_ANNOUNCEMENT: Announcement = {
  enabled: true,
  text: "New: Media Production Masterclass series launches next week!",
  ctaLabel: "Register now",
  ctaHref: "/academy",
}

const AnnouncementBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [data, setData] = useState<Announcement>(DEFAULT_ANNOUNCEMENT)
  const ref = useRef<HTMLDivElement>(null)

  // Pull the current announcement from the backend (falls back to the default).
  useEffect(() => {
    let active = true
    fetchAnnouncement()
      .then((a) => {
        if (active) setData(a)
      })
      .catch(() => {
        /* keep default */
      })
    return () => {
      active = false
    }
  }, [])

  // Show after a short delay on every page load. Dismissal is not remembered,
  // so the banner returns for returning visitors.
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  const show = isVisible && data.enabled && data.text.trim() !== ""

  // Publish the banner's height as --announcement-h so other fixed elements
  // (the mobile menu button) can offset themselves and never sit underneath it.
  useEffect(() => {
    const root = document.documentElement
    const clear = () => root.style.removeProperty("--announcement-h")
    if (!show) {
      clear()
      return
    }
    const setH = () => {
      if (ref.current) {
        root.style.setProperty("--announcement-h", `${ref.current.offsetHeight}px`)
      }
    }
    setH()
    const ro = new ResizeObserver(setH)
    if (ref.current) ro.observe(ref.current)
    return () => {
      ro.disconnect()
      clear()
    }
  }, [show])

  const dismiss = () => setIsVisible(false)

  const hasCta = data.ctaLabel.trim() !== "" && data.ctaHref.trim() !== ""
  const isExternal = /^https?:\/\//.test(data.ctaHref)

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          ref={ref}
          data-announcement
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center bg-maroon px-4 py-2.5 shadow-md"
        >
          <div className="flex items-center gap-2 pr-8 text-center text-xs font-medium text-maroon-dark sm:text-sm md:text-base">
            <Megaphone size={18} className="hidden shrink-0 animate-pulse sm:block" />
            <span>
              {data.text}
              {hasCta &&
                (isExternal ? (
                  <a
                    href={data.ctaHref}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-2 inline-block font-bold underline decoration-maroon-dark/40 underline-offset-4 transition-colors hover:decoration-maroon-dark"
                  >
                    {data.ctaLabel} &rarr;
                  </a>
                ) : (
                  <Link
                    to={data.ctaHref}
                    className="ml-2 inline-block font-bold underline decoration-maroon-dark/40 underline-offset-4 transition-colors hover:decoration-maroon-dark"
                  >
                    {data.ctaLabel} &rarr;
                  </Link>
                ))}
            </span>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-maroon-dark transition-colors hover:bg-maroon-dark/10"
            aria-label="Dismiss announcement"
          >
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export { AnnouncementBanner }
