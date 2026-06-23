import { useNavigate } from "react-router-dom"
import { RotateCw, PlaneTakeoff, Plane, Clapperboard, Camera } from "lucide-react"

import { GlowCard } from "@/components/ui/spotlight-card"

const courses = [
  {
    icon: <RotateCw />,
    title: "Gimbal Workshop",
    text: "Master smooth, cinematic motion with professional gimbal stabilization.",
  },
  {
    icon: <PlaneTakeoff />,
    title: "Drone Workshop",
    text: "Hands-on drone operation and flight fundamentals for aerial work.",
  },
  {
    icon: <Plane />,
    title: "Aerial Cinematography",
    text: "Capture breathtaking aerial shots and compose them like a pro.",
  },
  {
    icon: <Clapperboard />,
    title: "Media Technology",
    text: "The complete toolkit — camera, lighting, audio, editing and production.",
  },
  {
    icon: <Camera />,
    title: "Digital Photography",
    text: "From exposure to composition, build a strong photography foundation.",
  },
]

const Courses: React.FC = () => {
  const navigate = useNavigate()

  return (
    <section id="courses" className="bg-maroon-dark text-cream py-24 px-6">
      <div className="mx-auto max-w-5xl text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-maroon">
          Workshops &amp; Courses
        </p>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-maroon">
          Learn From Scratch — No Prior Knowledge Required
        </h2>
      </div>

      <div className="mx-auto mt-16 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => (
          <GlowCard
            key={c.title}
            glowColor="maroon"
            customSize
            className="group h-full min-h-[280px]"
          >
            <div className="flex h-full flex-col p-2">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-maroon text-maroon-dark">
                {c.icon}
              </div>
              <h3 className="text-xl font-semibold text-maroon">{c.title}</h3>
              <p className="mt-2 flex-1 text-sm text-cream">{c.text}</p>
              <button
                type="button"
                onClick={() => navigate("/workshops")}
                className="mt-6 self-start rounded-full bg-maroon px-5 py-2 text-sm font-medium text-maroon-dark transition-transform group-hover:scale-105"
              >
                Register &amp; Pay
              </button>
            </div>
          </GlowCard>
        ))}
      </div>
    </section>
  )
}

export { Courses }
