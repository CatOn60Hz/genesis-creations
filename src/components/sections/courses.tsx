import { useNavigate } from "react-router-dom"
import { ArrowRight, RotateCw, PlaneTakeoff, Plane, Clapperboard, Camera } from "lucide-react"

import { Reveal, RevealStagger, RevealItem } from "@/components/ui/reveal"
import { Grain } from "@/components/ui/grain"

const courses = [
  {
    icon: <RotateCw />,
    kind: "gimbal",
    title: "Gimbal Workshop",
    text: "Master smooth, cinematic motion with professional gimbal stabilization.",
  },
  {
    icon: <PlaneTakeoff />,
    kind: "drone",
    title: "Drone Workshop",
    text: "Hands-on drone operation and flight fundamentals for aerial work.",
  },
  {
    icon: <Plane />,
    kind: "aerial",
    title: "Aerial Cinematography",
    text: "Capture breathtaking aerial shots and compose them like a pro.",
  },
  {
    icon: <Clapperboard />,
    kind: "clapper",
    title: "Media Technology",
    text: "The complete toolkit — camera, lighting, audio, editing and production.",
  },
  {
    icon: <Camera />,
    kind: "camera",
    title: "Digital Photography",
    text: "From exposure to composition, build a strong photography foundation.",
  },
]

const Courses: React.FC = () => {
  const navigate = useNavigate()

  return (
    <section
      id="courses"
      className="gc-dark-section gc-sep relative flex min-h-dvh flex-col justify-center overflow-hidden px-6 py-24 text-cream"
    >
      <Grain />
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <Reveal repeat className="max-w-3xl">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-maroon">
            Workshops &amp; Courses
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tighter text-cream md:text-6xl text-balance">
            Learn from scratch — no prior knowledge required
          </h2>
        </Reveal>

        {/* Big-type interactive menu — each course is a row that lights up and
            slides on hover, not a card. Click anywhere to register. */}
        <RevealStagger className="mt-12 border-t border-white/10">
          {courses.map((c) => (
            <RevealItem key={c.title}>
              <button
                type="button"
                onClick={() => navigate("/workshops")}
                className="group flex w-full items-center gap-5 border-b border-white/10 py-6 text-left transition-colors hover:bg-white/[0.02] sm:gap-7"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-maroon/10 text-maroon transition-colors duration-300 group-hover:bg-maroon group-hover:text-cream">
                  <span className={`gc-cicon gc-cicon-${c.kind} [&>svg]:h-5 [&>svg]:w-5`}>
                    {c.icon}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-2xl font-bold tracking-tight text-cream/90 transition-colors duration-300 group-hover:text-maroon md:text-4xl">
                    {c.title}
                  </span>
                  <span className="mt-1 block truncate text-sm text-cream/55">
                    {c.text}
                  </span>
                </span>
                <span className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-maroon transition-transform duration-300 group-hover:translate-x-1 sm:inline-flex">
                  Register
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  )
}

export { Courses }
