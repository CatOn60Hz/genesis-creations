import * as React from "react"
import { motion } from "framer-motion"

interface RevealProps {
  children: React.ReactNode
  /** Seconds to delay the animation after the element enters the viewport. */
  delay?: number
  className?: string
}

/** Fades + slides its children up the first time they scroll into view. */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
