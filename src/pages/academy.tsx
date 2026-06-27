import { useEffect, useRef, useState, type ComponentType } from "react"
import { Link } from "react-router-dom"
import { motion, useReducedMotion } from "framer-motion"
import {
  CalendarDays,
  Clock,
  Film,
  Award,
  CircleCheck,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Users,
  Sparkles,
  Rocket,
  MapPin,
  Landmark,
  X,
  type LucideProps,
} from "lucide-react"

import { Reveal, RevealStagger, RevealItem } from "@/components/ui/reveal"
import { PixelTrail } from "@/components/ui/pixel-trail"
import { Grain } from "@/components/ui/grain"
import { LampContainer } from "@/components/ui/lamp"
import TextCursorProximity from "@/components/ui/text-cursor-proximity"
import {
  AnimatedCourseIcon,
  type CourseKind,
} from "@/components/ui/animated-course-icon"
import { SEO } from "@/components/seo"
import academyHero from "@/assets/academy-hero.jpg"

const EASE_OUT = [0.16, 1, 0.3, 1] as const

// Letters glow brighter + turn crimson as the cursor approaches them. Light
// base so they read over the darkened hero photo.
const PROXIMITY_STYLES = {
  transform: { from: "scale(1)", to: "scale(1.3)" },
  color: { from: "#f4eef0", to: "#cb2957" },
} as const

type Icon = ComponentType<LucideProps>

interface Course {
  kind: CourseKind
  title: string
  subtitle: string
  why: string
  duration: string
  schedule: string
  format: string
  certification: string
  // Most courses list a flat `learn` array; the diploma instead provides a
  // module breakdown plus career outcomes and a "Launching Soon" badge.
  learn?: string[]
  modules?: { title: string; items: string[] }[]
  careers?: string[]
  badge?: string
  choose: string[]
  who: string
}

// Catalogue content lifted from the Genesis Creations course handbook. Each
// course keeps the same shape so the card and its detail modal stay dumb: an
// intro paragraph up top, then the practical points underneath.
const courses: Course[] = [
  {
    kind: "diploma",
    badge: "Launching Soon",
    title: "Diploma in Visual Communication",
    subtitle: "1-Year Regular Program",
    why: "If you're passionate about photography, graphic design, filmmaking, video editing, or digital storytelling but aren't sure where to begin, this is for you. Instead of learning just one skill, this comprehensive one-year program builds a strong foundation across the entire visual media industry through hands-on training, real studio experience, and mentorship from industry professionals.",
    duration: "1 Year",
    schedule: "Mon to Fri",
    format: "Practical, studio-based learning",
    certification: "Genesis Creations Diploma in Visual Communication",
    modules: [
      {
        title: "Foundations of Visual Communication",
        items: [
          "Principles of design",
          "Color theory & composition",
          "Visual storytelling",
          "Introduction to the media industry",
        ],
      },
      {
        title: "Graphic Design & Branding",
        items: [
          "Adobe Photoshop",
          "Adobe Illustrator",
          "Logo design",
          "Branding & layout design",
          "Print & digital design",
        ],
      },
      {
        title: "Photography",
        items: [
          "Camera fundamentals",
          "Lighting techniques",
          "Portrait, product & event photography",
          "Photo editing & post-processing",
        ],
      },
      {
        title: "Videography & Filmmaking",
        items: [
          "Camera operations",
          "Cinematic composition",
          "Video lighting",
          "Storyboarding & shot planning",
          "Direction & production workflow",
        ],
      },
      {
        title: "Video Editing & Post-Production",
        items: [
          "Adobe Premiere Pro",
          "DaVinci Resolve",
          "Story editing & color correction",
          "Audio synchronization",
          "Export & delivery techniques",
        ],
      },
      {
        title: "Career Development",
        items: [
          "Portfolio building",
          "Freelancing essentials",
          "Client communication",
          "Career guidance & industry exposure",
        ],
      },
    ],
    choose: [
      "Comprehensive learning: graphic design, photography, videography, editing, and visual storytelling in one integrated program",
      "Industry-oriented curriculum built around the skills creative employers expect",
      "Hands-on studio training on professional cameras, lighting, and editing suites",
      "Mentorship from working media professionals",
      "Graduate with a diverse, multi-discipline professional portfolio",
    ],
    careers: [
      "Graphic Designer",
      "Photographer",
      "Videographer",
      "Video Editor",
      "Content Creator",
      "Social Media Creative",
      "Production Assistant",
      "Creative Executive",
      "Freelance Media Professional",
    ],
    who: "Students who've completed 12th grade, career switchers entering the creative industry, aspiring photographers, designers, videographers, and content creators, and anyone seeking a complete foundation before choosing a specialization. Eligibility: 10+2 (Higher Secondary) or equivalent — subject to final approval.",
  },
  {
    kind: "photography",
    title: "Photography",
    subtitle: "Professional Photography Certification Course",
    why: "A camera in your hand is just a tool. What turns it into a career is technique, vision, and real shooting experience. This course is built for people who want to turn photography from a hobby into a profession, whether that is weddings, fashion, products, events, or fine art.",
    duration: "1 Month",
    schedule: "Mon to Fri, 3 hours/day",
    format: "Studio + outdoor shoots",
    certification: "Certified Photographer",
    learn: [
      "Camera fundamentals: exposure triangle, ISO, aperture, shutter speed",
      "Lighting techniques: natural light, studio strobes, continuous lighting",
      "Composition, framing, and storytelling through images",
      "Portrait, product, event, and outdoor/location photography",
      "Post-processing in Lightroom and Photoshop",
      "Building a professional portfolio",
      "Client handling, pricing, and freelance business basics",
    ],
    choose: [
      "Full access to professional camera bodies, lenses, and studio lighting",
      "Real shoots across portrait, product, and event formats, not just theory",
      "Mentorship from working industry photographers",
      "Portfolio-building support for job and freelance readiness",
      "Certificate recognized for career and freelance opportunities",
    ],
    who: "Beginners, hobbyists wanting to go pro, students, and working professionals planning a career switch.",
  },
  {
    kind: "videography",
    title: "Videography",
    subtitle: "Professional Videography Certification Course",
    why: "Every brand, event, and creator today needs video. This course builds you into a confident camera operator who understands cinematic storytelling, not just someone who knows how to press record.",
    duration: "1 Month",
    schedule: "Mon to Fri, 3 hours/day",
    format: "Studio + live production sets",
    certification: "Certified Videographer",
    learn: [
      "Camera operation: DSLR, mirrorless, and cinema cameras",
      "Shot composition, framing, and camera movement",
      "Lighting for video: 3-point, available, and mixed lighting",
      "Shooting events, corporate films, music videos, and short films",
      "Working with gimbals, sliders, and tripods",
      "Basic sound capture on set",
      "Pre-production planning: shot lists, storyboards, scripts",
    ],
    choose: [
      "Train on professional cinema cameras and rigs",
      "Real production environment with studio and live shoot exposure",
      "Learn directly from working videographers and cinematographers",
      "Build a demo reel by course end",
      "Direct pathway into the Genesis Creations production division",
    ],
    who: "Aspiring cinematographers, content creators, event videographers, and anyone wanting to shoot professionally.",
  },
  {
    kind: "graphic-design",
    title: "Graphic Design",
    subtitle: "Professional Graphic Design Certification Course",
    why: "Every brand needs a visual identity: logos, social media creatives, posters, packaging. This course trains you to design with purpose, not just decoration, so your work actually communicates and sells.",
    duration: "1 Month",
    schedule: "Mon to Fri, 3 hours/day",
    format: "Studio-based, project-driven",
    certification: "Certified Graphic Designer",
    learn: [
      "Design fundamentals: color theory, typography, layout, composition",
      "Adobe Photoshop and Illustrator, the industry-standard tools",
      "Logo design and brand identity creation",
      "Social media creatives and marketing collateral",
      "Poster, brochure, and packaging design",
      "Designing for print versus digital",
      "Building a client-ready design portfolio",
    ],
    choose: [
      "Learn on industry-standard software with guided practice",
      "Real client-style design briefs, not just exercises",
      "Mentorship from working creative designers",
      "Portfolio built during the course, ready to showcase",
      "Direct relevance to freelance, agency, or in-house design roles",
    ],
    who: "Students, freelancers-to-be, marketing professionals, and anyone with a creative eye wanting formal design skills.",
  },
  {
    kind: "video-editing",
    title: "Video Editing",
    subtitle: "Professional Video Editing Certification Course",
    why: "Raw footage means nothing without editing. It is where the story actually comes together. This course turns you into an editor who can take any footage and shape it into a polished final product.",
    duration: "1 Month",
    schedule: "Mon to Fri, 3 hours/day",
    format: "Hands-on lab sessions",
    certification: "Certified Video Editor",
    learn: [
      "Editing software: Adobe Premiere Pro and DaVinci Resolve",
      "Story structuring, pacing, and narrative flow",
      "Transitions, effects, and motion graphics basics",
      "Sound design and music syncing",
      "Color correction fundamentals",
      "Editing for reels, films, corporate videos, and ads",
      "Export settings and platform-specific optimization",
    ],
    choose: [
      "Edit using real footage from actual Genesis Creations productions",
      "Access to industry-grade editing systems and software",
      "Learn from editors actively working on commercial projects",
      "Build a strong edited showreel by the end of the course",
      "A fast-growing field with freelance and studio opportunities",
    ],
    who: "Aspiring editors, content creators, videographers wanting to upskill, and social media managers.",
  },
  {
    kind: "drone",
    title: "Drone Cinematography",
    subtitle: "Professional Drone Cinematography Certification Course",
    why: "Aerial shots have become essential in films, weddings, real estate, and corporate visuals. This course does not just teach you to fly. It teaches you to capture cinematic aerial footage safely and legally.",
    duration: "5 Days",
    schedule: "Mon to Fri, 3 hours/day",
    format: "Practical flying + outdoor shoots",
    certification: "Certified Drone Cinematographer",
    learn: [
      "Drone fundamentals: components, setup, and maintenance",
      "Flight controls and safe flying practices",
      "Aerial shot composition and cinematic movement",
      "DGCA rules, regulations, and compliance for drone operation",
      "Shooting for real estate, weddings, films, and events",
      "Footage handling and basic aerial color grading",
      "Pre-flight planning and site assessment",
    ],
    choose: [
      "Hands-on flying with professional cinema drones",
      "Training includes DGCA regulatory awareness for legal operation",
      "Learn from experienced drone pilots and cinematographers",
      "Real outdoor practice sessions, not just simulator time",
      "A high-demand, high-paying niche skill with limited competition",
    ],
    who: "Videographers, photographers, real estate professionals, and anyone looking to add a high-value specialized skill.",
  },
  {
    kind: "live-sound",
    title: "Live Sound Mixing",
    subtitle: "Professional Live Sound Mixing Certification Course",
    why: "Every concert, event, and live show depends on sound that just works and sounds professional. This course trains you to handle live audio under real pressure, on real equipment.",
    duration: "1 Month",
    schedule: "Mon to Fri, 3 hours/day",
    format: "Live setup + real event exposure",
    certification: "Certified Live Sound Engineer",
    learn: [
      "Sound system fundamentals: mixers, speakers, mics, signal flow",
      "Live sound mixing for events, concerts, and conferences",
      "Microphone selection and placement techniques",
      "EQ, compression, and effects for live sound",
      "Troubleshooting common live audio issues",
      "Stage setup and soundcheck procedures",
      "Working with bands, performers, and event teams",
    ],
    choose: [
      "Train on professional live sound consoles and equipment",
      "Real event and stage practice, not just classroom theory",
      "Mentorship from active sound engineers",
      "Strong, steady demand across events, concerts, and broadcasting",
      "A practical skillset that is hard to learn outside a live environment",
    ],
    who: "Music enthusiasts, event production aspirants, audio hobbyists, and anyone wanting a technical, in-demand skill.",
  },
  {
    kind: "studio-recording",
    title: "Studio Recording",
    subtitle: "Professional Studio Recording Certification Course",
    why: "From music to podcasts to voiceovers, studio recording is the backbone of professional audio. This course teaches you to record and produce clean, industry-standard audio from scratch.",
    duration: "1 Month",
    schedule: "Mon to Fri, 3 hours/day",
    format: "Fully equipped recording studio",
    certification: "Certified Studio Recording Engineer",
    learn: [
      "Studio setup: mics, interfaces, monitors, acoustic treatment",
      "Recording techniques for vocals, instruments, and voiceovers",
      "DAW software basics: Pro Tools, Logic, Ableton",
      "Mixing fundamentals: EQ, compression, levels",
      "Basic mastering concepts",
      "Recording for music, podcasts, dubbing, and ads",
      "Studio session etiquette and workflow",
    ],
    choose: [
      "Train in a fully equipped, professional recording studio",
      "Practical sessions with real artists, voiceovers, and content",
      "Mentorship from working audio engineers and producers",
      "Build your own recorded and mixed demo project by course end",
      "Opens doors into music, podcasting, dubbing, and ad production",
    ],
    who: "Musicians, podcasters, voiceover aspirants, and anyone wanting to understand professional audio production.",
  },
]

// The "Why Genesis Creations Media Academy" advantages, kept as a de-boxed
// editorial list to match the About section on the home page.
const advantages: { icon: Icon; title: string; text: string }[] = [
  {
    icon: Award,
    title: "Industry-recognized certification",
    text: "Every course ends with a certificate that carries real weight with studios, agencies, and clients.",
  },
  {
    icon: Building2,
    title: "Full media infrastructure",
    text: "Studios, cameras, drones, sound equipment, and editing labs, all on campus and open for practice.",
  },
  {
    icon: Users,
    title: "Best-in-industry mentors",
    text: "You learn from people actively working in the field, not trainers reciting theory.",
  },
  {
    icon: Sparkles,
    title: "100% hands-on teaching",
    text: "A practical-first approach where you spend your time making real work, not memorising slides.",
  },
  {
    icon: Rocket,
    title: "Built to launch careers",
    text: "Designed to lead somewhere real: freelance work, a studio job, or a venture of your own.",
  },
  {
    icon: MapPin,
    title: "Chennai and Coimbatore campuses",
    text: "Two fully equipped locations across Tamil Nadu, so quality training stays within reach.",
  },
  {
    icon: Landmark,
    title: "Partnered with TAHDCO",
    text: "Working with a Government of Tamil Nadu initiative to deliver specialized training programs.",
  },
]

function CourseCard({
  course,
  index,
  onOpen,
}: {
  course: Course
  index: number
  onOpen: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const reduce = useReducedMotion()

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.08, ease: EASE_OUT }}
      className="group relative block h-full overflow-hidden rounded-3xl bg-white/5 text-left ring-1 ring-white/10 backdrop-blur-md transition-colors duration-300 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-white/[0.08] hover:ring-maroon/50"
    >
      {/* LED matrix — crimson pixels light up and glow as the cursor sweeps the
          card, behind the frosted glass. */}
      {!reduce && (
        <PixelTrail pixelSize={40} fadeDuration={650} pixelClassName="gc-led" />
      )}

      {/* Soft crimson wash on hover */}
      <span className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-maroon/20 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

      {/* Content is pointer-transparent so the LED matrix beneath lights across
          the whole card; the click still bubbles to the button. */}
      <div className="pointer-events-none relative z-10 flex h-full flex-col gap-5 p-7">
        <div className="flex items-start justify-between">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-maroon/10 text-maroon transition-colors duration-300 group-hover:bg-maroon group-hover:text-cream">
            <AnimatedCourseIcon kind={course.kind} active={hovered} className="h-6 w-6" />
          </span>
          {/* Index number, white, sits in the corner */}
          <span className="font-display text-4xl font-bold leading-none tabular-nums text-white/90">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <div>
          {course.badge && (
            <span className="mb-2 inline-block rounded-full bg-maroon/20 px-2.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-maroon ring-1 ring-maroon/40">
              {course.badge}
            </span>
          )}
          <h3 className="font-display text-2xl font-bold tracking-tight text-cream">
            {course.title}
          </h3>
          <p className="mt-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-cream/45">
            {course.subtitle}
          </p>
        </div>

        <p className="line-clamp-3 text-sm leading-relaxed text-cream/65">
          {course.why}
        </p>

        <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-2 text-xs text-cream/60">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-maroon" />
            {course.duration}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-maroon" />
            Certification
          </span>
        </div>

        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-maroon transition-transform duration-300 group-hover:translate-x-1">
          View course
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </motion.button>
  )
}

