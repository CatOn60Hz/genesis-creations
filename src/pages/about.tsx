import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import {
  CircleCheck,
  Award,
  Boxes,
  Wrench,
  Building2,
  Rocket,
  Gem,
  Handshake,
  GraduationCap,
  Heart,
  Quote,
  RotateCw,
  ArrowRight,
  type LucideProps,
} from "lucide-react"
import { type ComponentType } from "react"

import { Reveal, RevealStagger, RevealItem } from "@/components/ui/reveal"
import { PixelTrail } from "@/components/ui/pixel-trail"
import { Grain } from "@/components/ui/grain"
import { LampContainer } from "@/components/ui/lamp"
import TextCursorProximity from "@/components/ui/text-cursor-proximity"
import { FaqPro, type FaqProItem } from "@/components/ui/faq-pro"
import { LinkedInIcon, InstagramIcon } from "@/components/ui/social-icons"
import { SEO } from "@/components/seo"
import aboutHero from "@/assets/about-hero.jpg"
import { usePageBackground } from "@/lib/use-page-background"
import { fetchFaqs } from "@/lib/cms-api"
import visionImg from "@/assets/vision.jpg"
import founderImg from "@/assets/founder.jpg"

type Icon = ComponentType<LucideProps>

// Light base letters so they read over the darkened hero photo, matching the
// Academy/Workshops/Services headlines.
const PROXIMITY_STYLES = {
  transform: { from: "scale(1)", to: "scale(1.3)" },
  color: { from: "#f4eef0", to: "#cb2957" },
} as const

const aboutParagraphs = [
  "At Genesis Kreations, we believe every great story deserves to be told with creativity, purpose, and excellence. We are a full-service media production company and media academy dedicated to delivering high-quality visual content while nurturing the next generation of creative professionals.",
  "Our expertise spans video production, photography, live broadcasting, digital marketing, studio production, and professional media training. By combining industry experience with innovative technology, we create impactful visual experiences that help businesses, brands, organizations, and individuals communicate their message effectively.",
  "Beyond media production, we're committed to empowering aspiring creators through practical, industry-oriented education — hands-on training, real-world project exposure, and mentorship from experienced professionals, so students graduate with the confidence and skills to succeed in the creative industry.",
]

const mission = [
  "Deliver world-class media production services that exceed client expectations.",
  "Provide practical, industry-driven media education that equips students with real-world skills.",
  "Foster creativity, innovation, and professionalism in every project we undertake.",
  "Build lasting partnerships through integrity, quality, and exceptional customer service.",
  "Continuously embrace emerging technologies and creative trends to stay at the forefront of the media industry.",
  "Create opportunities for aspiring media professionals through mentorship, hands-on experience, and career-focused training.",
  "Make a positive impact on businesses, communities, and society through meaningful visual storytelling.",
]

const reasons: { icon: Icon; title: string; text: string }[] = [
  {
    icon: Award,
    title: "Industry expertise",
    text: "Extensive experience across media production, digital storytelling, and creative education — technical excellence paired with artistic vision.",
  },
  {
    icon: Boxes,
    title: "Comprehensive solutions",
    text: "From concept and video production to photography, live broadcasting, digital marketing, and training — end to end, under one roof.",
  },
  {
    icon: Wrench,
    title: "Hands-on learning",
    text: "Practical learning through live projects, professional equipment, and mentorship from working industry professionals.",
  },
  {
    icon: Building2,
    title: "State-of-the-art infrastructure",
    text: "Modern studios, advanced production gear, and industry-standard editing facilities that encourage creativity and excellence.",
  },
  {
    icon: Rocket,
    title: "Innovation-driven",
    text: "We continuously adopt emerging technologies, creative techniques, and best practices to keep clients and students ahead.",
  },
  {
    icon: Gem,
    title: "Quality without compromise",
    text: "Every project reflects our commitment to precision and excellence — work that doesn't just meet expectations, it exceeds them.",
  },
  {
    icon: Handshake,
    title: "Client-centric philosophy",
    text: "Long-term relationships built on trust, transparency, and collaboration — understanding your vision before we create.",
  },
  {
    icon: GraduationCap,
    title: "Career-focused training",
    text: "Programs designed to bridge learning and industry requirements, building the practical skills careers actually need.",
  },
  {
    icon: Heart,
    title: "Passion for excellence",
    text: "Creativity is more than a profession — it's our purpose. We inspire ideas, empower talent, and create work that lasts.",
  },
]

