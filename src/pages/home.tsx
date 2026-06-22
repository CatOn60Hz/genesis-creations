import { Hero } from "@/components/sections/hero"
import { About } from "@/components/sections/about"
import { Services } from "@/components/sections/services"
import { Courses } from "@/components/sections/courses"
import { Testimonials } from "@/components/sections/testimonials"
import { SiteFooter } from "@/components/sections/site-footer"
import { Reveal } from "@/components/ui/reveal"

const Home: React.FC = () => {
  return (
    <main>
      <Hero />
      <Reveal>
        <About />
      </Reveal>
      <Reveal>
        <Services />
      </Reveal>
      <Reveal>
        <Courses />
      </Reveal>
      <Reveal>
        <Testimonials />
      </Reveal>
      <Reveal>
        <SiteFooter />
      </Reveal>
    </main>
  )
}

export { Home }
