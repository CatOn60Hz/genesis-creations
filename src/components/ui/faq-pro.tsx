"use client"

import { ChevronDown } from "lucide-react"
// Project uses framer-motion (v12) — same API as motion/react.
import { motion } from "framer-motion"
import * as React from "react"

import { cn } from "@/lib/utils"

// Adapted for Genesis Creations: themed to the brand (dark glass rows, cream
// text, maroon accents) instead of the original light/dark token theme, and the
// search bar removed. The spring-driven expand/collapse animation is kept.

const PANEL_EASE = [0.16, 1, 0.3, 1] as const
const EXPAND_SPRING = {
  type: "spring" as const,
  stiffness: 150,
  damping: 26,
  mass: 1.05,
}
const COLLAPSE_SPRING = {
  type: "spring" as const,
  stiffness: 190,
  damping: 30,
  mass: 1.1,
}

export type FaqProItem = {
  id: string
  question: string
  answer: string
}

export type FaqProProps = {
  className?: string
  defaultOpenFirst?: boolean
  items: FaqProItem[]
}

type FaqProRowProps = {
  isOpen: boolean
  item: FaqProItem
  onToggle: () => void
  panelId: string
  triggerId: string
}

function FaqProRow({ isOpen, item, onToggle, panelId, triggerId }: FaqProRowProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 transition-colors",
        isOpen ? "bg-white/[0.07]" : "hover:bg-white/[0.07]"
      )}
    >
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-maroon/60 focus-visible:ring-inset"
        id={triggerId}
        onClick={onToggle}
        type="button"
      >
        <span className="font-display text-[16px] font-semibold leading-6 tracking-tight text-cream">
          {item.question}
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            "mt-0.5 size-4 shrink-0 text-maroon transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <motion.div
        animate={{ height: isOpen ? "auto" : 0 }}
        aria-labelledby={triggerId}
        className="overflow-hidden"
        id={panelId}
        initial={false}
        role="region"
        transition={{ height: isOpen ? EXPAND_SPRING : COLLAPSE_SPRING }}
      >
        <motion.div
          animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -6 }}
          aria-hidden={!isOpen}
          className="px-5 pb-5 text-[14px] leading-6 text-cream/70"
          initial={false}
          transition={{
            opacity: {
              duration: isOpen ? 0.38 : 0.2,
              ease: PANEL_EASE,
              delay: isOpen ? 0.06 : 0,
            },
            y: isOpen ? EXPAND_SPRING : COLLAPSE_SPRING,
          }}
        >
          {item.answer}
        </motion.div>
      </motion.div>
    </div>
  )
}

function FaqPro({ className, defaultOpenFirst = false, items }: FaqProProps) {
  const listId = React.useId()
  const [openId, setOpenId] = React.useState<string | null>(() =>
    defaultOpenFirst && items[0] ? items[0].id : null
  )

  const toggleItem = React.useCallback((id: string) => {
    setOpenId((current) => (current === id ? null : id))
  }, [])

  return (
    <div className={cn("mx-auto flex w-full max-w-2xl flex-col gap-2.5", className)}>
      {items.map((item) => (
        <FaqProRow
          key={item.id}
          isOpen={openId === item.id}
          item={item}
          onToggle={() => toggleItem(item.id)}
          panelId={`${listId}-${item.id}-panel`}
          triggerId={`${listId}-${item.id}-trigger`}
        />
      ))}
    </div>
  )
}
FaqPro.displayName = "FaqPro"

export { FaqPro }
