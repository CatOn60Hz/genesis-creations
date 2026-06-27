import { useEffect, useRef, useState, type ComponentType } from "react"
import { Link } from "react-router-dom"
import { motion, useReducedMotion } from "framer-motion"
import {
  CircleCheck,
  ArrowRight,
  ArrowUpRight,
  UserRound,
  Share2,
  Target,
  Palette,
  ClipboardList,
  Compass,
  Boxes,
  BarChart3,
  Sparkles,
  X,
  type LucideProps,
} from "lucide-react"

import { Reveal, RevealStagger, RevealItem } from "@/components/ui/reveal"
import { PixelTrail } from "@/components/ui/pixel-trail"
import { Grain } from "@/components/ui/grain"
import { LampContainer } from "@/components/ui/lamp"
import TextCursorProximity from "@/components/ui/text-cursor-proximity"
import dmHero from "@/assets/digital-marketing-hero.jpg"

const EASE_OUT = [0.16, 1, 0.3, 1] as const

// Letters grow + turn crimson as the cursor approaches them. Light base so they
// read over the darkened hero photo, matching the Academy/Workshops headlines.
const PROXIMITY_STYLES = {
  transform: { from: "scale(1)", to: "scale(1.3)" },
  color: { from: "#f4eef0", to: "#cb2957" },
} as const

type Icon = ComponentType<LucideProps>

interface Service {
  icon: Icon
  title: string
  subtitle: string
  intro: string
  offerLabel: string
  offer: string[]
  choose?: string[]
  perfectFor?: string
}

// Digital Marketing catalogue, lifted from the Genesis Creations handbook. Same
// shape as the Services page so the card + detail modal stay dumb.
const services: Service[] = [
  {
    icon: UserRound,
    title: "Self Branding",
    subtitle: "Become the brand people recognize",
    intro:
      "Whether you're a professional, an entrepreneur, an artist, or a public figure, how you present yourself online shapes how the world perceives you. We help you define and build a personal brand that reflects who you are and what you stand for.",
    offerLabel: "What we offer",
    offer: [
      "Personal brand strategy and positioning",
      "Defining your unique voice, story, and niche",
      "Visual identity for your personal brand (look, tone, aesthetic)",
      "Content direction aligned with your brand persona",
      "Cross-platform brand consistency (Instagram, LinkedIn, YouTube, etc.)",
    ],
    choose: [
      "Strategy built around your real strengths and story, not templates",
      "Combined with our in-house production for branded shoots and content",
      "Helps professionals, creators, and entrepreneurs stand out in crowded spaces",
    ],
    perfectFor:
      "Entrepreneurs, professionals, public figures, consultants, and creators building a personal name in their industry.",
  },
  {
    icon: Share2,
    title: "Social Media Management",
    subtitle: "Consistent, strategic presence — without you lifting a finger",
    intro:
      "Posting randomly doesn't grow an audience — strategy does. We manage your social media end-to-end, so your pages stay active, on-brand, and aligned with your growth goals every single day.",
    offerLabel: "What we offer",
    offer: [
      "Platform management (Instagram, Facebook, LinkedIn, YouTube, and more)",
      "Content calendar planning and scheduling",
      "Caption writing, hashtag strategy, and posting",
      "Community management and engagement",
      "Performance tracking and monthly reporting",
      "Trend monitoring and timely content adaptation",
    ],
    choose: [
      "Dedicated team managing your pages consistently, not sporadically",
      "Data-backed posting strategy, not guesswork",
      "Seamless integration with our content production and design teams",
    ],
    perfectFor:
      "Businesses, brands, and individuals who want a strong, consistent social media presence without managing it themselves.",
  },
  {
    icon: Target,
    title: "Google & Meta Ads",
    subtitle: "Get seen by the right people, at the right time",
    intro:
      "Organic reach alone isn't enough anymore. We run targeted ad campaigns on Google and Meta (Facebook & Instagram) designed to put your brand in front of the people most likely to convert — customers, clients, or followers.",
    offerLabel: "What we offer",
    offer: [
      "Google Ads (Search, Display, YouTube campaigns)",
      "Meta Ads (Facebook & Instagram campaigns)",
      "Audience research and targeting strategy",
      "Ad creative and copywriting",
      "A/B testing and campaign optimization",
      "Budget planning and ROI-focused management",
      "Performance analytics and reporting",
    ],
    choose: [
      "Campaigns built on audience data, not assumptions",
      "Continuous optimization to improve cost-per-result over time",
      "Ad creatives produced in-house by our design and production teams",
    ],
    perfectFor:
      "Businesses wanting measurable leads and sales, brands launching products, and anyone needing faster, targeted visibility.",
  },
  {
    icon: Palette,
    title: "Brand Development",
    subtitle: "From identity to every touchpoint — build a brand that lasts",
    intro:
      "A logo isn't a brand. We build your complete identity — what your brand looks like, sounds like, and stands for — and carry that identity consistently across every platform and profile your audience sees.",
    offerLabel: "What we offer",
    offer: [
      "Brand identity development (logo, colors, typography, tone)",
      "Brand guidelines and style documentation",
      "Messaging and brand voice development",
      "Market positioning and competitor analysis",
      "Profile & platform optimization — bios, highlights, page layout, grid/theme planning, and visual consistency across Instagram, LinkedIn, and other platforms",
      "Brand collateral design (social templates, business materials)",
    ],
  },
  {
    icon: ClipboardList,
    title: "Content Planning",
    subtitle: "Strategy behind every post — not just random content",
    intro:
      "Great content doesn't happen by chance — it's planned around goals, audience behavior, and platform trends. We build content strategies and calendars that keep your brand relevant and consistent.",
    offerLabel: "What we offer",
    offer: [
      "Content strategy aligned with brand goals",
      "Monthly and weekly content calendars",
      "Content pillars and theme planning",
      "Platform-specific content adaptation (Reels, Posts, Stories, Shorts)",
      "Trend research and content ideation",
      "Coordination with the production team for shoots and edits",
    ],
    choose: [
      "Strategic planning backed by audience and trend insights",
      "Direct pipeline into our in-house shoot and editing teams",
      "Consistency that compounds — not one-off content bursts",
    ],
  },
]

