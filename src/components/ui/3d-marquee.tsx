/**
 * @author: @emerald-ui
 * @description: A 3D marquee component that scrolls images through a tilted grid.
 * @license: MIT
 * @website: https://emerald-ui.com
 *
 * Adapted for Genesis Kreations: wider field so it fills the side edges, and a
 * continuous seamless loop (columns scroll endlessly, alternating direction)
 * instead of the original bounce. Uses the shared `cn` helper from @/lib/utils.
 */
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

interface ThreeDMarqueeProps {
  images: string[]
  className?: string
}

// Fewer columns = bigger tiles; the large scale keeps the field reaching every
// corner.
const COLUMNS = 5

const ThreeDMarquee = ({ images, className }: ThreeDMarqueeProps) => {
  const chunkSize = Math.max(1, Math.ceil(images.length / COLUMNS))
  const chunks = Array.from({ length: COLUMNS }, (_, colIndex) => {
    const start = colIndex * chunkSize
    return images.slice(start, start + chunkSize)
  })

  return (
    <div
      className={cn(
        // Fills its container by default — the gallery uses it as a full-bleed
        // hero background, so a fixed height would leave dead space (notably the
        // black band below the fold on phones). Pass a height via `className` for
        // standalone use.
        "mx-auto block h-full w-full overflow-hidden rounded-md",
        className
      )}
    >
      <div className="flex size-full items-center justify-center">
        {/* Scaled up large so the tilted square bleeds past all four corners,
            leaving no black triangles. */}
        {/* On phones the viewport is tall and narrow, so the tilted field has
            to be a big square (not size-full) and scaled up hard, otherwise the
            diamond can't reach the bottom of the full-height hero and leaves a
            black band below the fold. */}
        <div className="aspect-square size-200 shrink-0 scale-[2.1] max-xl:size-full max-xl:scale-[1.7] max-sm:size-[42rem] max-sm:scale-[2.4]">
          <div
            style={{ transform: "rotateX(45deg) rotateY(0deg) rotateZ(45deg)" }}
            className="relative top-0 right-[-50%] grid size-full origin-top-left grid-cols-5 gap-4 transform-3d max-xl:-top-30 max-xl:right-[-45%] max-sm:top-0 max-sm:gap-2"
          >
            {chunks.map((subarray, colIndex) => {
              // Duplicate the column so the linear scroll loops seamlessly:
              // moving by exactly half the height lands back on a copy.
              const loop = [...subarray, ...subarray]
              const goingUp = colIndex % 2 === 0
              return (
                <motion.figure
                  key={colIndex + "marquee"}
                  animate={{ y: goingUp ? ["0%", "-50%"] : ["-50%", "0%"] }}
                  transition={{
                    // Higher = slower. Each column a touch different for variety.
                    duration: 100 + colIndex * 10,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "linear",
                  }}
                  className="flex flex-col items-start gap-6 max-sm:gap-3"
                >
                  {loop.map((src, imageIndex) => (
                    <div className="relative" key={imageIndex + src}>
                      <img
                        className="aspect-4/3 h-full w-full rounded-lg bg-neutral-100 object-cover select-none dark:bg-neutral-900"
                        src={src}
                        draggable={false}
                        alt={`Gallery image ${(imageIndex % subarray.length) + 1}`}
                      />
                    </div>
                  ))}
                </motion.figure>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThreeDMarquee
