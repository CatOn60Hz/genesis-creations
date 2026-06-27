import { useEffect, useRef, useState, type ComponentType } from "react"
import { Link } from "react-router-dom"
import { motion, useReducedMotion } from "framer-motion"
import {
  CircleCheck,
  ArrowRight,
  ArrowUpRight,
  Home,
  Boxes,
  SlidersHorizontal,
  Users,
  Sparkles,
  X,
  type LucideProps,
} from "lucide-react"

import { Reveal, RevealStagger, RevealItem } from "@/components/ui/reveal"
import { PixelTrail } from "@/components/ui/pixel-trail"
import { Grain } from "@/components/ui/grain"
import { LampContainer } from "@/components/ui/lamp"
import TextCursorProximity from "@/components/ui/text-cursor-proximity"
import {
  AnimatedServiceIcon,
  type ServiceKind,
} from "@/components/ui/animated-service-icon"
import { SEO } from "@/components/seo"
import studioPhoto from "@/assets/studio.jpg"

const EASE_OUT = [0.16, 1, 0.3, 1] as const

// Letters grow + turn crimson as the cursor approaches them, matching the
// Academy and Workshops hero headlines. Light base so they read over the
// darkened studio hero photo.
const PROXIMITY_STYLES = {
  transform: { from: "scale(1)", to: "scale(1.3)" },
  color: { from: "#f4eef0", to: "#cb2957" },
} as const

type Icon = ComponentType<LucideProps>

interface Service {
  kind: ServiceKind
  title: string
  subtitle: string
  intro: string
  offerLabel: string
  offer: string[]
  choose: string[]
  perfectFor: string
}

// Service catalogue lifted from the Genesis Creations services handbook. Each
// service keeps the same shape so the card and its detail modal stay dumb.
const services: Service[] = [
  {
    kind: "media-production",
    title: "Media Production",
    subtitle: "Complete production, from scratch",
    intro: "We don't just shoot, we build your project from the ground up. Our Media Production team handles every stage of the process, indoors and outdoors, for brands, individuals, and businesses alike.",
    offerLabel: "What we offer",
    offer: [
      "Script writing and story development",
      "Concept planning and creative direction",
      "Pre-production: casting, location scouting, scheduling",
      "Indoor and outdoor shoot execution",
      "Brand films and corporate videos",
      "Personal branding shoots and content",
      "Song and music video production",
      "Product shoots and commercial ads",
      "Direction, art arrangements, and on-set coordination",
      "Post-production: editing, color grading, sound design",
    ],
    choose: [
      "A single team handles everything, no juggling multiple vendors",
      "Experienced directors, cinematographers, and production crew",
      "Full media infrastructure for indoor and outdoor shoots",
      "Tailored solutions for brands, businesses, and individual creators",
      "From a 30-second ad to a full brand film, we scale to your need",
    ],
    perfectFor:
      "Brands launching campaigns, businesses needing corporate content, artists producing music videos, individuals building a personal brand, and companies needing product shoots.",
  },
  {
    kind: "studio-rental",
    title: "Studio Rental",
    subtitle: "Fully equipped studio space, on your terms",
    intro: "Need a professional studio but want to run your own production? Our soundproof, fully furnished audio and video studio is available on rent, equipped with everything you need to shoot, record, or create on your own terms.",
    offerLabel: "What's included",
    offer: [
      "Soundproof audio and video studio space",
      "Professional lighting setups",
      "Industry-standard equipment: cameras, mics, mixers, monitors",
      "Furnished, ready-to-shoot environment",
      "Flexible booking: hourly, half-day, or full-day slots",
      "Optional technical support and crew on request",
    ],
    choose: [
      "Fully soundproofed for clean audio capture",
      "No need to bring your own equipment, it is all set up and ready",
      "Suitable for video shoots, podcasts, music recording, and more",
      "Flexible rental slots that fit your shoot schedule",
      "A professional environment at accessible rates",
    ],
    perfectFor:
      "Independent creators, filmmakers, podcasters, musicians, photographers, and brands wanting to self-produce in a professional setup.",
  },
  {
    kind: "studio-production",
    title: "Studio Production",
    subtitle: "Guided sessions for music, interviews, podcasts, and photoshoots",
    intro: "Unlike a plain rental, Studio Production gives you our team's support, equipment and expertise combined, for focused sessions like music recording, interviews, podcasts, and personal branding shoots.",
    offerLabel: "What we offer",
    offer: [
      "Music production sessions: recording, mixing, mastering",
      "Live session recording and performance capture",
      "Interview setups, single or multi-camera",
      "Podcast recording in audio and video formats",
      "Photoshoots for personal branding, portfolios, and products",
      "Technical crew and direction support throughout the session",
    ],
    choose: [
      "Studio, crew, and creative guidance, all in one package",
      "Ideal for first-time podcasters, musicians, and creators",
      "Professional acoustic and lighting setup for clean output",
      "Support from experienced audio engineers and producers",
      "Flexible formats: solo sessions, panel interviews, or full bands",
    ],
    perfectFor:
      "Musicians and bands, podcast hosts, businesses conducting interviews, individuals doing personal branding shoots, and creators needing guided studio support.",
  },
  {
    kind: "broadcasting",
    title: "Broadcasting",
    subtitle: "Full-fledged broadcasting, powered by professional software",
    intro: "From live streaming events to multi-camera broadcasts, our Broadcasting service ensures your content reaches your audience in real time, smoothly, professionally, and without technical hiccups.",
    offerLabel: "What we offer",
    offer: [
      "Live event broadcasting with multi-camera setups",
      "Live streaming to YouTube, Facebook, Instagram, and more",
      "Professional broadcasting software and switching systems",
      "Real-time graphics, overlays, and branding integration",
      "Audio mixing for live broadcasts",
      "Technical crew for end-to-end broadcast management",
      "Coverage for conferences, concerts, weddings, and product launches",
    ],
    choose: [
      "Full-fledged broadcasting software for seamless live production",
      "Multi-camera, multi-platform streaming capability",
      "Experienced broadcast technicians managing the entire process",
      "Real-time branding and graphics integration",
      "Reliable execution for high-stakes live events",
    ],
    perfectFor:
      "Event organizers, corporates hosting conferences, religious and cultural events, concerts, product launches, and any event needing professional live coverage.",
  },
]

