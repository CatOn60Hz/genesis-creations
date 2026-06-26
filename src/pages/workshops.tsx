import { useEffect, useRef, useState, type ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"
import {
  CalendarDays,
  MapPin,
  Clock,
  Loader2,
  CircleCheck,
  ArrowRight,
  Ticket,
  X,
  // Icons selectable per-workshop (preset keys + free-text keywords).
  Drone,
  PlaneTakeoff,
  Video,
  Camera,
  Clapperboard,
  Scissors,
  Mic,
  MicVocal,
  Music,
  Headphones,
  Radio,
  Tv,
  Monitor,
  Projector,
  Aperture,
  Film,
  Image as ImageIcon,
  Palette,
  PenTool,
  Megaphone,
  Lightbulb,
  Sparkles,
  Star,
  Award,
  Trophy,
  Users,
  Rocket,
  BookOpen,
  Briefcase,
  Wand,
  GraduationCap,
  type LucideIcon,
} from "lucide-react"

import { fetchWorkshops, type Workshop, type WorkshopSession } from "@/lib/cms-api"
import { PixelTrail } from "@/components/ui/pixel-trail"
import TextCursorProximity from "@/components/ui/text-cursor-proximity"
import { Reveal } from "@/components/ui/reveal"

// Strong ease-out curve — matches the shared Reveal component (Emil Kowalski:
// the built-in easings are too weak to feel intentional).
const EASE_OUT = [0.23, 1, 0.32, 1] as const

// Letters grow + turn crimson as the cursor approaches them.
const PROXIMITY_STYLES = {
  transform: { from: "scale(1)", to: "scale(1.3)" },
  color: { from: "#000000", to: "#cb2957" },
} as const

// Resolve the admin-chosen icon. Accepts the preset keys AND any free-text
// keyword the admin types ("Custom…") — normalised and matched here. Anything
// unrecognised falls back to a graduation cap.
const ICON_MAP: Record<string, LucideIcon> = {
  drone: Drone,
  aerial: PlaneTakeoff,
  flight: PlaneTakeoff,
  gimbal: Video,
  video: Video,
  videography: Video,
  camera: Camera,
  photography: Camera,
  photo: Camera,
  aperture: Aperture,
  editing: Clapperboard,
  edit: Scissors,
  film: Film,
  cinematography: Film,
  audio: Mic,
  mic: Mic,
  sound: Mic,
  vocal: MicVocal,
  recording: MicVocal,
  music: Music,
  studio: Headphones,
  headphones: Headphones,
  radio: Radio,
  broadcast: Radio,
  tv: Tv,
  monitor: Monitor,
  projector: Projector,
  image: ImageIcon,
  design: Palette,
  graphic: Palette,
  palette: Palette,
  pen: PenTool,
  draw: PenTool,
  marketing: Megaphone,
  megaphone: Megaphone,
  idea: Lightbulb,
  lightbulb: Lightbulb,
  sparkles: Sparkles,
  star: Star,
  award: Award,
  trophy: Trophy,
  users: Users,
  team: Users,
  rocket: Rocket,
  book: BookOpen,
  course: BookOpen,
  career: Briefcase,
  briefcase: Briefcase,
  wand: Wand,
  cap: GraduationCap,
  default: GraduationCap,
}
function iconFor(key?: string): ReactNode {
  const norm = (key ?? "").trim().toLowerCase().replace(/\s+/g, "-")
  const Comp = ICON_MAP[norm] ?? GraduationCap
  return <Comp className="h-7 w-7" />
}

// Build the list of sessions to show: prefer the structured `sessions`, but
// fall back to a single session synthesized from the legacy date/location.
function sessionsOf(w: Workshop): WorkshopSession[] {
  if (w.sessions && w.sessions.length) return w.sessions
  if (w.location || w.date) return [{ city: w.location || "", dates: w.date || "" }]
  return []
}

function WorkshopCard({ w, index }: { w: Workshop; index: number }) {
  const sessions = sessionsOf(w)
  const learn = w.learn ?? []
  const included = w.included ?? []
  const reduce = useReducedMotion()

  return (
    <motion.article
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.5, delay: (index % 2) * 0.1, ease: EASE_OUT }}
      className="flex flex-col overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10"
    >
      {/* Banner (when one was uploaded) */}
      {w.banner && (
        <div className="aspect-[16/9] w-full overflow-hidden">
          <img src={w.banner.url} alt={w.title} className="h-full w-full object-cover" />
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden bg-[linear-gradient(135deg,#6d1f33_0%,#2a0d15_100%)] p-7">
        <div className="absolute inset-0 opacity-30">
          <PixelTrail pixelSize={42} fadeDuration={500} pixelClassName="bg-maroon/40" />
        </div>
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-maroon text-cream">
            {iconFor(w.icon)}
          </div>
          {w.badge && (
            <span className="rounded-full bg-cream/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cream">
              {w.badge}
            </span>
          )}
        </div>
        <h2 className="relative z-10 mt-5 text-2xl font-bold text-cream">{w.title}</h2>
        {w.tagline && <p className="relative z-10 mt-2 text-sm text-cream/80">{w.tagline}</p>}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-6 p-7">
        {w.description && (
          <p className="text-sm leading-relaxed text-cream/75">{w.description}</p>
        )}

        {/* Sessions */}
        {sessions.length > 0 && (
          <div className="flex flex-col gap-3">
            {sessions.map((s, si) => (
              <div key={si} className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm">
                  {s.city && (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-maroon">
                      <MapPin className="h-4 w-4" /> {s.city}
                    </span>
                  )}
                  {s.dates && (
                    <span className="inline-flex items-center gap-1.5 text-cream/80">
                      <CalendarDays className="h-4 w-4 text-maroon" /> {s.dates}
                    </span>
                  )}
                  {s.timing && (
                    <span className="inline-flex items-center gap-1.5 text-cream/80">
                      <Clock className="h-4 w-4 text-maroon" /> {s.timing}
                    </span>
                  )}
                </div>
                {s.venue && (
                  <p className="mt-2 text-xs leading-relaxed text-cream/55">{s.venue}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* What you'll learn */}
        {learn.length > 0 && (
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cream/60">
              What you'll learn
            </h3>
            <ul className="flex flex-col gap-2">
              {learn.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-cream/80">
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-maroon" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* What's included */}
        {included.length > 0 && (
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cream/60">
              What's included
            </h3>
            <div className="flex flex-wrap gap-2">
              {included.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-cream/10 px-3 py-1 text-xs text-cream/80"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {w.note && (
          <p className="rounded-2xl bg-maroon/15 p-4 text-xs leading-relaxed text-cream/75 ring-1 ring-maroon/30">
            {w.note}
          </p>
        )}

        {/* CTA */}
        {w.registerUrl && (
          <a
            href={w.registerUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-maroon px-6 py-3.5 text-sm font-semibold text-cream transition-transform hover:scale-[1.02]"
          >
            <Ticket className="h-4 w-4" /> Register now
            <ArrowRight className="h-4 w-4" />
          </a>
        )}
      </div>
    </motion.article>
  )
}

// Compact card for the listing grid — opens the full detail on click.
function ThumbCard({
  w,
  index,
  onOpen,
}: {
  w: Workshop
  index: number
  onOpen: () => void
}) {
  const first = sessionsOf(w)[0]
  const date = w.date || first?.dates
  const location = w.location || first?.city
  const reduce = useReducedMotion()

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08, ease: EASE_OUT }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white/5 text-left ring-1 ring-white/10 transition hover:ring-maroon/60"
    >
      {/* Thumbnail */}
      <div className="aspect-[16/10] w-full overflow-hidden">
        {w.banner ? (
          <img
            src={w.banner.url}
            alt={w.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#6d1f33_0%,#2a0d15_100%)] text-cream/80">
            {iconFor(w.icon)}
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <h2 className="text-lg font-semibold leading-snug text-cream">{w.title}</h2>
        {(date || location) && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {date && (
              <span className="inline-flex items-center gap-1.5 text-maroon">
                <CalendarDays className="h-3.5 w-3.5" /> {date}
              </span>
            )}
            {location && (
              <span className="inline-flex items-center gap-1.5 text-maroon">
                <MapPin className="h-3.5 w-3.5" /> {location}
              </span>
            )}
          </div>
        )}
        {w.description && (
          <p className="line-clamp-3 text-sm leading-relaxed text-cream/70">{w.description}</p>
        )}
        <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-maroon/80 transition-colors group-hover:text-maroon">
          View details <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </motion.button>
  )
}

const Workshops: React.FC = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Workshop | null>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchWorkshops()
      .then(setWorkshops)
      .catch(() => setWorkshops([]))
      .finally(() => setLoading(false))
  }, [])

  // Lock body scroll + close on Escape while the detail modal is open.
  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null)
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [selected])

  return (
    <main className="min-h-screen bg-maroon-dark pb-32 text-cream">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f6e8ec_0%,#eeeeee_45%,#e4e4e7_100%)] px-6 py-28 text-maroon-dark md:py-40">
        <div className="absolute inset-0 z-0 opacity-40">
          <PixelTrail pixelSize={60} fadeDuration={500} pixelClassName="bg-maroon-dark/10" />
        </div>
        <div ref={heroRef} className="relative z-10 mx-auto max-w-7xl text-center">
          <Reveal>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-maroon">
              Genesis Creations
            </p>
          </Reveal>
          {/* Interactive headline — letters react to cursor proximity. */}
          <h1 className="mb-8 flex flex-col items-center font-bold uppercase leading-[0.95] tracking-tight">
            <TextCursorProximity
              label="WORKSHOPS"
              className="text-7xl will-change-transform md:text-9xl lg:text-[11rem]"
              styles={PROXIMITY_STYLES}
              falloff="gaussian"
              radius={200}
              containerRef={heroRef}
            />
            <TextCursorProximity
              label="& MASTERCLASSES"
              className="text-5xl will-change-transform md:text-8xl lg:text-9xl"
              styles={PROXIMITY_STYLES}
              falloff="gaussian"
              radius={200}
              containerRef={heroRef}
            />
          </h1>
          <Reveal delay={0.1}>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-maroon-dark/80 md:text-xl">
              Hands-on sessions led by working professionals — gimbal, drone,
              cinematography, photography and more. Find an upcoming session and
              register.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Listing */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-20 text-cream/60">
              <Loader2 className="h-6 w-6 animate-spin" /> Loading workshops…
            </div>
          ) : workshops.length === 0 ? (
            <p className="py-20 text-center text-cream/60">
              No workshops are scheduled right now. Check back soon!
            </p>
          ) : (
            <div className="grid items-start gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {workshops.map((w, i) => (
                <ThumbCard key={w.id} w={w} index={i} onOpen={() => setSelected(w)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[70] flex justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative my-auto w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close"
              className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-cream backdrop-blur transition-colors hover:bg-maroon"
            >
              <X className="h-5 w-5" />
            </button>
            <WorkshopCard w={selected} index={0} />
          </div>
        </div>
      )}
    </main>
  )
}

export { Workshops }
