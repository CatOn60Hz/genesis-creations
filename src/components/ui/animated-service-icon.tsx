import { motion, useReducedMotion, type Variants } from "framer-motion"
import {
  Clapperboard,
  Building2,
  Mic,
  RadioTower,
  type LucideProps,
} from "lucide-react"
import type { ComponentType } from "react"

// Animated service icons in the same shadcn / lucide-motion style as the course
// icons: each lucide glyph plays a short, on-brand gesture when its card is
// hovered or opened. Reduced motion collapses everything to static.
export type ServiceKind =
  | "media-production"
  | "studio-rental"
  | "studio-production"
  | "broadcasting"

const EASE_OUT = [0.23, 1, 0.32, 1] as const

const ICONS: Record<ServiceKind, ComponentType<LucideProps>> = {
  "media-production": Clapperboard,
  "studio-rental": Building2,
  "studio-production": Mic,
  broadcasting: RadioTower,
}

const VARIANTS: Record<ServiceKind, Variants> = {
  "media-production": { rest: { rotate: 0 }, active: { rotate: [0, -28, 12, 0] } }, // clapper snap
  "studio-rental": { rest: { scale: 1 }, active: { scale: [1, 1.1, 1] } }, // settle
  "studio-production": { rest: { scale: 1 }, active: { scale: [1, 1.16, 1] } }, // pulse
  broadcasting: { rest: { scale: 1 }, active: { scale: [1, 1.12, 1] } }, // signal
}

// Kinds that emit rippling rings while active (audio / signal).
const RINGS: ServiceKind[] = ["studio-production", "broadcasting"]

export function AnimatedServiceIcon({
  kind,
  active,
  className = "h-5 w-5",
}: {
  kind: ServiceKind
  active: boolean
  className?: string
}) {
  const reduce = useReducedMotion()
  const Icon = ICONS[kind]

  return (
    <span className="relative inline-flex items-center justify-center">
      {RINGS.includes(kind) && active && !reduce && (
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
      </motion.span>
    </span>
  )
}
