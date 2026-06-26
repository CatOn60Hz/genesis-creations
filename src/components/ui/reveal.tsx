import * as React from "react"
import { motion, useReducedMotion, type Variants } from "framer-motion"

// Soft, gentle deceleration (easeOutQuint). Paired with a blur-focus and a
// small travel, entrances feel calm and premium rather than snappy.
const EASE_OUT = [0.16, 1, 0.3, 1] as const

interface RevealProps {
  children: React.ReactNode
  /** Seconds to delay the animation after the element enters the viewport. */
  delay?: number
  className?: string
  /**
   * When true, the element fades/blurs back out as it leaves the viewport and
   * in again on return (good for the snap-scroll slideshow). Default is a
   * one-shot reveal that stays put.
   */
  repeat?: boolean
}

/** Softly fades + blurs + drifts its children into focus as they scroll in. */
export function Reveal({ children, delay = 0, className, repeat = false }: RevealProps) {
  // Reduced motion: keep a plain fade, drop the movement and blur.
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        y: reduce ? 0 : 24,
        filter: reduce ? "blur(0px)" : "blur(12px)",
      }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: !repeat, amount: 0.2 }}
      transition={{ duration: 1.05, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  )
}

/* --------------------------- Staggered reveal --------------------------- */

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.08 },
  },
}

/**
 * Reveals a group of children one-by-one as the group scrolls into view.
 * Pair with <RevealItem> for each child. The cascade reads as more deliberate
 * than everything appearing at once; keep the per-item delay short (30–80ms).
 */
export function RevealStagger({ children, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  )
}

/** A single child of <RevealStagger>; inherits the parent's stagger timing. */
export function RevealItem({ children, className }: RevealProps) {
  const reduce = useReducedMotion()
  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: reduce ? 0 : 14,
      filter: reduce ? "blur(0px)" : "blur(8px)",
    },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: EASE_OUT },
    },
  }
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  )
}
