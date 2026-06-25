import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence, useSpring } from "framer-motion"

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

  // Tilt the screen toward the mouse cursor, smoothed with springs.
  const screenRef = useRef<HTMLDivElement>(null)
  const rotateX = useSpring(0, { stiffness: 120, damping: 18 })
  const rotateY = useSpring(0, { stiffness: 120, damping: 18 })

  useEffect(() => {
    const MAX = 16 // degrees
    const onMove = (e: MouseEvent) => {
      const el = screenRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / (window.innerWidth / 2)
      const dy = (e.clientY - cy) / (window.innerHeight / 2)
      rotateY.set(Math.max(-1, Math.min(1, dx)) * MAX)
      rotateX.set(Math.max(-1, Math.min(1, -dy)) * MAX)
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [rotateX, rotateY])

  return (
    <div
      className={cn(
        "relative mx-auto flex w-full max-w-none select-none flex-col items-center [perspective:1600px]",
        className
      )}
    >
      {/* Ambient glow behind the screen */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[80%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-[40%] bg-maroon/20 blur-3xl" />

      {/* Display screen — tilts toward the mouse cursor in 3D */}
      <motion.div
        ref={screenRef}
        className="relative z-20 aspect-video w-full overflow-hidden rounded-2xl border-[8px] border-black/80 bg-black shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
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
      </motion.div>
    </div>
  )
}
