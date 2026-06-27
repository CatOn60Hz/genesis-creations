import { useEffect, useState } from "react"

// True on coarse-pointer devices (phones, most tablets). We use this to skip
// mouse-only effects and heavy per-frame animations on touch devices, which is
// what made the site lag on phones. `(pointer: coarse)` is more reliable than a
// width breakpoint — it keys off the actual input device, not the window size.
const QUERY = "(pointer: coarse)"

function getIsTouch(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false
  return window.matchMedia(QUERY).matches
}

export function useIsTouch(): boolean {
  const [isTouch, setIsTouch] = useState(getIsTouch)

  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const onChange = () => setIsTouch(mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  return isTouch
}