const milestones = [
  { year: "2012–2016", text: "Bachelor's in Electronics & Media Technology, Karunya Institute of Technology and Sciences" },
  { year: "2015–2016", text: "Student Coordinator, Campus Television Channel" },
  { year: "2016", text: "Built an award-winning drone-based engineering project" },
  { year: "2016", text: "Established the department's first student-led OB Van setup" },
  { year: "2016–2017", text: "Media Professional at JC Media" },
  { year: "11 Dec 2017", text: "Founded Genesis Kreations" },
  { year: "2020", text: "Launched Genesis Kreations Media Academy" },
  { year: "2025", text: "Partnered with TAHDCO to train 30 students" },
  { year: "2026", text: "Expanded workshops to Chennai and Coimbatore" },
]

const founderBio = [
  "For Jerophin Deril S, media has never been just a profession — it has always been a passion. From a young age he was fascinated by photography and filmmaking, spending countless hours capturing moments on his phone and experimenting with editing long before it became a career.",
  "He pursued a Bachelor's in Electronics & Media Technology at Karunya Institute of Technology and Sciences (2012–2016), a program that uniquely combined engineering with professional media production. He spent much of his time in the television studio and Production Control Room, became Student Coordinator of the campus channel, built his own drone for an award-winning final-year project, and set up the department's first student-led OB Van.",
  "After gaining industry experience at JC Media, he founded Genesis Kreations on 11 December 2017 — specializing in media production, live broadcasting, streaming, and television programs. During the COVID-19 pandemic he transformed it into a media academy, redesigning his four-year engineering curriculum into an intensive three-month practical training program.",
  "A licensed drone pilot, he introduced specialized training in drone cinematography, gimbal filmmaking, and advanced production. Today his expertise spans photography, videography, editing, live broadcasting, drone cinematography, audio production, gimbal and Steadicam operation, and creative direction.",
]

// Built-in defaults — shown until the CMS responds and as a fallback. The FAQ
// backend seeds these same questions on first run, so /admin → FAQ starts with
// them ready to edit, and edits show up here on the About page.
const fallbackFaqs: FaqProItem[] = [
  {
    id: "services",
    question: "What services does Genesis Kreations offer?",
    answer: "We provide media production, photography, videography, live streaming, digital marketing, studio rental, corporate training, and a professional media academy offering industry-focused courses.",
  },
  {
    id: "enroll",
    question: "Who can enroll in the Media Academy?",
    answer: "Our courses are open to students, graduates, working professionals, entrepreneurs, and anyone passionate about building a career in media and content creation.",
  },
  {
    id: "experience",
    question: "Do I need prior experience to join a course?",
    answer: "No. We offer beginner-friendly programs as well as advanced training for learners who want to enhance their professional skills.",
  },
  {
    id: "certificate",
    question: "Will I receive a certificate after completing a course?",
    answer: "Yes. Participants receive a course completion certificate upon successfully fulfilling the program requirements.",
  },
  {
    id: "practical",
    question: "Are the classes practical or theory-based?",
    answer: "Our training emphasizes hands-on learning through live projects, professional equipment, and real-world assignments, supported by essential theoretical concepts.",
  },
  {
    id: "corporate",
    question: "Do you provide corporate media services?",
    answer: "Yes. We work with businesses, brands, educational institutions, and organizations to produce commercials, corporate films, promotional videos, event coverage, and digital content.",
  },
  {
    id: "studio",
    question: "Can I rent your studio?",
    answer: "Yes. Our studio facilities are available for professional shoots, interviews, podcasts, product photography, video production, and other creative projects, subject to availability.",
  },
  {
    id: "custom-training",
    question: "Do you offer customized training programs?",
    answer: "Yes. We design customized workshops and corporate training programs based on the learning objectives and requirements of organizations and institutions.",
  },
  {
    id: "quotation",
    question: "How can I request a quotation for a project?",
    answer: "Contact us through our website, email, or phone with your project details, and our team will provide a customized quotation.",
  },
  {
    id: "contact",
    question: "How can I contact Genesis Kreations?",
    answer: "You can reach us through the Contact Us page, by phone, email, or by visiting our office. Our team will be happy to assist you.",
  },
]

