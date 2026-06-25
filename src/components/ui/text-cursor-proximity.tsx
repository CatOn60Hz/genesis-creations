"use client"

import React, { type CSSProperties, forwardRef, useRef } from "react"
// Project uses framer-motion (v12); same API as `motion/react`.
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useTransform,
  type MotionStyle,
} from "framer-motion"

import { useMousePositionRef } from "@/hooks/use-mouse-position-ref"

// Helper type that makes all properties of CSSProperties accept number | string
type CSSPropertiesWithValues = {
  [K in keyof CSSProperties]: string | number
}

interface StyleValue<T extends keyof CSSPropertiesWithValues> {
  from: CSSPropertiesWithValues[T]
  to: CSSPropertiesWithValues[T]
}

interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string
  styles: Partial<{
    [K in keyof CSSPropertiesWithValues]: StyleValue<K>
  }>
  containerRef: React.RefObject<HTMLDivElement | null>
  radius?: number
  falloff?: "linear" | "exponential" | "gaussian"
}

const TextCursorProximity = forwardRef<HTMLSpanElement, TextProps>(
  (
    {
      label,
      styles,
      containerRef,
      radius = 50,
      falloff = "linear",
      className,
      onClick,
      ...props
    },
    ref
  ) => {
    const letterRefs = useRef<(HTMLSpanElement | null)[]>([])
    const mousePositionRef = useMousePositionRef(containerRef)

    // Create a motion value for each letter's proximity.
    // Safe because `label` (and therefore the letter count) is stable.
    const letterProximities = useRef(
      Array(label.replace(/\s/g, "").length)
        .fill(0)
        // eslint-disable-next-line react-hooks/rules-of-hooks
        .map(() => useMotionValue(0))
    )

    const calculateDistance = (
      x1: number,
      y1: number,
      x2: number,
      y2: number
    ): number => {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
    }

    const calculateFalloff = (distance: number): number => {
      const normalizedDistance = Math.min(Math.max(1 - distance / radius, 0), 1)

      switch (falloff) {
        case "exponential":
          return Math.pow(normalizedDistance, 2)
        case "gaussian":
          return Math.exp(-Math.pow(distance / (radius / 2), 2) / 2)
        case "linear":
        default:
          return normalizedDistance
      }
    }

    useAnimationFrame(() => {
      if (!containerRef.current) return
      const containerRect = containerRef.current.getBoundingClientRect()

      letterRefs.current.forEach((letterRef, index) => {
        if (!letterRef) return

        const rect = letterRef.getBoundingClientRect()
        const letterCenterX = rect.left + rect.width / 2 - containerRect.left
        const letterCenterY = rect.top + rect.height / 2 - containerRect.top

        const distance = calculateDistance(
          mousePositionRef.current.x,
          mousePositionRef.current.y,
          letterCenterX,
          letterCenterY
        )

        const proximity = calculateFalloff(distance)
        letterProximities.current[index].set(proximity)
      })
    })

    const words = label.split(" ")
    let letterIndex = 0

    return (
      <span
        ref={ref}
        className={`${className ?? ""} inline`}
        onClick={onClick}
        {...props}
      >
        {words.map((word, wordIndex) => (
          <span key={wordIndex} className="inline-block whitespace-nowrap">
            {word.split("").map((letter) => {
              const currentLetterIndex = letterIndex++
              const proximity = letterProximities.current[currentLetterIndex]

              // Create transformed values for each style property.
              const transformedStyles = Object.entries(styles).reduce(
                (acc, [key, value]) => {
                  const v = value as StyleValue<keyof CSSPropertiesWithValues>
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  acc[key] = useTransform(proximity, [0, 1], [v.from, v.to])
                  return acc
                },
                {} as Record<string, unknown>
              )

              return (
                <motion.span
                  key={currentLetterIndex}
                  ref={(el: HTMLSpanElement | null) => {
                    letterRefs.current[currentLetterIndex] = el
                  }}
                  className="inline-block"
                  aria-hidden="true"
                  style={transformedStyles as MotionStyle}
                >
                  {letter}
                </motion.span>
              )
            })}
            {wordIndex < words.length - 1 && (
              <span className="inline-block">&nbsp;</span>
            )}
          </span>
        ))}
        <span className="sr-only">{label}</span>
      </span>
    )
  }
)

TextCursorProximity.displayName = "TextCursorProximity"
export default TextCursorProximity
