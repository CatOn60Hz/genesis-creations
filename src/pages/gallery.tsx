import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

import ThreeDMarquee from "@/components/ui/3d-marquee"
import { fetchGalleryPhotos } from "@/lib/gallery-api"

// Bundled photos act as a fallback so the page is never empty — used until the
// Hostinger backend responds, and in local dev where PHP isn't running. Drop
// files into src/assets/gallery to change the fallback set.
const FALLBACK_MODULES = import.meta.glob<string>(
  "@/assets/gallery/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
  { eager: true, import: "default" }
)
const FALLBACK_PHOTOS = Object.keys(FALLBACK_MODULES)
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  .map((key) => FALLBACK_MODULES[key])

// The marquee reads richest with three full columns. Repeat the set when there
// are only a handful of photos so the columns never look sparse.
function buildMarqueeImages(photos: string[]): string[] {
  if (photos.length === 0) return []
  return photos.length >= 9 ? photos : [...photos, ...photos, ...photos]
}

const Gallery: React.FC = () => {
  const [openSrc, setOpenSrc] = useState<string | null>(null)
  // Live photos from the backend, falling back to the bundled set on failure.
  const [photos, setPhotos] = useState<string[]>(FALLBACK_PHOTOS)

  useEffect(() => {
    let active = true
    fetchGalleryPhotos()
      .then((list) => {
        if (active && list.length) setPhotos(list.map((p) => p.url))
      })
      .catch(() => {
        /* keep the bundled fallback */
      })
    return () => {
      active = false
    }
  }, [])

  const marqueeImages = buildMarqueeImages(photos)

  // Close the lightbox on Escape and lock body scroll while it's open.
  useEffect(() => {
    if (!openSrc) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenSrc(null)
    }
    window.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    // Hides the floating nav/dock while the lightbox is open (see index.css).
    document.body.classList.add("lightbox-open")
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
      document.body.classList.remove("lightbox-open")
    }
  }, [openSrc])

  return (
    <main className="h-screen snap-y snap-mandatory overflow-y-auto overflow-x-hidden bg-maroon-dark text-cream [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Page 1 — the 3D marquee hero */}
      <section
        id="gallery-marquee"
        className="relative flex min-h-screen snap-start flex-col items-center justify-center overflow-hidden px-6 py-16"
      >
        <div className="absolute inset-0 z-0 opacity-90">
          <ThreeDMarquee images={marqueeImages} className="h-full" />
        </div>

        {/* Darkening veil so the title reads cleanly over the moving images */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-maroon-dark/70 via-maroon-dark/40 to-maroon-dark/90" />

        <div className="relative z-20 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-maroon md:text-sm">
            Genesis Creations
          </p>
          <h1 className="text-6xl font-bold tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] md:text-8xl">
            Gallery
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-cream/80 md:text-lg">
            Moments from our shoots, studio sessions and events — captured the
            Genesis way.
          </p>
        </div>

        {/* Scroll-down cue to the photo grid below */}
        <a
          href="#gallery-grid"
          aria-label="Scroll to photos"
          className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-cream/80 transition-colors hover:text-maroon"
          >
            <span className="text-[0.65rem] uppercase tracking-[0.3em]">
              View Photos
            </span>
            <ChevronDown className="h-6 w-6" />
          </motion.div>
        </a>
      </section>

      {/* Page 2 — the full photo grid */}
      <section
        id="gallery-grid"
        className="flex min-h-screen snap-start flex-col px-6 py-24"
      >
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold md:text-5xl">All Photos</h2>
            <p className="mx-auto mt-4 max-w-2xl text-cream/70">
              Tap any photo to view it full size.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
            {photos.map((src, i) => (
              <motion.button
                type="button"
                key={src}
                onClick={() => setOpenSrc(src)}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-white/10"
              >
                <img
                  src={src}
                  alt={`Genesis Creations ${i + 1}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-maroon-dark/0 transition-colors duration-300 group-hover:bg-maroon-dark/20" />
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {openSrc && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpenSrc(null)}
          >
            <motion.img
              src={openSrc}
              alt="Genesis Creations"
              className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpenSrc(null)}
              className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-2xl text-white transition-colors hover:bg-white/30"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

export { Gallery }
