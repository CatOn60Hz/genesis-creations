import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Play, X } from "lucide-react"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Grain } from "@/components/ui/grain"
import { Reveal } from "@/components/ui/reveal"
import { type ReelItem } from "@/lib/cms-api"

// A horizontal wall of short vertical videos ("reels"). Cards show the video's
// first frame; tapping one opens a lightbox that plays it full-size with sound.
// Content is self-hosted and managed in /admin → Reels. The parent (home.tsx)
// fetches the videos and only mounts this section when there are some, so it can
// register as a snap target and there's no empty stop when the wall is empty.
const Reels: React.FC<{ items: ReelItem[] }> = ({ items }) => {
  const [active, setActive] = useState<ReelItem | null>(null)

  // Close the lightbox on Escape and lock background scroll while it's open.
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null)
    window.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [active])

  if (items.length === 0) return null

  return (
    <section
      id="reels"
      className="gc-dark-section gc-sep relative flex min-h-dvh flex-col justify-center overflow-hidden px-6 py-16 text-cream"
    >
      <Grain />
      <Reveal repeat className="relative z-10 mx-auto mb-10 max-w-6xl text-center">
        <h2 className="font-display text-4xl font-bold tracking-tighter text-cream md:text-6xl">
          Watch our latest <span className="text-maroon">reels</span>
        </h2>
      </Reveal>

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <Carousel
          opts={{ align: "start", dragFree: true, loop: items.length > 3 }}
          className="px-1"
        >
          <CarouselContent className="-ml-3">
            {items.map((reel) => (
              <CarouselItem
                key={reel.name}
                className="basis-[58%] pl-3 sm:basis-[40%] md:basis-[30%] lg:basis-[23%] xl:basis-[19%]"
              >
                <button
                  type="button"
                  onClick={() => setActive(reel)}
                  aria-label="Play video"
                  className="group relative block aspect-[9/16] w-full overflow-hidden rounded-2xl bg-black ring-1 ring-white/10 transition-[transform,box-shadow,ring-color] duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_-12px_rgba(203,41,87,0.55)] hover:ring-maroon/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon"
                >
                  {/* First frame as the thumbnail; #t hint nudges browsers that
                      otherwise render a blank poster. */}
                  <video
                    src={`${reel.url}#t=0.1`}
                    muted
                    playsInline
                    preload="metadata"
                    tabIndex={-1}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-maroon/90 text-cream shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                      <Play className="ml-0.5 h-6 w-6 fill-current" />
                    </span>
                  </span>
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden border-white/15 bg-black/40 text-cream hover:bg-maroon hover:text-cream sm:flex" />
          <CarouselNext className="hidden border-white/15 bg-black/40 text-cream hover:bg-maroon hover:text-cream sm:flex" />
        </Carousel>
      </div>

      {/* Lightbox player */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
          >
            <button
              type="button"
              onClick={() => setActive(null)}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-cream transition-colors hover:bg-maroon"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.video
              key={active.name}
              src={active.url}
              autoPlay
              controls
              playsInline
              onClick={(e) => e.stopPropagation()}
              className="max-h-[88vh] w-auto max-w-full rounded-2xl bg-black shadow-2xl aspect-[9/16] object-contain"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export { Reels }
