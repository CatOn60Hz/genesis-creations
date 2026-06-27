import { motion, useReducedMotion, type Variants } from "framer-motion"
import {
  Camera,
  Video,
  Palette,
  Scissors,
  PlaneTakeoff,
  Mic,
  Headphones,
  GraduationCap,
  type LucideProps,
} from "lucide-react"
import type { ComponentType } from "react"

// Animated icons in the shadcn / lucide-motion style: each lucide glyph is
// wrapped in a Motion span and plays a short, on-brand gesture when its card is
// hovered or opened (`active`). Reduced motion collapses everything to static.
export type CourseKind =
  | "photography"
  | "videography"
  | "graphic-design"
  | "video-editing"
  | "drone"
  | "live-sound"
  | "studio-recording"
  | "diploma"

const EASE_OUT = [0.23, 1, 0.32, 1] as const

const ICONS: Record<CourseKind, ComponentType<LucideProps>> = {
  photography: Camera,
  videography: Video,
  "graphic-design": Palette,
  "video-editing": Scissors,
  drone: PlaneTakeoff,
  "live-sound": Mic,
  "studio-recording": Headphones,
  diploma: GraduationCap,
}

// `active` plays the gesture; `rest` is the idle pose.
const VARIANTS: Record<CourseKind, Variants> = {
  photography: { rest: { scale: 1 }, active: { scale: [1, 0.78, 1.06, 1] } }, // shutter
  videography: { rest: { scale: 1 }, active: { scale: [1, 1.14, 1] } }, // zoom
  "graphic-design": { rest: { rotate: 0 }, active: { rotate: [0, -14, 14, 0] } }, // wiggle
  "video-editing": { rest: { rotate: 0 }, active: { rotate: [0, -30, 12, 0] } }, // snip
  drone: {
    rest: { y: 0, rotate: 0 },
    active: { y: [0, -5, 0], rotate: [0, -8, 4, 0] }, // take off
  },
  "live-sound": { rest: { scale: 1 }, active: { scale: [1, 1.16, 1] } }, // pulse
  "studio-recording": { rest: { y: 0 }, active: { y: [0, -4, 0] } }, // bob
  diploma: { rest: { rotate: 0 }, active: { rotate: [0, -10, 8, 0] } }, // cap toss
}

export function AnimatedCourseIcon({
  kind,
  active,
  className = "h-5 w-5",
}: {
  kind: CourseKind
  active: boolean
  className?: string
}) {
  const reduce = useReducedMotion()
  const Icon = ICONS[kind]

  return (
    <span className="relative inline-flex items-center justify-center">
      {/* Sound rings ripple out while a live-sound card is active. */}
      {kind === "live-sound" && active && !reduce && (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full border border-current"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.9, opacity: 0 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
        />
      )}

      <motion.span
        className="relative inline-flex"
        variants={reduce ? undefined : VARIANTS[kind]}
        animate={reduce ? undefined : active ? "active" : "rest"}
        transition={{ duration: 0.6, ease: EASE_OUT }}
      >
        <Icon className={className} />

        {/* Blinking record dot while a videography card is active. */}
        {kind === "videography" && active && !reduce && (
          <motion.span
            aria-hidden
            className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-red-500"
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.span>
    </span>
  )
}
