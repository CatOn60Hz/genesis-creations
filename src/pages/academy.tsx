import { Reveal } from "@/components/ui/reveal"
import { GlowCard } from "@/components/ui/spotlight-card"
import { PixelTrail } from "@/components/ui/pixel-trail"
import { GraduationCap, Award, BookOpen, Users, PlayCircle, Handshake } from "lucide-react"

const Academy: React.FC = () => {
  return (
    <main className="min-h-screen bg-maroon-dark text-cream pt-0 pb-32">
      {/* Hero Section */}
      <section className="relative px-6 py-28 md:py-40 overflow-hidden bg-[linear-gradient(180deg,#f6e8ec_0%,#eeeeee_45%,#e4e4e7_100%)] text-maroon-dark">
        <div className="absolute inset-0 z-0 opacity-40">
           <PixelTrail pixelSize={60} fadeDuration={500} pixelClassName="bg-maroon-dark/10" />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-maroon">
            Media Academy
          </p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
            Empowering the Next Generation of <span className="text-maroon">Creators</span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg md:text-xl text-maroon-dark/80 leading-relaxed">
            Genesis Creations Media Academy provides top-tier education with an emphasis on hands-on practical experience. Learn the technical crafts of the media industry directly from experienced professionals.
          </p>
        </div>
      </section>

      {/* Core Programs */}
      <section className="px-6 py-24">
        <Reveal>
          <div className="mx-auto max-w-6xl text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-semibold text-cream">
              Our Programs &amp; Admissions
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-cream/80">
              We offer specialized courses designed for immediate industry readiness. Enroll today to kickstart your journey.
            </p>
          </div>
        </Reveal>
        
        <div className="mx-auto max-w-6xl grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Reveal delay={0.1}>
            <GlowCard glowColor="maroon" customSize className="h-full min-h-[300px]">
              <div className="flex flex-col h-full gap-4 p-4 text-center items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-maroon text-cream">
                  <PlayCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-semibold text-cream">Specialized Courses</h3>
                <p className="text-cream/70 text-sm">
                  Master Gimbal operation, Drone piloting, Aerial Cinematography, Digital Photography, and advanced Media Technology.
                </p>
              </div>
            </GlowCard>
          </Reveal>
          
          <Reveal delay={0.2}>
            <GlowCard glowColor="maroon" customSize className="h-full min-h-[300px]">
              <div className="flex flex-col h-full gap-4 p-4 text-center items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-maroon text-cream">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-semibold text-cream">Admissions Open</h3>
                <p className="text-cream/70 text-sm">
                  We welcome passionate individuals of all levels. From eligibility criteria to direct registration, we guide you at every step.
                </p>
              </div>
            </GlowCard>
          </Reveal>

          <Reveal delay={0.3}>
            <GlowCard glowColor="maroon" customSize className="h-full min-h-[300px]">
              <div className="flex flex-col h-full gap-4 p-4 text-center items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-maroon text-cream">
                  <Handshake className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-semibold text-cream">Industry Mentors</h3>
                <p className="text-cream/70 text-sm">
                  Learn from practicing professionals who bring real-world studio expertise into the classroom for unparalleled exposure.
                </p>
              </div>
            </GlowCard>
          </Reveal>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-[linear-gradient(180deg,#cb2957_0%,#a81e46_100%)] text-cream px-6 py-24">
        <Reveal>
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl md:text-5xl font-semibold text-center mb-16">
              The Genesis Advantage
            </h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="flex gap-6 items-start">
                <Award className="w-12 h-12 shrink-0 text-tan" />
                <div>
                  <h4 className="text-xl font-bold mb-2">Certification &amp; Value</h4>
                  <p className="text-cream/80">Recognized certifications that add serious weight to your portfolio. A commitment to quality education.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <Users className="w-12 h-12 shrink-0 text-tan" />
                <div>
                  <h4 className="text-xl font-bold mb-2">Networking</h4>
                  <p className="text-cream/80">Connect with a community of likeminded creators and alumni who are already transforming the industry.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <GraduationCap className="w-12 h-12 shrink-0 text-tan" />
                <div>
                  <h4 className="text-xl font-bold mb-2">Practical Approach</h4>
                  <p className="text-cream/80">We believe in learning by doing. Access top-tier studio equipment directly on campus.</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  )
}

export { Academy }
