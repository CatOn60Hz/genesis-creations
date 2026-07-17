import {
  Clapperboard,
  Film,
  Scissors,
  Aperture,
  Mic,
  Newspaper,
  Smartphone,
  Plane,
  Palette,
  Tv,
} from "lucide-react"

import { Reveal, RevealStagger, RevealItem } from "@/components/ui/reveal"
import { Grain } from "@/components/ui/grain"
import { MagneticTile } from "@/components/ui/magnetic-tile"

// Career paths the training prepares students for. `fill` marks the crimson
// feature tiles that break up the grid visually.
type Area = {
  icon: React.ReactNode
  name: string
  fill?: boolean
}

const areas: Area[] = [
  { icon: <Clapperboard />, name: "Film Director", fill: true },
  { icon: <Film />, name: "Cinematographer" },
  { icon: <Scissors />, name: "Film Editor" },
  { icon: <Aperture />, name: "Photographer" },
  { icon: <Mic />, name: "Sound Engineer", fill: true },
  { icon: <Newspaper />, name: "Journalist" },
  { icon: <Smartphone />, name: "Digital Content Creator" },
  { icon: <Plane />, name: "Drone Pilot", fill: true },
  { icon: <Palette />, name: "Graphic Designer" },
  { icon: <Tv />, name: "TV & Broadcast Professional" },
]

// One career-path tile.
function SkillTile({ a }: { a: Area }) {
  return (
    <MagneticTile className="h-full">
      <div
        className={`group relative flex h-full min-h-[130px] w-full flex-col justify-between gap-4 overflow-hidden rounded-2xl p-5 text-left transition-shadow duration-300 ${
          a.fill
            ? "bg-[linear-gradient(135deg,#cb2957_0%,#7a1230_100%)] text-cream shadow-[0_24px_60px_-28px_rgba(203,41,87,0.7)] hover:shadow-[0_32px_80px_-24px_rgba(203,41,87,0.95)]"
            : "bg-white/[0.04] text-cream ring-1 ring-white/10 hover:ring-maroon/40 hover:shadow-[0_28px_70px_-30px_rgba(203,41,87,0.6)]"
        }`}
      >
        {/* Sheen that sweeps across on hover. */}
        <span className="pointer-events-none absolute -inset-x-2 -top-1/2 h-[200%] -translate-x-[120%] rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[120%]" />
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-110 [&>svg]:h-5 [&>svg]:w-5 ${
            a.fill ? "bg-cream/15 text-cream" : "bg-maroon text-cream"
          }`}
        >
          {a.icon}
        </div>
        <span className="font-display text-base font-semibold tracking-tight">
          {a.name}
        </span>
      </div>
    </MagneticTile>
  )
}

const Services: React.FC = () => {
  return (
    <section
      id="services"
      className="gc-dark-section gc-sep relative flex min-h-dvh flex-col justify-center overflow-hidden px-6 py-24 text-cream"
    >
      <Grain />
      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <Reveal repeat className="max-w-2xl">
          <h2 className="font-display text-4xl font-bold tracking-tighter text-cream md:text-6xl">
            Choose Your <span className="text-maroon">Media Career Path</span>
          </h2>
          <p className="mt-5 max-w-[55ch] text-base leading-relaxed text-cream/65 md:text-lg">
            Choose the path that transforms your passion into a profession.
          </p>
        </Reveal>

        <RevealStagger className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {areas.map((a) => (
            <RevealItem key={a.name} className="h-full">
              <SkillTile a={a} />
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  )
}

export { Services }
