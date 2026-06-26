import { useRef, type ReactNode } from "react"
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion"

// A tile that gently pulls toward the cursor (magnetic micro-physics) and
// springs back on leave, plus a lift on hover and a press on tap. Cursor
// tracking runs through motion values — never useState — so it stays smooth
// and off the React render path. Honors prefers-reduced-motion.
export function MagneticTile({
  children,
  className,
  strength = 0.18,
}: {
  children: ReactNode
  className?: string
  /** How strongly the tile follows the cursor (0 = none, ~0.3 = strong). */
  strength?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const spring = { stiffness: 150, damping: 15, mass: 0.3 }
  const sx = useSpring(x, spring)
  const sy = useSpring(y, spring)

  const handleMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength)
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength)
  }

  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={reduce ? undefined : { x: sx, y: sy }}
      whileHover={reduce ? undefined : { scale: 1.03 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
