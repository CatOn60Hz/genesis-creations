import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence, useSpring } from "framer-motion"

import { cn } from "@/lib/utils"
import { fetchProjectorImages, fetchHeroVideo } from "@/lib/cms-api"
import { useIsTouch } from "@/components/hooks/use-is-touch"

// Bundled fallback so the projector is never blank (used in dev where PHP isn't
// running, or before the backend responds). Managed set lives in the backend.
const FALLBACK_MODULES = import.meta.glob<string>(
  "@/assets/gallery/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
  { eager: true, import: "default" }
)
const FALLBACK_IMAGES = Object.keys(FALLBACK_MODULES)
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  .map((k) => FALLBACK_MODULES[k])

type Slide = { type: "image" | "video"; url: string }

export function ProjectorScreen({ className }: { className?: string }) {
  const [images, setImages] = useState<string[]>(FALLBACK_IMAGES)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
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
    // Optional admin-managed video, appended to the slideshow rotation.
    fetchHeroVideo()
      .then((v) => {
        if (active && v) setVideoUrl(v.url)
      })
      .catch(() => {
        /* no video set */
      })
    return () => {
      active = false
    }
  }, [])

  // Photos followed by the video (if one is set), as a single rotation.
  const slides = useMemo<Slide[]>(() => {
    const imgs = images.map((url) => ({ type: "image" as const, url }))
    return videoUrl ? [...imgs, { type: "video" as const, url: videoUrl }] : imgs
  }, [images, videoUrl])

  const current = slides[index % Math.max(slides.length, 1)]

  // Advance: photos auto-advance on a timer; the video advances when it ends
  // (so it always plays in full). A lone video just loops.
  useEffect(() => {
    if (slides.length <= 1) return
    if (current?.type === "video") return
    const t = setTimeout(
      () => setIndex((p) => (p + 1) % slides.length),
      3800
    )
    return () => clearTimeout(t)
  }, [index, slides, current])

  // Tilt the screen toward the mouse cursor, smoothed with springs.
  const screenRef = useRef<HTMLDivElement>(null)
  const rotateX = useSpring(0, { stiffness: 120, damping: 18 })
  const rotateY = useSpring(0, { stiffness: 120, damping: 18 })
  const isTouch = useIsTouch()

  // Desktop: follow the mouse cursor.
  useEffect(() => {
    if (isTouch) return
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
  }, [isTouch, rotateX, rotateY])

  // Touch devices: tilt with the phone's gyroscope. The first reading becomes
  // the neutral "holding" position, so ~±28° of physical tilt maps to the full
  // ±16° on-screen rotation regardless of how the phone is held.
  useEffect(() => {
    if (!isTouch) return
    const MAX = 16
    const SENS = 28 // degrees of phone tilt for a full swing
    const clamp = (v: number) => Math.max(-1, Math.min(1, v))
    let base: { beta: number; gamma: number } | null = null

    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return
      if (!base) base = { beta: e.beta, gamma: e.gamma }
      rotateY.set(clamp((e.gamma - base.gamma) / SENS) * MAX)
      rotateX.set(clamp(-(e.beta - base.beta) / SENS) * MAX)
    }

    // iOS 13+ gates motion sensors behind a permission prompt that must be
    // requested from a user gesture; Android/others just start firing.
    const DOE = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">
    }
    const start = () => window.addEventListener("deviceorientation", onOrient)

    let removeGesture: (() => void) | undefined
    if (typeof DOE.requestPermission === "function") {
      const onFirstTouch = () => {
        DOE.requestPermission?.()
          .then((res) => {
            if (res === "granted") start()
          })
          .catch(() => {})
        removeGesture?.()
      }
      window.addEventListener("touchend", onFirstTouch, { once: true })
      removeGesture = () =>
        window.removeEventListener("touchend", onFirstTouch)
    } else {
      start()
    }

    return () => {
      window.removeEventListener("deviceorientation", onOrient)
      removeGesture?.()
    }
  }, [isTouch, rotateX, rotateY])

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
          {current?.type === "video" ? (
            <motion.video
              key={current.url + index}
              src={current.url}
              autoPlay
              muted
              playsInline
              loop={slides.length === 1}
              onEnded={() => setIndex((p) => (p + 1) % slides.length)}
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
            />
          ) : current ? (
            <motion.img
              key={current.url + index}
              src={current.url}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
            />
          ) : null}
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
