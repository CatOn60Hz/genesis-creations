import { useEffect, useRef, useState } from "react"
import { ReactLenis, type LenisRef } from "lenis/react"
import Snap from "lenis/snap"

import { Hero } from "@/components/sections/hero"
import { About } from "@/components/sections/about"
import { Services } from "@/components/sections/services"
import { Courses } from "@/components/sections/courses"
import { Reels } from "@/components/sections/reels"
import { Testimonials } from "@/components/sections/testimonials"
import { SiteFooter } from "@/components/sections/site-footer"
import { Reveal } from "@/components/ui/reveal"
import { BeamsBackground } from "@/components/ui/beams-background"
import { useIsTouch } from "@/components/hooks/use-is-touch"
import { fetchReels, type ReelItem } from "@/lib/cms-api"

import { SEO } from "@/components/seo"

const Home: React.FC = () => {
  const lenisRef = useRef<LenisRef>(null)
  // Self-hosted "reels" videos. Fetched here (not in the section) so the section
  // only mounts when there are some — that keeps it out of the snap sequence
  // when empty, and lets the snap setup below re-register once they load in.
  const [reels, setReels] = useState<ReelItem[]>([])
  // Lenis's per-frame layout reads were the dominant scroll-jank cost on phones
  // (~1.4s of forced reflow, measured). Touch already scrolls smoothly natively,
  // so render a plain scroll container there and skip Lenis + the JS snap.
  const isTouch = useIsTouch()

  useEffect(() => {
    let alive = true
    fetchReels()
      .then((r) => alive && setReels(r))
      .catch(() => {
        /* no reels section if the fetch fails */
      })
    return () => {
      alive = false
    }
  }, [])

  // Lenis drives the smooth wheel/trackpad scrolling; its Snap addon locks each
  // section to the top of the viewport. `lock` advances one section at a time
  // (slideshow style) so the scroll always stops on a full page and can't skip
  // past several at once. `duration` + `easing` make that a smooth eased glide.
  // Desktop only — on touch Lenis is disabled so there's no instance to snap.
  useEffect(() => {
    if (isTouch) return
    const lenis = lenisRef.current?.lenis
    if (!lenis) return

    const snap = new Snap(lenis, {
      type: "lock",
      duration: 1,
      easing: (t) => 1 - Math.pow(1 - t, 3), // easeOutCubic
    })
    snap.addElements(
      Array.from(document.querySelectorAll<HTMLElement>(".snap-section")),
      { align: "start" }
    )

    return () => snap.destroy()
    // Re-run when the reels section appears so it's registered as a snap target.
  }, [isTouch, reels.length])

  const sections = (
    <>
      <Hero />
      <Reveal className="snap-section">
        <About />
      </Reveal>
      <Reveal className="snap-section">
        <Services />
      </Reveal>
      <Reveal className="snap-section">
        <Courses />
      </Reveal>
      {reels.length > 0 && (
        <Reveal className="snap-section">
          <Reels items={reels} />
        </Reveal>
      )}
      <Reveal className="snap-section">
        <Testimonials />
      </Reveal>
      <Reveal className="snap-section">
        <SiteFooter />
      </Reveal>
    </>
  )

  return (
    <>
      <SEO 
        title="Genesis Kreations — Chennai Media House" 
        description="Genesis Kreations — Chennai media house: Media Academy, Digital Marketing, Production, Studio Rental and Broadcasting." 
      />
      {/* Fixed crimson beams behind the whole page. The opaque Hero hides them
          on page 1; the translucent dark sections let them glow through from
          the second page onward. */}
      <BeamsBackground className="fixed inset-0 -z-10" intensity="medium" />
      {isTouch ? (
        <div className="h-screen overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sections}
        </div>
      ) : (
        <ReactLenis
          ref={lenisRef}
          className="h-screen overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          options={{ lerp: 0.09, smoothWheel: true }}
        >
          {sections}
        </ReactLenis>
      )}
    </>
  )
}

export { Home }
