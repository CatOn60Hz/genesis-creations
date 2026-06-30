import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence, useSpring } from "framer-motion"
import { Volume2, VolumeX } from "lucide-react"

import { cn } from "@/lib/utils"
import { fetchProjectorItems, type ProjectorItem } from "@/lib/cms-api"
import { useIsTouch } from "@/components/hooks/use-is-touch"

/* ----------------------------- YouTube player ---------------------------- */

// Load the YouTube IFrame API once (shared promise). Resolves immediately once
// window.YT is ready, so multiple players reuse the same script.
let ytApiPromise: Promise<void> | null = null
function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve()
  const w = window as unknown as {
    YT?: { Player: unknown }
    onYouTubeIframeAPIReady?: () => void
  }
  if (w.YT && w.YT.Player) return Promise.resolve()
  if (ytApiPromise) return ytApiPromise
  ytApiPromise = new Promise<void>((resolve) => {
    const prev = w.onYouTubeIframeAPIReady
    w.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve()
    }
    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    document.head.appendChild(tag)
  })
  return ytApiPromise
}

// A chrome-less YouTube player styled to match the projector: autoplays muted,
// no controls, and reports when it ends so the slideshow can advance. A lone
// video loops instead of ending. Mute follows the shared `muted` state.
function ProjectorYouTube({
  videoId,
  muted,
  single,
  onEnded,
}: {
  videoId: string
  muted: boolean
  single: boolean
  onEnded: () => void
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null)
  const onEndedRef = useRef(onEnded)
  onEndedRef.current = onEnded

  useEffect(() => {
    let destroyed = false
    loadYouTubeApi().then(() => {
      if (destroyed || !hostRef.current) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const YT = (window as any).YT
      playerRef.current = new YT.Player(hostRef.current, {
        width: "100%",
        height: "100%",
        videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          rel: 0,
          playsinline: 1,
          modestbranding: 1,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          loop: single ? 1 : 0,
          playlist: single ? videoId : undefined,
        },
        events: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onReady: (e: any) => {
            muted ? e.target.mute() : e.target.unMute()
            e.target.playVideo()
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onStateChange: (e: any) => {
            if (e.data === 0 && !single) onEndedRef.current() // 0 = ENDED
          },
        },
      })
    })
    return () => {
      destroyed = true
      try {
        playerRef.current?.destroy()
      } catch {
        /* ignore */
      }
      playerRef.current = null
    }
  }, [videoId, single]) // eslint-disable-line react-hooks/exhaustive-deps

  // Apply mute changes from the shared control.
  useEffect(() => {
    const p = playerRef.current
    if (p?.mute) muted ? p.mute() : p.unMute()
  }, [muted])

  return (
    <div className="absolute inset-0 h-full w-full">
      <div ref={hostRef} className="h-full w-full" />
    </div>
  )
}

// Bundled fallback so the projector is never blank (used in dev where PHP isn't
// running, or before the backend responds). Managed set lives in the backend.
const FALLBACK_MODULES = import.meta.glob<string>(
  "@/assets/gallery/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
  { eager: true, import: "default" }
)
const FALLBACK_ITEMS: ProjectorItem[] = Object.keys(FALLBACK_MODULES)
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  .map((k) => ({ name: k, type: "photo", url: FALLBACK_MODULES[k] }))

// Admin-uploaded photos come through media.php, which can downscale on the fly
// (?w=). Hand the browser a srcset so phones fetch a ~600px image instead of the
// full upload — a big LCP win. Bundled fallbacks (Vite assets) are left as-is.
const SRCSET_WIDTHS = [480, 768, 1200, 1600]
function projectorSrcSet(url: string): string | undefined {
  return url.includes("media.php")
    ? SRCSET_WIDTHS.map((w) => `${url}&w=${w} ${w}w`).join(", ")
    : undefined
}

export function ProjectorScreen({ className }: { className?: string }) {
  const [slides, setSlides] = useState<ProjectorItem[]>(FALLBACK_ITEMS)
  const [index, setIndex] = useState(0)
  // Videos autoplay muted (browser policy); the viewer can unmute.
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    let active = true
    fetchProjectorItems()
      .then((list) => {
        if (active && list.length) setSlides(list)
      })
      .catch(() => {
        /* keep fallback */
      })
    return () => {
      active = false
    }
  }, [])

  const current = slides[index % Math.max(slides.length, 1)]
  // Both uploaded videos and YouTube items can carry sound, so the mute control
  // shows when either is present.
  const hasVideo = useMemo(
    () => slides.some((s) => s.type === "video" || s.type === "youtube"),
    [slides]
  )

  // React doesn't reliably reflect the `muted` prop onto the video DOM property,
  // so set it imperatively whenever the mute state or active slide changes.
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted
  }, [muted, current])

  // Advance: photos auto-advance on a timer; videos (uploaded or YouTube)
  // advance when they end, so each plays in full. A lone video just loops.
  useEffect(() => {
    if (slides.length <= 1) return
    if (current?.type === "video" || current?.type === "youtube") return
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
              key={current.name + index}
              ref={videoRef}
              src={current.url}
              autoPlay
              // Always mount muted so autoplay is allowed; the effect below
              // applies the viewer's unmute choice once playback has started.
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
          ) : current?.type === "youtube" ? (
            <motion.div
              key={current.name + index}
              className="absolute inset-0 h-full w-full"
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
            >
              <ProjectorYouTube
                videoId={current.videoId}
                muted={muted}
                single={slides.length === 1}
                onEnded={() => setIndex((p) => (p + 1) % slides.length)}
              />
            </motion.div>
          ) : current ? (
            <motion.img
              key={current.name + index}
              src={current.url}
              srcSet={projectorSrcSet(current.url)}
              sizes="(max-width: 768px) 100vw, 60vw"
              alt="Genesis Kreations media production work"
              draggable={false}
              fetchPriority="high"
              decoding="async"
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

        {/* Mute / unmute — shown when the slideshow includes a video. Videos
            start muted (autoplay policy); tap to hear sound. */}
        {hasVideo && (
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Unmute video" : "Mute video"}
            className="pointer-events-auto absolute bottom-3 right-3 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-cream backdrop-blur transition-colors hover:bg-maroon"
          >
            {muted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
        )}
      </motion.div>
    </div>
  )
}