function CourseDetail({ course, onClose }: { course: Course; onClose: () => void }) {
  const meta = [
    { icon: CalendarDays, label: course.duration },
    { icon: Clock, label: course.schedule },
    { icon: Film, label: course.format },
    { icon: Award, label: course.certification },
  ]

  return (
    <div
      className="fixed inset-0 z-[70] flex justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={course.title}
      data-lenis-prevent
    >
      <div
        className="relative my-auto w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-cream backdrop-blur transition-colors hover:bg-maroon"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="overflow-hidden rounded-3xl bg-[#0a0a0c] ring-1 ring-white/10">
          {/* Header */}
          <div className="relative overflow-hidden bg-[linear-gradient(135deg,#6d1f33_0%,#2a0d15_100%)] p-7">
            <div className="absolute inset-0 opacity-30">
              <PixelTrail pixelSize={42} fadeDuration={500} pixelClassName="bg-maroon/40" />
            </div>
            <div className="relative z-10 flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-maroon text-cream">
                <AnimatedCourseIcon kind={course.kind} active className="h-7 w-7" />
              </span>
              {course.badge && (
                <span className="rounded-full bg-cream/15 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-cream">
                  {course.badge}
                </span>
              )}
            </div>
            <h2 className="relative z-10 mt-5 font-display text-2xl font-bold text-cream">
              {course.title}
            </h2>
            <p className="relative z-10 mt-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cream/70">
              {course.subtitle}
            </p>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-8 p-7">
            <p className="text-sm leading-relaxed text-cream/75">{course.why}</p>

            {/* Meta strip */}
            <div className="flex flex-wrap gap-x-7 gap-y-3 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
              {meta.map((m) => (
                <span
                  key={m.label}
                  className="inline-flex items-center gap-2 text-sm text-cream/80"
                >
                  <m.icon className="h-4 w-4 text-maroon" />
                  {m.label}
                </span>
              ))}
            </div>

            {/* Curriculum — module breakdown (diploma) or flat learn list */}
            {course.modules ? (
              <div>
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-cream/50">
                  Curriculum
                </h3>
                <div className="flex flex-col gap-4">
                  {course.modules.map((mod, i) => (
                    <div
                      key={mod.title}
                      className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10"
                    >
                      <p className="font-display text-sm font-bold text-cream">
                        <span className="text-maroon">
                          Module {i + 1}
                        </span>{" "}
                        — {mod.title}
                      </p>
                      <ul className="mt-2.5 grid gap-2 sm:grid-cols-2">
                        {mod.items.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2.5 text-sm leading-relaxed text-cream/80"
                          >
                            <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-maroon" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs italic text-cream/45">
                  Curriculum is subject to refinement before the official program launch.
                </p>
              </div>
            ) : (
              course.learn && (
                <div>
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-cream/50">
                    What you will learn
                  </h3>
                  <ul className="grid gap-2.5 sm:grid-cols-2">
                    {course.learn.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-sm leading-relaxed text-cream/80"
                      >
                        <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-maroon" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            )}

            {/* Why choose this course */}
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-cream/50">
                Why choose this course
              </h3>
              <ul className="flex flex-col gap-2.5">
                {course.choose.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm leading-relaxed text-cream/80"
                  >
                    <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-maroon" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Career opportunities (diploma) */}
            {course.careers && (
              <div>
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-cream/50">
                  Career opportunities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {course.careers.map((c) => (
                    <span
                      key={c}
                      className="rounded-full bg-cream/10 px-3 py-1 text-xs text-cream/80"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Who should join */}
            <p className="rounded-2xl bg-maroon/15 p-4 text-sm leading-relaxed text-cream/80 ring-1 ring-maroon/30">
              <span className="font-semibold text-cream">Who should join. </span>
              {course.who}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const Academy: React.FC = () => {
  const [selected, setSelected] = useState<Course | null>(null)
  const heroRef = useRef<HTMLDivElement>(null)

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
    <main className="min-h-screen bg-maroon-dark/40 text-cream">
      <SEO 
        title="Media Academy - Genesis Creations" 
        description="Join Genesis Creations Media Academy for professional courses in photography, videography, graphic design, and video editing." 
      />
      {/* Hero: team photo background under a dark scrim, full viewport height */}
      <section className="relative flex min-h-[100dvh] items-center overflow-hidden px-6 py-24 text-cream">
        <img
          src={academyHero}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-[center_35%]"
        />
        {/* Medium overall scrim for readability, solid at the bottom edge so it
            blends into the dark sections below. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.62)_0%,rgba(0,0,0,0.55)_45%,rgba(0,0,0,0.96)_100%)]" />
        <div ref={heroRef} className="relative z-10 mx-auto w-full max-w-7xl text-center">
          <Reveal>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-maroon">
              Genesis Creations
            </p>
          </Reveal>
          {/* Interactive headline — letters react to cursor proximity. */}
          <h1 className="mb-8 flex flex-col items-center font-bold uppercase leading-[0.95] tracking-tight [text-shadow:0_4px_28px_rgba(0,0,0,0.6)]">
            <TextCursorProximity
              label="MEDIA"
              className="text-7xl will-change-transform md:text-9xl lg:text-[11rem]"
              styles={PROXIMITY_STYLES}
              falloff="gaussian"
              radius={200}
              containerRef={heroRef}
            />
            <TextCursorProximity
              label="ACADEMY"
              className="text-5xl will-change-transform sm:text-6xl md:text-8xl lg:text-9xl"
              styles={PROXIMITY_STYLES}
              falloff="gaussian"
              radius={200}
              containerRef={heroRef}
            />
          </h1>
          <Reveal delay={0.1}>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-cream/85 [text-shadow:0_2px_14px_rgba(0,0,0,0.7)]">
              Industry-recognized certification courses across photography,
              film, design, and audio, taught hands-on by working
              professionals.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Courses — opens on a studio tube light glowing down from the top,
          the same effect as the home About section. */}
      <section className="gc-sep relative overflow-hidden text-cream">
        <Grain />
        <LampContainer className="bg-transparent">
          <div className="w-full px-6 pb-24">
            <Reveal className="mx-auto max-w-3xl text-center">
              <h2 className="font-display text-4xl font-bold tracking-tighter text-cream md:text-6xl text-balance">
                Certification courses
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-cream/80 md:text-lg">
                Seven focused programs, each built around real shoots, real
                sessions, and a portfolio you walk away with. Tap any course to
                see what you will learn, how it runs, and who it is for.
              </p>
            </Reveal>

            <div className="mx-auto mt-14 grid max-w-6xl items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course, i) => (
                <CourseCard
                  key={course.kind}
                  course={course}
                  index={i}
                  onOpen={() => setSelected(course)}
                />
              ))}
            </div>
          </div>
        </LampContainer>
      </section>

      {/* Why Genesis Creations Media Academy */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal className="max-w-3xl">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-maroon">
              Why Genesis Creations
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tighter text-cream md:text-5xl text-balance">
              An academy built to put you to work
            </h2>
          </Reveal>

          <RevealStagger className="mt-14 border-t border-white/10">
            {advantages.map((a, i) => (
              <RevealItem key={a.title}>
                <div className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-5 border-b border-white/10 py-7 transition-colors sm:gap-8">
                  <span className="pointer-events-none absolute inset-y-0 -inset-x-4 rounded-2xl bg-gradient-to-r from-maroon/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="relative font-display text-3xl font-bold tabular-nums leading-none text-white transition-colors duration-300 group-hover:text-maroon sm:text-5xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="relative">
                    <h3 className="font-display text-lg font-semibold tracking-tight text-cream transition-transform duration-300 group-hover:translate-x-1 sm:text-xl">
                      {a.title}
                    </h3>
                    <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-cream/60">
                      {a.text}
                    </p>
                  </div>
                  {/* Icon swaps to an arrow on hover, matching the home About list. */}
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-maroon/10 text-maroon transition-all duration-300 group-hover:rotate-3 group-hover:bg-maroon group-hover:text-cream">
                    <span className="transition-opacity duration-300 group-hover:opacity-0">
                      <a.icon className="h-5 w-5" />
                    </span>
                    <ArrowUpRight className="absolute h-5 w-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative px-6 pb-8">
        <Reveal className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#6d1f33_0%,#2a0d15_100%)] px-8 py-14 text-center sm:px-14 sm:py-16">
            <div className="absolute inset-0 opacity-25">
              <PixelTrail pixelSize={48} fadeDuration={500} pixelClassName="bg-maroon/40" />
            </div>
            <div className="relative z-10 mx-auto max-w-2xl">
              <h2 className="font-display text-3xl font-bold tracking-tight text-cream md:text-4xl">
                Looking for a shorter, intensive format?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-cream/75">
                Our hands-on workshops cover drone, gimbal, and more over a few
                focused days, with equipment, lunch, and a certificate included.
              </p>
              <Link
                to="/workshops"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-maroon px-7 py-3.5 text-sm font-semibold text-cream transition-transform hover:scale-[1.02]"
              >
                Explore workshops
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {selected && <CourseDetail course={selected} onClose={() => setSelected(null)} />}
    </main>
  )
}

export { Academy }
