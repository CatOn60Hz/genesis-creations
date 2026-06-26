import { useState } from "react"
import {
  Camera,
  Lightbulb,
  Mic,
  Scissors,
  Video,
  Aperture,
  Plane,
  Joystick,
} from "lucide-react"

import { Reveal, RevealStagger, RevealItem } from "@/components/ui/reveal"
import { Grain } from "@/components/ui/grain"
import { MagneticTile } from "@/components/ui/magnetic-tile"
import {
  AnimatedSkillIcon,
  type SkillKind,
} from "@/components/ui/animated-skill-icon"

// Bento layout on a 6-col grid. `span` widths per row sum to 6 so the grid
// has exactly 8 cells with no gaps. `fill` marks crimson-filled feature tiles;
// `kind` selects the icon's thematic click animation.
type Area = {
  icon: React.ReactNode
  name: string
  kind: SkillKind
  span: string
  blurb?: string
  fill?: boolean
}

const areas: Area[] = [
  { icon: <Camera />, name: "Camera", kind: "camera", blurb: "Exposure, lenses and movement.", span: "md:col-span-2", fill: true },
  { icon: <Lightbulb />, name: "Lighting", kind: "lighting", blurb: "Shape and control light.", span: "md:col-span-2" },
  { icon: <Mic />, name: "Audio", kind: "audio", span: "md:col-span-1" },
  { icon: <Scissors />, name: "Editing", kind: "editing", span: "md:col-span-1" },
  { icon: <Video />, name: "Video Production", kind: "video", span: "md:col-span-1" },
  { icon: <Aperture />, name: "Photography", kind: "photo", span: "md:col-span-1" },
  { icon: <Plane />, name: "Aerial Cinematography", kind: "aerial", blurb: "Compose shots from the sky.", span: "md:col-span-2" },
  { icon: <Joystick />, name: "Drone Pilot Training", kind: "drone", blurb: "Hands-on flight training.", span: "md:col-span-2", fill: true },
]

// One bento cell. Clicking it toggles the icon's thematic animation on/off.
function SkillTile({ a }: { a: Area }) {
  const [active, setActive] = useState(false)
  return (
    <MagneticTile className="h-full">
      <button
        type="button"
        onClick={() => setActive((v) => !v)}
        aria-pressed={active}
        className={`group relative flex h-full min-h-[150px] w-full flex-col justify-between gap-4 overflow-hidden rounded-2xl p-5 text-left transition-shadow duration-300 ${
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
          <AnimatedSkillIcon kind={a.kind} active={active}>
            {a.icon}
          </AnimatedSkillIcon>
        </div>
        <div>
          <span className="font-display text-base font-semibold tracking-tight">
            {a.name}
          </span>
          {a.blurb && (
            <p
              className={`mt-1 text-sm leading-snug ${
                a.fill ? "text-cream/80" : "text-cream/55"
              }`}
            >
              {a.blurb}
            </p>
          )}
        </div>
      </button>
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
            Skills for every <span className="text-maroon">media career</span>
          </h2>
          <p className="mt-5 max-w-[55ch] text-base leading-relaxed text-cream/65 md:text-lg">
            From the lens to the final cut, our hands-on training covers the full
            production pipeline.
          </p>
        </Reveal>

        <RevealStagger className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-6">
          {areas.map((a) => (
            <RevealItem key={a.name} className={`h-full ${a.span}`}>
              <SkillTile a={a} />
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  )
}

export { Services }
