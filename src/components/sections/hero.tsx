import { useNavigate } from "react-router-dom"

import { PixelTrail } from "@/components/ui/pixel-trail"
import { ServicesMarquee } from "@/components/ui/services-marquee"
import { ProjectorScreen } from "@/components/ui/projector-screen"
import { useScreenSize } from "@/components/hooks/use-screen-size"
import logo from "@/assets/logo.png"

const Hero: React.FC = () => {
  const screenSize = useScreenSize()
  const navigate = useNavigate()

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
      <div className="relative z-10 flex flex-1 items-start px-6 pt-12 md:pt-20 pb-8 pointer-events-none">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 lg:grid-cols-[0.8fr_1.7fr]">
          {/* Left: brand + CTAs */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <img
              src={logo}
              alt="Genesis Creations"
              className="mb-7 h-40 w-auto md:h-56 drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
            />

            <p className="mb-5 text-base md:text-xl uppercase tracking-[0.35em] text-black">
              Chennai · Media House
            </p>

            <p className="mt-2 max-w-2xl text-lg md:text-3xl text-maroon-dark">
              Media Academy · Digital Marketing · Production · Studio · Broadcasting
            </p>

            {/* CTAs */}
            <div className="mt-10 md:mt-14 flex flex-col sm:flex-row items-center gap-5 pointer-events-auto">
              <button
                type="button"
                onClick={() => navigate("/workshops")}
                className="rounded-full bg-maroon px-12 py-5 text-lg md:text-xl font-medium text-maroon-dark shadow-lg transition-transform hover:scale-105 hover:bg-maroon/90"
              >
                Register for a Workshop
              </button>
            </div>
          </div>

          {/* Right: projector throwing Genesis Creations moments onto a screen */}
          <div className="flex flex-col items-center md:-mt-10">
            <p className="mb-8 md:mb-10 text-base md:text-2xl uppercase tracking-[0.35em] text-black">
              We don't just make media. We bring it to life
            </p>
            <ProjectorScreen className="pointer-events-auto" />
            <p className="mt-6 text-center text-xs uppercase tracking-[0.3em] text-black/60 md:text-sm">
              Moments from Genesis Creations
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export { Hero }
