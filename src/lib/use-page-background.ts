import { useEffect, useState } from "react"

import { fetchBackgrounds, type BackgroundSlot } from "@/lib/cms-api"

// Returns the admin-uploaded background image URL for `slot`, falling back to
// `fallback` (the page's bundled hero image) until/unless one is set in the CMS.
// Used by the public page heroes so they stay editable from /admin → Backgrounds.
export function usePageBackground(slot: BackgroundSlot, fallback: string): string {
  const [url, setUrl] = useState(fallback)

  useEffect(() => {
    let active = true
    fetchBackgrounds()
      .then((map) => {
        if (active && map[slot]) setUrl(map[slot])
      })
      .catch(() => {
        /* keep fallback */
      })
    return () => {
      active = false
    }
  }, [slot])

  return url
}
