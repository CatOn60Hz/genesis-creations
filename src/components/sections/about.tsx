import { ArrowUpRight, Wallet, Building2, GraduationCap } from "lucide-react"

import { LampContainer } from "@/components/ui/lamp"
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/reveal"

const advantages = [
  {
    icon: <Wallet />,
    title: "Affordable course fees",
    text: "Industry-grade media training that stays within reach for every aspiring creator.",
  },
  {
    icon: <Building2 />,
    title: "Well-equipped infrastructure",
    text: "Expansive classrooms and professional equipment for real, hands-on learning.",
  },
  {
    icon: <GraduationCap />,
    title: "Qualified, experienced faculty",
    text: "Learn theory and practice from working professionals and working guest lecturers.",
  },
]

const About: React.FC = () => {
  return (
    <section id="about" className="gc-sep relative min-h-screen bg-black/40 text-cream">
      <LampContainer className="bg-transparent">
        <div className="w-full px-6 pb-24">
          <Reveal repeat className="mx-auto max-w-5xl text-center">
            {/* Eyebrow — tan reads clearly on the deep maroon background */}
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-maroon">
              Welcome to Genesis Kreations
            </p>
            {/* Heading — cream for strong contrast and easy reading */}
            <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tighter text-cream text-balance">
              Preparing young minds for a{" "}
              <span className="text-maroon">career in media</span>
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-base md:text-lg leading-relaxed text-cream/85">
              We at Genesis Kreation's Academy provide you with all the necessary skills
              tailored for a solid grounding to help you jumpstart your career as a media
              professional. Gaining the right balance of knowledge and skill is much
              required in any career — our courses combine theoretical and practical
              sessions with guest lecturers.
            </p>
          </Reveal>

          {/* Editorial list — no boxes. Big index, hairline dividers, content
              floats over the beams; each row lights up on hover. */}
          <RevealStagger className="mx-auto mt-16 max-w-4xl border-t border-white/10">
            {advantages.map((a, i) => (
              <RevealItem key={a.title}>
                <div className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-5 border-b border-white/10 py-7 transition-colors sm:gap-8 sm:py-9">
                  {/* Hover wash that bleeds past the text edges. */}
                  <span className="pointer-events-none absolute inset-y-0 -inset-x-4 rounded-2xl bg-gradient-to-r from-maroon/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="relative font-display text-4xl font-bold tabular-nums leading-none text-cream/15 transition-colors duration-300 group-hover:text-maroon sm:text-6xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="relative">
                    <h3 className="font-display text-xl font-semibold tracking-tight text-cream transition-transform duration-300 group-hover:translate-x-1 sm:text-2xl">
                      {a.title}
                    </h3>
                    <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-cream/60 sm:text-base">
                      {a.text}
                    </p>
                  </div>
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-maroon/10 text-maroon transition-all duration-300 group-hover:rotate-3 group-hover:bg-maroon group-hover:text-cream [&>svg]:h-5 [&>svg]:w-5">
                    <span className="transition-opacity duration-300 group-hover:opacity-0 [&>svg]:h-5 [&>svg]:w-5">
                      {a.icon}
                    </span>
                    <ArrowUpRight className="absolute h-5 w-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </LampContainer>
    </section>
  )
}

export { About }