const About: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null)
  const [flipped, setFlipped] = useState(false)
  const heroBg = usePageBackground("about", aboutHero)
  const [faqs, setFaqs] = useState<FaqProItem[]>(fallbackFaqs)

  // Load CMS-managed FAQ; keep the built-in defaults on empty/error.
  useEffect(() => {
    let active = true
    fetchFaqs()
      .then((items) => {
        if (active && items.length) {
          setFaqs(
            items.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))
          )
        }
      })
      .catch(() => {
        /* keep fallback faqs */
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <main className="min-h-screen bg-maroon-dark/40 text-cream">
      <SEO 
        title="About Us - Genesis Kreations" 
        description="Learn more about Genesis Kreations, our vision, mission, and the founder behind our media production company and academy." 
      />
      {/* Hero: team photo background under a dark scrim, full viewport height */}
      <section className="relative flex min-h-[100dvh] items-center overflow-hidden px-6 py-24 text-cream">
        <img
          src={heroBg}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
        />
        {/* Scrim for readability, solid at the bottom edge so it blends into the
            dark sections below. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0.5)_45%,rgba(0,0,0,0.96)_100%)]" />
        <div ref={heroRef} className="relative z-10 mx-auto w-full max-w-7xl text-center">
          <Reveal>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-maroon">
              Genesis Kreations
            </p>
          </Reveal>
          <h1 className="mb-8 flex flex-col items-center font-bold uppercase leading-[0.95] tracking-tight [text-shadow:0_4px_28px_rgba(0,0,0,0.6)]">
            <TextCursorProximity
              label="ABOUT"
              className="text-6xl will-change-transform sm:text-7xl md:text-9xl lg:text-[11rem]"
              styles={PROXIMITY_STYLES}
              falloff="gaussian"
              radius={200}
              containerRef={heroRef}
            />{" "}
            <TextCursorProximity
              label="US"
              className="text-6xl will-change-transform sm:text-7xl md:text-9xl lg:text-[11rem]"
              styles={PROXIMITY_STYLES}
              falloff="gaussian"
              radius={200}
              containerRef={heroRef}
            />
          </h1>
          <Reveal delay={0.1}>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-cream/85 [text-shadow:0_2px_14px_rgba(0,0,0,0.7)]">
              A full-service media production company and academy — creating with
              excellence and inspiring through innovation.
            </p>
          </Reveal>
        </div>
      </section>

      {/* About Us narrative */}
      <section className="gc-sep relative overflow-hidden px-6 py-24">
        <Grain />
        <div className="relative z-10 mx-auto max-w-3xl">
          <Reveal>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-maroon">
              Who we are
            </p>
          </Reveal>
          <div className="flex flex-col gap-6">
            {aboutParagraphs.map((p, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <p
                  className={
                    i === 0
                      ? "text-xl leading-relaxed text-cream md:text-2xl"
                      : "text-base leading-relaxed text-cream/70 md:text-lg"
                  }
                >
                  {p}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="relative px-6 py-12">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
          {/* Vision */}
          <Reveal>
            <div className="relative h-full min-h-[20rem] overflow-hidden rounded-3xl p-8 ring-1 ring-white/10">
              {/* Team photo background with a dark crimson scrim for readability */}
              <img
                src={visionImg}
                alt=""
                aria-hidden
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.45)_0%,rgba(0,0,0,0.72)_100%)]" />
              <div className="relative z-10">
                <h2 className="font-display text-2xl font-bold text-cream">Our vision</h2>
                <p className="mt-4 leading-relaxed text-cream/80">
                  To become a globally recognized creative media company and
                  premier media academy — inspiring innovation, transforming ideas
                  into impactful visual experiences, and empowering future
                  generations of creative professionals through excellence in
                  media education and production.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Mission */}
          <Reveal delay={0.08}>
            <div className="h-full rounded-3xl bg-white/5 p-8 ring-1 ring-white/10">
              <h2 className="font-display text-2xl font-bold text-cream">Our mission</h2>
              <ul className="mt-5 flex flex-col gap-3">
                {mission.map((m) => (
                  <li key={m} className="flex items-start gap-2.5 text-sm leading-relaxed text-cream/75">
                    <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-maroon" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Founder */}
      <section className="gc-sep relative overflow-hidden px-6 py-24">
        <Grain />
        <div className="relative z-10 mx-auto max-w-6xl">
          <Reveal className="text-center">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-maroon">
              The founder
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tighter text-cream md:text-5xl text-balance">
              Meet Jerophin Deril S
            </h2>
          </Reveal>

          <div className="mt-14 grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
            {/* Flip card: founder photo on the front, milestones on the back. */}
            <Reveal>
              <div className="[perspective:1800px]">
                <div
                  role="button"
                  tabIndex={0}
                  aria-pressed={flipped}
                  aria-label={
                    flipped
                      ? "Show founder photo"
                      : "Show professional milestones"
                  }
                  onClick={() => setFlipped((v) => !v)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setFlipped((v) => !v)
                    }
                  }}
                  className="relative block w-full cursor-pointer rounded-3xl outline-none transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] [transform-style:preserve-3d] focus-visible:ring-2 focus-visible:ring-maroon/60"
                  style={{ transform: flipped ? "rotateY(180deg)" : undefined }}
                >
                  {/* Back — milestones. Sits in normal flow so it defines the
                      card height; the whole timeline fits with no scrolling. */}
                  <div className="flex flex-col rounded-3xl bg-[linear-gradient(160deg,#2a0d15_0%,#120308_100%)] p-6 ring-1 ring-white/10 sm:p-7 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                    <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-cream/50 sm:mb-5">
                      Professional milestones
                    </h3>
                    <div className="border-l border-white/10 pl-5">
                      {milestones.map((m, i) => (
                        <div key={i} className="relative pb-3.5 last:pb-0">
                          <span className="absolute -left-[27px] top-1.5 h-2 w-2 rounded-full bg-maroon ring-4 ring-maroon-dark/40" />
                          <p className="font-display text-xs font-bold tabular-nums text-maroon">
                            {m.year}
                          </p>
                          <p className="mt-0.5 text-[13px] leading-snug text-cream/75">
                            {m.text}
                          </p>
                        </div>
                      ))}
                    </div>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-xs text-cream/50">
                      <RotateCw className="h-3.5 w-3.5" /> Tap to flip back
                    </span>
                  </div>

                  {/* Front — photo, absolutely fills the card. */}
                  <div className="absolute inset-0 overflow-hidden rounded-3xl ring-1 ring-white/10 [backface-visibility:hidden]">
                    <img
                      src={founderImg}
                      alt="Jerophin Deril S, Founder & Managing Director of Genesis Kreations"
                      loading="lazy"
                      className="h-full w-full object-cover"
                      style={{ objectPosition: "38% 30%" }}
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5">
                      <div>
                        <p className="font-display text-lg font-bold text-cream">
                          Jerophin Deril S
                        </p>
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-cream/60">
                          Founder &amp; Managing Director
                        </p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-cream backdrop-blur">
                        <RotateCw className="h-3.5 w-3.5" /> Milestones
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="https://www.linkedin.com/in/jerophin-deril-88243190"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-cream transition-colors hover:bg-maroon"
                >
                  <LinkedInIcon className="h-4 w-4" /> LinkedIn
                </a>
                <a
                  href="https://instagram.com/jerophinderil_official"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-cream transition-colors hover:bg-maroon"
                >
                  <InstagramIcon className="h-4 w-4" /> Instagram
                </a>
              </div>
            </Reveal>

            {/* Bio + quote */}
            <div>
              <Reveal>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cream/50">
                  Founder &amp; Managing Director
                </p>
              </Reveal>
              <div className="mt-5 flex flex-col gap-4">
                {founderBio.map((p, i) => (
                  <Reveal key={i} delay={i * 0.04}>
                    <p className="text-base leading-relaxed text-cream/75">{p}</p>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={0.1}>
                <blockquote className="relative mt-7 rounded-2xl bg-maroon/15 p-5 pl-12 text-cream/90 ring-1 ring-maroon/30">
                  <Quote className="absolute left-4 top-5 h-5 w-5 text-maroon" />
                  <p className="italic leading-relaxed">
                    When passion is combined with knowledge, innovation, and
                    perseverance, creativity has the power to transform lives.
                  </p>
                </blockquote>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Why choose us — opens on a studio tube light glowing down from the top,
          the same effect as the Academy/Services pages. */}
      <section className="gc-sep relative overflow-hidden text-cream">
        <Grain />
        <LampContainer className="bg-transparent">
          <div className="w-full px-6 pb-24">
            <Reveal className="mx-auto max-w-3xl text-center">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-maroon">
                Why Genesis Kreations
              </p>
              <h2 className="font-display text-3xl font-bold tracking-tighter text-cream md:text-6xl text-balance">
                Built on craft, taught with heart
              </h2>
            </Reveal>

            <RevealStagger className="mx-auto mt-14 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {reasons.map((r) => (
                <RevealItem key={r.title}>
                  <div className="group relative h-full overflow-hidden rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-md transition-colors duration-300 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-white/[0.08] hover:ring-maroon/50">
                    {/* LED matrix: crimson pixels light up as the cursor sweeps. */}
                    <PixelTrail pixelSize={40} fadeDuration={650} pixelClassName="gc-led" />
                    <div className="pointer-events-none relative z-10">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-maroon/10 text-maroon transition-colors duration-300 group-hover:bg-maroon group-hover:text-cream">
                        <r.icon className="h-6 w-6" />
                      </span>
                      <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-cream">
                        {r.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-cream/65">{r.text}</p>
                    </div>
                  </div>
                </RevealItem>
              ))}
            </RevealStagger>
          </div>
        </LampContainer>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <Reveal className="text-center">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-maroon">
              Questions
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tighter text-cream md:text-5xl text-balance">
              Frequently asked questions
            </h2>
          </Reveal>
          <div className="mt-12">
            <FaqPro items={faqs} defaultOpenFirst className="max-w-none" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-6 pb-8">
        <Reveal className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#6d1f33_0%,#2a0d15_100%)] px-8 py-14 text-center sm:px-14 sm:py-16">
            <div className="absolute inset-0 opacity-25">
              <PixelTrail pixelSize={48} fadeDuration={500} pixelClassName="bg-maroon/40" />
            </div>
            <div className="relative z-10 mx-auto max-w-2xl">
              <h2 className="font-display text-3xl font-bold tracking-tight text-cream md:text-4xl">
                Let's bring your vision to life
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-cream/75">
                Enroll in a course, book a studio, plan a production, or grow your
                brand — we're just a message away.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-maroon px-7 py-3.5 text-sm font-semibold text-cream transition-transform hover:scale-[1.02]"
                >
                  Explore our services
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="https://wa.me/917824850999"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-white/20"
                >
                  Message us on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  )
}

export { About }
