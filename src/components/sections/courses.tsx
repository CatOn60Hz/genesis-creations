import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowRight,
  RotateCw,
  PlaneTakeoff,
  Plane,
  Clapperboard,
  Camera,
} from "lucide-react"

import { Reveal, RevealStagger, RevealItem } from "@/components/ui/reveal"
import { Grain } from "@/components/ui/grain"
import { fetchHomeCourses, type HomeCourseKind } from "@/lib/cms-api"

// Icon per `kind`. The CSS class gc-cicon-<kind> drives the hover animation, so
// keep these keys in sync with the backend's GC_HOME_COURSE_KINDS.
const KIND_ICONS: Record<HomeCourseKind, React.ReactNode> = {
  gimbal: <RotateCw />,
  drone: <PlaneTakeoff />,
  aerial: <Plane />,
  clapper: <Clapperboard />,
  camera: <Camera />,
}

type CourseRow = { kind: HomeCourseKind; title: string; text: string }

// Built-in defaults — shown until the CMS responds and as a fallback. The
// backend seeds these same rows on first run, so /admin starts with them.
const fallbackCourses: CourseRow[] = [
  {
    kind: "gimbal",
    title: "Gimbal Workshop",
    text: "Master smooth, cinematic motion with professional gimbal stabilization.",
  },
  {
    kind: "drone",
    title: "Drone Workshop",
    text: "Hands-on drone operation and flight fundamentals for aerial work.",
  },
  {
    kind: "aerial",
    title: "Aerial Cinematography",
    text: "Capture breathtaking aerial shots and compose them like a pro.",
  },
  {
    kind: "clapper",
    title: "Media Technology",
    text: "The complete toolkit — camera, lighting, audio, editing and production.",
  },
  {
    kind: "camera",
    title: "Digital Photography",
    text: "From exposure to composition, build a strong photography foundation.",
  },
]

const Courses: React.FC = () => {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<CourseRow[]>(fallbackCourses)

  useEffect(() => {
    let active = true
    fetchHomeCourses()
      .then((items) => {
        if (active && items.length) {
          setCourses(
            items.map((c) => ({ kind: c.kind, title: c.title, text: c.text }))
          )
        }
      })
      .catch(() => {
        /* keep fallback courses */
      })
    return () => {
      active = false
    }
  }, [])

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
                    {KIND_ICONS[c.kind] ?? KIND_ICONS.clapper}
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
