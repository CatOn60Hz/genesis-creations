import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"
import { fetchProjectorImages } from "@/lib/cms-api"

// Bundled fallback so the projector is never blank (used in dev where PHP isn't
// running, or before the backend responds). Managed set lives in the backend.
const FALLBACK_MODULES = import.meta.glob<string>(
  "@/assets/gallery/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
  { eager: true, import: "default" }
)
const FALLBACK_IMAGES = Object.keys(FALLBACK_MODULES)
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  .map((k) => FALLBACK_MODULES[k])

export function ProjectorScreen({ className }: { className?: string }) {
  const [images, setImages] = useState<string[]>(FALLBACK_IMAGES)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    let active = true
    fetchProjectorImages()
      .then((list) => {
        if (active && list.length) setImages(list.map((i) => i.url))
      })
      .catch(() => {
        /* keep fallback */
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (images.length <= 1) return
    const t = setInterval(
      () => setIndex((p) => (p + 1) % images.length),
      3800
    )
    return () => clearInterval(t)
  }, [images.length])

  const current = images[index % Math.max(images.length, 1)]

  return (
    <div
      className={cn(
        "relative mx-auto flex w-full max-w-xl select-none flex-col items-center",
        className
      )}
    >
      {/* Ambient glow behind the screen */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[60%] w-[85%] -translate-x-1/2 rounded-[40%] bg-maroon/20 blur-3xl" />

      {/* Projection screen */}
      <div className="relative z-20 aspect-video w-full overflow-hidden rounded-xl border-[6px] border-black/80 bg-black shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
        <AnimatePresence>
          {current && (
            <motion.img
              key={current + index}
              src={current}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>

        {/* Projector light wash + flicker */}
        <motion.div
          className="pointer-events-none absolute inset-0 mix-blend-screen"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.18), rgba(255,255,255,0.02))",
          }}
          animate={{ opacity: [0.55, 0.8, 0.6, 0.85, 0.55] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "mirror" }}
        />
        {/* Scanlines */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.5) 1px, transparent 2px, transparent 4px)",
          }}
        />
        {/* Vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: "inset 0 0 80px rgba(0,0,0,0.6)" }}
        />
      </div>

      {/* Light beam: wide at the screen (top), narrowing to the lens (bottom) */}
      <motion.div
        className="pointer-events-none z-10 -mt-1 h-24 w-[112%]"
        style={{
          clipPath: "polygon(0 0, 100% 0, 58% 100%, 42% 100%)",
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.28), rgba(255,255,255,0))",
          filter: "blur(4px)",
          mixBlendMode: "screen",
        }}
        animate={{ opacity: [0.5, 0.85, 0.6, 0.9, 0.55] }}
        transition={{ duration: 0.6, repeat: Infinity, repeatType: "mirror" }}
      />

      {/* Projector device */}
      <div className="relative z-20 -mt-1 flex w-44 max-w-[55%] flex-col items-center">
        <div className="relative h-14 w-full rounded-lg bg-gradient-to-b from-neutral-700 to-neutral-900 shadow-lg ring-1 ring-white/10">
          {/* Lens */}
          <div className="absolute -top-2 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full bg-neutral-200 ring-2 ring-neutral-500 shadow-[0_0_14px_rgba(255,255,255,0.8)]" />
          {/* Reels */}
          <div className="absolute right-3 top-2.5 h-4 w-4 rounded-full border-2 border-neutral-500" />
          <div className="absolute right-8 top-2.5 h-4 w-4 rounded-full border-2 border-neutral-500" />
        </div>
        {/* Stand */}
        <div className="h-2 w-12 rounded-b-md bg-neutral-800" />
      </div>
    </div>
  )
}
