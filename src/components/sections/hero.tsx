import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"

import { PixelTrail } from "@/components/ui/pixel-trail"
import { ServicesMarquee } from "@/components/ui/services-marquee"
import { GooeyText } from "@/components/ui/gooey-text-morphing"
import { useScreenSize } from "@/components/hooks/use-screen-size"
import logo from "@/assets/logo.png"

// Defined once at module scope so its identity is stable across re-renders —
// otherwise GooeyText's effect tears down and restarts the morph each render.
const MORPH_WORDS = ["Create", "Capture", "Produce", "Broadcast"]

const Hero: React.FC = () => {
  const screenSize = useScreenSize()
  const navigate = useNavigate()

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f6e8ec_0%,#eeeeee_45%,#e4e4e7_100%)] text-maroon-dark flex flex-col">
      {/* Interactive pixel trail background */}
      <div className="absolute inset-0 z-0">
        <PixelTrail
          pixelSize={screenSize.lessThan("md") ? 48 : 80}
          fadeDuration={500}
          delay={0}
          pixelClassName="rounded-full bg-tan"
        />
      </div>

      {/* Auto-scrolling services strip — fills the top of the hero */}
      <div className="relative z-10 pt-10 md:pt-14">
        <p className="mb-4 text-center text-[0.65rem] uppercase tracking-[0.4em] text-black">
          What We Do
        </p>
        <ServicesMarquee />
      </div>

      {/* Hero content — two columns on desktop.
          pointer-events-none so the PixelTrail behind keeps receiving the mouse;
          interactive elements re-enable pointer events individually. */}
      <div className="relative z-10 flex flex-1 items-start px-6 pt-12 md:pt-20 pb-8 pointer-events-none">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 lg:grid-cols-2">
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
              <button
                type="button"
                onClick={() => navigate("/services")}
                className="rounded-full border-2 border-tan/70 px-12 py-5 text-lg md:text-xl font-medium text-maroon-dark transition-colors hover:bg-tan/10"
              >
                Explore Services
              </button>
            </div>
          </div>

          {/* Right: gooey morphing text — what we do, brought to life */}
          <div className="flex flex-col items-center">
            <p className="mb-8 md:mb-10 text-base md:text-2xl uppercase tracking-[0.35em] text-black">
              We don't just make media. We
            </p>
            <GooeyText
              texts={MORPH_WORDS}
              morphTime={1.2}
              cooldownTime={2.5}
              className="h-[200px] w-full font-bold md:h-[320px]"
              textClassName="text-maroon leading-none text-[clamp(3.5rem,9vw,8.5rem)] md:text-[clamp(3.5rem,9vw,8.5rem)]"
            />
          </div>
        </div>
      </div>

      {/* Scroll-down cue */}
      <motion.div
        className="absolute bottom-28 md:bottom-10 left-1/2 z-10 -translate-x-1/2 text-maroon pointer-events-none"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="h-7 w-7" />
      </motion.div>
    </section>
  )
}

export { Hero }
