import { PixelTrail } from "@/components/ui/pixel-trail"
import { ServicesMarquee } from "@/components/ui/services-marquee"
import { ProjectorScreen } from "@/components/ui/projector-screen"
import { GooeyText } from "@/components/ui/gooey-text-morphing"
import { useScreenSize } from "@/components/hooks/use-screen-size"
import logo from "@/assets/logo-mark.png"

// Defined once at module scope so its identity is stable across re-renders —
// otherwise GooeyText's effect tears down and restarts the morph each render.
const MORPH_WORDS = ["Create", "Capture", "Produce", "Broadcast"]

const Hero: React.FC = () => {
  const screenSize = useScreenSize()

  return (
    <section className="snap-section relative w-full min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f6e8ec_0%,#eeeeee_45%,#e4e4e7_100%)] text-maroon-dark flex flex-col">
      {/* Interactive pixel trail background */}
      <div className="absolute inset-0 z-0">
        <PixelTrail
          pixelSize={screenSize.lessThan("md") ? 48 : 80}
          fadeDuration={500}
          delay={0}
          pixelClassName="rounded-full bg-tan"
        />
      </div>

      {/* Auto-scrolling services strip — fills the top of the hero.
          marginTop clears the announcement banner when one is showing
          (--announcement-h is published by AnnouncementBanner; 0 otherwise). */}
      <div
        className="relative z-10 pt-4 md:pt-6"
        style={{ marginTop: "var(--announcement-h, 0px)" }}
      >
        {/* fadeFrom matches the hero gradient colour at this height so the
            edge fades blend in instead of showing as grey bands. */}
        <ServicesMarquee fadeFrom="from-[#f4eaed]" />
        <p className="mt-4 text-center text-[0.65rem] uppercase tracking-[0.4em] text-black">
          What We Do
        </p>
      </div>

      {/* Hero content — two columns on desktop.
          pointer-events-none so the PixelTrail behind keeps receiving the mouse;
          interactive elements re-enable pointer events individually. */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-6 pt-6 pb-28 pointer-events-none">
        {/* Centered as a single unit (text + projector), so the leftover space is
            always split evenly on both sides — even though the projector's width
            changes with screen height. Fixed-fraction columns can't do that. */}
        <div className="mx-auto flex w-full max-w-[110rem] flex-col items-center justify-center gap-10 lg:flex-row lg:gap-14">
          {/* Left: gooey morphing brand words + tagline */}
          <div className="flex w-full min-w-0 flex-col items-center text-center lg:w-[30rem] lg:flex-none lg:-translate-x-20">
            <p className="text-3xl md:text-5xl uppercase tracking-[0.2em] text-maroon-dark">
              Genesis Creations
            </p>

            <GooeyText
              texts={MORPH_WORDS}
              morphTime={1.2}
              cooldownTime={2.5}
              logo={logo}
              logoAlt="Genesis Creations"
              logoClassName="h-[90%] drop-shadow-sm"
              className="mt-6 mb-6 h-[clamp(120px,18vh,180px)] w-full"
              // `!` forces this size over GooeyText's own md:text-[60pt] default.
              // Fluid with viewport width so the longest word ("Broadcast") stays
              // big but never overflows the column on narrower desktops.
              textClassName="text-maroon font-bold leading-none text-[clamp(3rem,6vw,6.5rem)]!"
            />

            <p className="mb-5 whitespace-nowrap text-sm md:text-base uppercase tracking-[0.3em] text-black">
              Chennai | Coimbatore | Nagercoil
            </p>

            {/* w-full + max-w caps the width at the column, never wider — so it
                wraps inside the column instead of spilling off the viewport. */}
            <p className="w-full max-w-2xl text-lg md:text-3xl text-maroon-dark">
              Media Academy · Digital Marketing · Production · Studio Rental · Broadcasting
            </p>
          </div>

          {/* Right: projector throwing Genesis Creations moments onto a screen.
              Width is driven by viewport HEIGHT (so the hero always fits and stays
              centered) but never more than 57vw, so the pair fits side-by-side. */}
          <div className="flex w-full flex-col items-center lg:w-[min(57vw,calc((100vh_-_24rem)_*_16_/_9))] lg:flex-none">
            <p className="mb-4 text-center text-xs sm:text-sm md:text-base uppercase tracking-[0.2em] text-black md:whitespace-nowrap">
              We don't just make media. We bring it to life
            </p>
            <div className="w-full">
              <ProjectorScreen className="pointer-events-auto" />
            </div>
            <p className="mt-4 text-center text-xs uppercase tracking-[0.3em] text-black/60 md:text-sm">
              Moments from Genesis Creations
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export { Hero }