// The "why us" advantages, drawn from the recurring themes across the services
// and kept as a de-boxed editorial list to match the Academy/Services pages.
const advantages: { icon: Icon; title: string; text: string }[] = [
  {
    icon: Compass,
    title: "Strategy, not templates",
    text: "Every plan is built around your real story, audience, and goals — never a recycled formula.",
  },
  {
    icon: Boxes,
    title: "Built in-house, end to end",
    text: "Strategy, shoots, design, and ads handled by one connected team, not stitched across vendors.",
  },
  {
    icon: BarChart3,
    title: "Decisions backed by data",
    text: "Posting, targeting, and budgets driven by audience and performance data, not guesswork.",
  },
  {
    icon: Sparkles,
    title: "Consistency that compounds",
    text: "A steady, on-brand presence across every platform that builds recognition over time.",
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
  const reduce = useReducedMotion()
  const Icon = service.icon

  return (
    <motion.button
      type="button"
      onClick={onOpen}
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
            <Icon className="h-6 w-6" />
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
  const Icon = service.icon

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
              <Icon className="h-7 w-7" />
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

            {/* What we offer */}
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
            {service.choose && service.choose.length > 0 && (
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
            )}

            {/* Perfect for */}
            {service.perfectFor && (
              <p className="rounded-2xl bg-maroon/15 p-4 text-sm leading-relaxed text-cream/80 ring-1 ring-maroon/30">
                <span className="font-semibold text-cream">Perfect for. </span>
                {service.perfectFor}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const DigitalMarketing: React.FC = () => {
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
      {/* Hero: gaming-lounge photo background under a dark scrim, full height */}
      <section className="relative flex min-h-[100dvh] items-center overflow-hidden px-6 py-24 text-cream">
        <img
          src={dmHero}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        {/* Scrim for readability, solid at the bottom edge so it blends into the
            dark sections below. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0.5)_45%,rgba(0,0,0,0.96)_100%)]" />
        <div ref={heroRef} className="relative z-10 mx-auto w-full max-w-7xl text-center">
          <Reveal>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-maroon">
              Genesis Creations
            </p>
          </Reveal>
          {/* Interactive headline: letters react to cursor proximity. */}
          <h1 className="mb-8 flex flex-col items-center font-bold uppercase leading-[0.95] tracking-tight [text-shadow:0_4px_28px_rgba(0,0,0,0.6)]">
            <TextCursorProximity
              label="DIGITAL"
              className="text-5xl will-change-transform sm:text-7xl md:text-9xl lg:text-[10rem]"
              styles={PROXIMITY_STYLES}
              falloff="gaussian"
              radius={200}
              containerRef={heroRef}
            />
            <TextCursorProximity
              label="MARKETING"
              className="text-[2.5rem] will-change-transform sm:text-6xl md:text-8xl lg:text-9xl"
              styles={PROXIMITY_STYLES}
              falloff="gaussian"
              radius={200}
              containerRef={heroRef}
            />
          </h1>
          <Reveal delay={0.1}>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-cream/85 [text-shadow:0_2px_14px_rgba(0,0,0,0.7)]">
              Build a brand people remember and grow an audience that converts.
              Your online presence is the first impression you make — we help you
              build it right and turn it into consistent growth.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Services: opens on a studio tube light glowing down from the top,
          the same effect as the Academy and Services pages. */}
      <section className="gc-sep relative overflow-hidden text-cream">
        <Grain />
        <LampContainer className="bg-transparent">
          <div className="w-full px-6 pb-24">
            <Reveal className="mx-auto max-w-3xl text-center">
              <h2 className="font-display text-4xl font-bold tracking-tighter text-cream md:text-6xl text-balance">
                What we do
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-cream/80 md:text-lg">
                Five ways we grow your brand online, from first impression to
                steady conversion. Tap any service to see exactly what's included
                and who it's for.
              </p>
            </Reveal>

            <div className="mx-auto mt-14 grid max-w-5xl items-stretch gap-6 sm:grid-cols-2">
              {services.map((service, i) => (
                <ServiceCard
                  key={service.title}
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
              Strategy, content, and ads — under one roof
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
                Need the content behind the strategy?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-cream/75">
                The same in-house team that runs your campaigns also shoots,
                edits, and designs everything they run on.
              </p>
              <Link
                to="/services"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-maroon px-7 py-3.5 text-sm font-semibold text-cream transition-transform hover:scale-[1.02]"
              >
                Explore our Production services
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

export { DigitalMarketing }
