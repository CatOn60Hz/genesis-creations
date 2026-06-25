import { Wallet, Building2, GraduationCap } from "lucide-react"

import { GlowCard } from "@/components/ui/spotlight-card"
import { LampContainer } from "@/components/ui/lamp"

const advantages = [
  {
    icon: <Wallet />,
    title: "Affordable Course Fees",
    text: "Industry-grade media training that stays within reach for every aspiring creator.",
  },
  {
    icon: <Building2 />,
    title: "Well-Equipped Infrastructure",
    text: "Expansive classrooms and professional equipment for real, hands-on learning.",
  },
  {
    icon: <GraduationCap />,
    title: "Qualified, Experienced Faculty",
    text: "Learn theory and practice from working professionals and guest lecturers.",
  },
]

const About: React.FC = () => {
  return (
    <section id="about" className="min-h-screen bg-maroon-dark text-cream">
      <LampContainer>
        <div className="w-full px-6 pb-24">
          <div className="mx-auto max-w-5xl text-center">
            {/* Eyebrow — tan reads clearly on the deep maroon background */}
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-tan">
              Welcome to Genesis Creations
            </p>
            {/* Heading — cream for strong contrast and easy reading */}
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-cream">
              Preparing Young Minds for a{" "}
              <span className="text-tan">Career in Media</span>
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-base md:text-lg leading-relaxed text-cream/85">
              We at Genesis Creation's Academy provide you with all the necessary skills
              tailored for a solid grounding to help you jumpstart your career as a media
              professional. Gaining the right balance of knowledge and skill is much
              required in any career — our courses combine theoretical and practical
              sessions with guest lecturers.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-3">
            {advantages.map((a) => (
              <GlowCard
                key={a.title}
                glowColor="maroon"
                customSize
                className="h-full min-h-[280px]"
              >
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-maroon text-cream shadow-lg [&>svg]:h-6 [&>svg]:w-6">
                    {a.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-cream">{a.title}</h3>
                  <p className="text-sm leading-relaxed text-cream/75">{a.text}</p>
                </div>
              </GlowCard>
            ))}
          </div>
        </div>
      </LampContainer>
    </section>
  )
}

export { About }