// The "one roof" advantages, drawn from the services intro and kept as a
// de-boxed editorial list to match the Academy page.
const advantages: { icon: Icon; title: string; text: string }[] = [
  {
    icon: Home,
    title: "Everything under one roof",
    text: "Concept to broadcast, handled by a single team. No stitching together separate vendors.",
  },
  {
    icon: Boxes,
    title: "Space, gear, and expertise together",
    text: "The studio, the equipment, and the crew to run it all come as one package.",
  },
  {
    icon: SlidersHorizontal,
    title: "Your call on how we work",
    text: "Have us produce the whole project, rent the studio yourself, or go live to any platform.",
  },
  {
    icon: Users,
    title: "Built for every kind of client",
    text: "Brands, creators, businesses, artists, and organizations, scaled to whatever you need.",
  },
]

function ServiceCard({
  service,
  index,
  onOpen,
}: {
  service: Service
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
      transition={{ duration: 0.55, delay: (index % 2) * 0.08, ease: EASE_OUT }}
      className="group relative block h-full overflow-hidden rounded-3xl bg-white/5 text-left ring-1 ring-white/10 backdrop-blur-md transition-colors duration-300 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-white/[0.08] hover:ring-maroon/50"
    >
      {/* LED matrix: crimson pixels light up and glow as the cursor sweeps the
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
            <AnimatedServiceIcon kind={service.kind} active={hovered} className="h-6 w-6" />
          </span>
          <span className="font-display text-4xl font-bold leading-none tabular-nums text-white/90">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <div>
          <h3 className="font-display text-2xl font-bold tracking-tight text-cream">
            {service.title}
          </h3>
          <p className="mt-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-cream/45">
            {service.subtitle}
          </p>
        </div>

        <p className="line-clamp-3 text-sm leading-relaxed text-cream/65">
          {service.intro}
        </p>

        <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-maroon transition-transform duration-300 group-hover:translate-x-1">
          View service
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </motion.button>
  )
}

function ServiceDetail({ service, onClose }: { service: Service; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[70] flex justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={service.title}
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
            <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-maroon text-cream">
              <AnimatedServiceIcon kind={service.kind} active className="h-7 w-7" />
            </div>
            <h2 className="relative z-10 mt-5 font-display text-2xl font-bold text-cream">
              {service.title}
            </h2>
            <p className="relative z-10 mt-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cream/70">
              {service.subtitle}
            </p>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-8 p-7">
            <p className="text-sm leading-relaxed text-cream/75">{service.intro}</p>

            {/* What we offer / included */}
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-cream/50">
                {service.offerLabel}
              </h3>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {service.offer.map((item) => (
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

            {/* Why choose us */}
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-cream/50">
                Why choose us
              </h3>
              <ul className="flex flex-col gap-2.5">
                {service.choose.map((item) => (
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

            {/* Perfect for */}
            <p className="rounded-2xl bg-maroon/15 p-4 text-sm leading-relaxed text-cream/80 ring-1 ring-maroon/30">
              <span className="font-semibold text-cream">Perfect for. </span>
              {service.perfectFor}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const Services: React.FC = () => {
  const [selected, setSelected] = useState<Service | null>(null)
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
        title="Services - Genesis Creations" 
        description="Discover Genesis Creations' services: Media Production, Studio Rental, Studio Production, and Live Broadcasting." 
      />
      {/* Hero: studio photo background under a dark scrim, full viewport height */}
      <section className="relative flex min-h-[100dvh] items-center overflow-hidden px-6 py-24 text-cream">
        <img
          src={studioPhoto}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Scrim for readability, solid at the bottom edge so it blends into the
            dark sections below. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.62)_0%,rgba(0,0,0,0.55)_45%,rgba(0,0,0,0.96)_100%)]" />
        <div ref={heroRef} className="relative z-10 mx-auto w-full max-w-7xl text-center">
          <Reveal>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-maroon">
              Genesis Creations
            </p>
          </Reveal>
          {/* Interactive headline: letters react to cursor proximity. */}
          <h1 className="mb-8 flex flex-col items-center font-bold uppercase leading-[0.95] tracking-tight [text-shadow:0_4px_28px_rgba(0,0,0,0.6)]">
            <TextCursorProximity
              label="OUR"
              className="text-7xl will-change-transform md:text-9xl lg:text-[11rem]"
              styles={PROXIMITY_STYLES}
              falloff="gaussian"
              radius={200}
              containerRef={heroRef}
            />
            <TextCursorProximity
              label="SERVICES"
              className="text-5xl will-change-transform sm:text-6xl md:text-8xl lg:text-9xl"
              styles={PROXIMITY_STYLES}
              falloff="gaussian"
              radius={200}
              containerRef={heroRef}
            />
          </h1>
          <Reveal delay={0.1}>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-cream/85">
              From script to screen, studio to stream, we handle it all,
              production, studio rental, guided sessions, and live broadcasting.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Services: opens on a studio tube light glowing down from the top,
          the same effect as the Academy and home sections. */}
      <section className="gc-sep relative overflow-hidden text-cream">
        <Grain />
        <LampContainer className="bg-transparent">
          <div className="w-full px-6 pb-24">
            <Reveal className="mx-auto max-w-3xl text-center">
              <h2 className="font-display text-4xl font-bold tracking-tighter text-cream md:text-6xl text-balance">
                What we do
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-cream/80 md:text-lg">
                Four ways to work with us, end to end or on your own terms. Tap
                any service to see exactly what is included and who it is for.
              </p>
            </Reveal>

            <div className="mx-auto mt-14 grid max-w-5xl items-stretch gap-6 sm:grid-cols-2">
              {services.map((service, i) => (
                <ServiceCard
                  key={service.kind}
                  service={service}
                  index={i}
                  onOpen={() => setSelected(service)}
                />
              ))}
            </div>
          </div>
        </LampContainer>
      </section>

      {/* The Genesis edge */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal className="max-w-3xl">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-maroon">
              The Genesis edge
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tighter text-cream md:text-5xl text-balance">
              One team, one roof, every stage
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
              <Sparkles className="mx-auto mb-4 h-7 w-7 text-tan" />
              <h2 className="font-display text-3xl font-bold tracking-tight text-cream md:text-4xl">
                Want to learn the craft yourself?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-cream/75">
                The same studios and professionals behind our productions also
                teach at the Genesis Creations Media Academy.
              </p>
              <Link
                to="/academy"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-maroon px-7 py-3.5 text-sm font-semibold text-cream transition-transform hover:scale-[1.02]"
              >
                Explore the Media Academy
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {selected && <ServiceDetail service={selected} onClose={() => setSelected(null)} />}
    </main>
  )
}

export { Services }
