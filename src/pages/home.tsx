import { useEffect, useRef } from "react"
import { ReactLenis, type LenisRef } from "lenis/react"
import Snap from "lenis/snap"

import { Hero } from "@/components/sections/hero"
import { About } from "@/components/sections/about"
import { Services } from "@/components/sections/services"
import { Courses } from "@/components/sections/courses"
import { Testimonials } from "@/components/sections/testimonials"
import { SiteFooter } from "@/components/sections/site-footer"
import { Reveal } from "@/components/ui/reveal"
import { BeamsBackground } from "@/components/ui/beams-background"

const Home: React.FC = () => {
  const lenisRef = useRef<LenisRef>(null)

  // Lenis drives the smooth wheel/trackpad scrolling; its Snap addon locks each
  // section to the top of the viewport. `lock` advances one section at a time
  // (slideshow style) so the scroll always stops on a full page and can't skip
  // past several at once. `duration` + `easing` make that a smooth eased glide.
  useEffect(() => {
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
  }, [])

  return (
    <>
      {/* Fixed crimson beams behind the whole page. The opaque Hero hides them
          on page 1; the translucent dark sections let them glow through from
          the second page onward. */}
      <BeamsBackground className="fixed inset-0 -z-10" intensity="medium" />
      <ReactLenis
        ref={lenisRef}
        className="h-screen overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        options={{ lerp: 0.09, smoothWheel: true }}
      >
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
      <Reveal className="snap-section">
        <Testimonials />
      </Reveal>
      <Reveal className="snap-section">
        <SiteFooter />
      </Reveal>
      </ReactLenis>
    </>
  )
}

export { Home }
