import { motion, useReducedMotion, type Variants } from "framer-motion"
import type { ReactNode } from "react"

// Each skill icon animates in a way that matches what it represents when its
// tile is toggled on: the bulb lights up yellow, the aperture spins, the mic
// emits rings, the scissors snip, and so on. Reduced motion is honored.
export type SkillKind =
  | "camera"
  | "lighting"
  | "audio"
  | "editing"
  | "video"
  | "photo"
  | "aerial"
  | "drone"

const EASE_OUT = [0.23, 1, 0.32, 1] as const

// `on` plays when the tile is toggled active; `off` is the rest state.
const VARIANTS: Record<SkillKind, Variants> = {
  camera: { off: { scale: 1 }, on: { scale: [1, 0.78, 1] } }, // shutter
  lighting: { off: { scale: 1 }, on: { scale: [1, 1.25, 1] } },
  audio: { off: { scale: 1 }, on: { scale: [1, 1.15, 1] } },
  editing: { off: { rotate: 0 }, on: { rotate: [0, -32, 14, 0] } }, // snip
  video: { off: { scale: 1 }, on: { scale: [1, 1.15, 1] } },
  photo: { off: { rotate: 0 }, on: { rotate: 180 } }, // aperture spin (holds)
  aerial: {
    off: { x: 0, y: 0, rotate: 0 },
    on: { x: [0, 8, -4, 0], y: [0, -6, 3, 0], rotate: [0, 12, -6, 0] },
  },
  drone: { off: { y: 0 }, on: { y: [0, -6, 0] } }, // hover bob
}

// Persistent colour/glow while the tile stays toggled on.
const ACTIVE_TINT: Partial<Record<SkillKind, string>> = {
  lighting: "text-yellow-300 [filter:drop-shadow(0_0_10px_rgba(253,224,71,0.85))]",
  video: "text-red-400",
}

export function AnimatedSkillIcon({
  kind,
  active,
  children,
}: {
  kind: SkillKind
  active: boolean
  children: ReactNode
}) {
  const reduce = useReducedMotion()

  return (
    <span className="relative inline-flex items-center justify-center">
      {/* Sound rings while audio is active. */}
      {kind === "audio" && active && !reduce && (
        <>
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full border border-current"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.9, opacity: 0 }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full border border-current"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.9, opacity: 0 }}
            transition={{
              duration: 1.1,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.55,
            }}
          />
        </>
      )}

      <motion.span
        className={`relative inline-flex transition-[color,filter] duration-300 ${
          active ? ACTIVE_TINT[kind] ?? "" : ""
        }`}
        variants={reduce ? undefined : VARIANTS[kind]}
        animate={reduce ? undefined : active ? "on" : "off"}
        transition={{ duration: 0.5, ease: EASE_OUT }}
      >
        {children}

        {/* Blinking record dot while video is active. */}
        {kind === "video" && active && (
          <motion.span
            aria-hidden
            className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500"
            animate={reduce ? undefined : { opacity: [1, 0.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.span>
    </span>
  )
}
