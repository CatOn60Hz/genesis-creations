import { useState, useEffect, useRef } from "react"
import { motion, useMotionValue, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"
import { useScreenSize } from "@/components/hooks/use-screen-size"

import photo28 from "@/assets/showcase/28.jpg"
import photo27 from "@/assets/showcase/27.jpg"
import photo20 from "@/assets/showcase/20.jpg"
import photo32 from "@/assets/showcase/32.jpg"
import photo33 from "@/assets/showcase/33.jpg"
import photo1 from "@/assets/showcase/1.jpg"
import photo46 from "@/assets/showcase/46.jpg"
import photo24 from "@/assets/showcase/24.jpg"

type Direction = "left" | "right"

type GalleryPhoto = {
  id: number
  order: number
  /** Horizontal offset from centre, in px at desktop scale. */
  x: number
  /** Vertical offset, in px at desktop scale. */
  y: number
  zIndex: number
  direction: Direction
  src: string
}

// The Genesis Creations shots, fanned out left-to-right. Eight photos packed
// into the same overall width the original five used (more overlap).
const PHOTOS: GalleryPhoto[] = [
  { id: 1, order: 0, x: -200, y: 10, zIndex: 80, direction: "left", src: photo28 },
  { id: 2, order: 1, x: -143, y: 24, zIndex: 70, direction: "left", src: photo27 },
  { id: 3, order: 2, x: -86, y: 6, zIndex: 60, direction: "right", src: photo20 },
  { id: 4, order: 3, x: -29, y: 18, zIndex: 50, direction: "right", src: photo32 },
  { id: 5, order: 4, x: 29, y: 8, zIndex: 40, direction: "left", src: photo33 },
  { id: 6, order: 5, x: 86, y: 26, zIndex: 30, direction: "right", src: photo1 },
  { id: 7, order: 6, x: 143, y: 14, zIndex: 20, direction: "left", src: photo46 },
  { id: 8, order: 7, x: 200, y: 30, zIndex: 10, direction: "right", src: photo24 },
]

export const PhotoGallery = ({
  animationDelay = 0.5,
  className,
  caption,
}: {
  animationDelay?: number
  className?: string
  caption?: string
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [openSrc, setOpenSrc] = useState<string | null>(null)

  // On phones the fan must shrink and tuck in or it spills off both edges.
  const isMobile = useScreenSize().lessThan("md")
  const photoSize = isMobile ? 104 : 150
  const xScale = isMobile ? 0.46 : 1
  const yScale = isMobile ? 0.6 : 1
  const areaHeight = isMobile ? 130 : 165

  // Close the lightbox on Escape, and lock body scroll while it's open.
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

  useEffect(() => {
    // First make the container visible with a fade-in
    const visibilityTimer = setTimeout(() => {
      setIsVisible(true)
    }, animationDelay * 1000)

    // Then start the photo animations after a short delay
    const animationTimer = setTimeout(
      () => {
        setIsLoaded(true)
      },
      (animationDelay + 0.4) * 1000
    ) // Add 0.4s for the opacity transition

    return () => {
      clearTimeout(visibilityTimer)
      clearTimeout(animationTimer)
    }
  }, [animationDelay])

  // Animation variants for the container
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  }

  // Animation variants for each photo
  const photoVariants = {
    hidden: () => ({
      x: 0,
      y: 0,
      rotate: 0,
      scale: 1,
    }),
    visible: (custom: { x: number; y: number; order: number }) => ({
      x: custom.x,
      y: custom.y,
      rotate: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 70,
        damping: 12,
        mass: 1,
        delay: custom.order * 0.15,
      },
    }),
  }

  return (
    <div className={cn("relative", className)}>
      {caption && (
        <motion.p
          className="mb-3 text-center text-sm uppercase tracking-[0.3em] text-black/70 md:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        >
          {caption}
        </motion.p>
      )}
      <div
        className="relative flex w-full items-center justify-center"
        style={{ height: areaHeight }}
      >
        <motion.div
          className="relative mx-auto flex w-full justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <motion.div
            className="relative flex w-full justify-center"
            variants={containerVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
          >
            <div className="relative" style={{ height: photoSize, width: photoSize }}>
              {/* Render photos in reverse order so higher z-index photos come later in the DOM */}
              {[...PHOTOS].reverse().map((photo) => (
                <motion.div
                  key={photo.id}
                  className="absolute left-0 top-0"
                  style={{ zIndex: photo.zIndex }}
                  variants={photoVariants}
                  custom={{
                    x: photo.x * xScale,
                    y: photo.y * yScale,
                    order: photo.order,
                  }}
                >
                  <Photo
                    width={photoSize}
                    height={photoSize}
                    src={photo.src}
                    alt="Genesis Creations"
                    direction={photo.direction}
                    onOpen={() => setOpenSrc(photo.src)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

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
    </div>
  )
}

function getRandomNumberInRange(min: number, max: number): number {
  if (min >= max) {
    throw new Error("Min value should be less than max value")
  }
  return Math.random() * (max - min) + min
}

export const Photo = ({
  src,
  alt,
  className,
  direction,
  width,
  height,
  onOpen,
}: {
  src: string
  alt: string
  className?: string
  direction?: Direction
  width: number
  height: number
  onOpen?: () => void
}) => {
  const [rotation, setRotation] = useState<number>(0)
  const x = useMotionValue(200)
  const y = useMotionValue(200)
  // Tracks whether the last pointer interaction was a drag, so we don't
  // open the lightbox when the user was just dragging the photo around.
  const draggedRef = useRef(false)

  useEffect(() => {
    const randomRotation =
      getRandomNumberInRange(1, 4) * (direction === "left" ? -1 : 1)
    setRotation(randomRotation)
  }, [direction])

  function handleMouse(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    x.set(event.clientX - rect.left)
    y.set(event.clientY - rect.top)
  }

  const resetMouse = () => {
    x.set(200)
    y.set(200)
  }

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onPointerDownCapture={() => {
        draggedRef.current = false
      }}
      onDragStart={() => {
        draggedRef.current = true
      }}
      whileTap={{ scale: 1.2, zIndex: 9999 }}
      whileHover={{
        scale: 1.1,
        rotateZ: 2 * (direction === "left" ? -1 : 1),
        zIndex: 9999,
      }}
      whileDrag={{
        scale: 1.1,
        zIndex: 9999,
      }}
      initial={{ rotate: 0 }}
      animate={{ rotate: rotation }}
      style={{
        width,
        height,
        perspective: 400,
        transform: `rotate(0deg) rotateX(0deg) rotateY(0deg)`,
        zIndex: 1,
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
        touchAction: "none",
      }}
      className={cn(
        className,
        "relative mx-auto shrink-0 cursor-pointer active:cursor-grabbing"
      )}
      onMouseMove={handleMouse}
      onMouseLeave={resetMouse}
      onClickCapture={() => {
        // If this click came right after a drag, swallow it and reset.
        if (draggedRef.current) {
          draggedRef.current = false
          return
        }
        onOpen?.()
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onOpen?.()
        }
      }}
      role="button"
      draggable={false}
      tabIndex={0}
    >
      <div className="relative h-full w-full overflow-hidden rounded-3xl shadow-md ring-1 ring-black/5">
        <motion.img
          className="absolute inset-0 h-full w-full rounded-3xl object-cover"
          src={src}
          alt={alt}
          draggable={false}
        />
      </div>
    </motion.div>
  )
}
