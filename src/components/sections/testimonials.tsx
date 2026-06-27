import {
  ScrollReelTestimonials,
  type ScrollReelTestimonial,
} from "@/components/ui/scroll-reel-testimonials"
import { Grain } from "@/components/ui/grain"
import { Reveal } from "@/components/ui/reveal"

import johnImg from "@/assets/testimonials/student_john.png"
import jeremiahImg from "@/assets/testimonials/student_jeremiah.png"
import derrickImg from "@/assets/testimonials/student_derrick.png"

// Real Genesis Kreations Media Academy student reviews.
const reviews: ScrollReelTestimonial[] = [
  {
    quote:
      "It gave me the confidence and skills that I needed to get into the Media industry.",
    author: "John Bosco",
    image: johnImg,
    alt: "John Bosco",
  },
  {
    quote:
      "Best place to learn media course — all the basic subjects required to excel in media are covered.",
    author: "Jeremiah Philemon",
    image: jeremiahImg,
    alt: "Jeremiah Philemon",
  },
  {
    quote: "They teach from scratch so no prior knowledge is required.",
    author: "Derrick Gannon",
    image: derrickImg,
    alt: "Derrick Gannon",
  },
]

const Testimonials: React.FC = () => {
  return (
    <section
      id="testimonials"
      className="gc-dark-section gc-sep relative flex min-h-dvh flex-col justify-center overflow-hidden px-6 py-16 text-cream"
    >
      <Grain />
      <Reveal repeat className="relative z-10 mx-auto mb-10 max-w-6xl text-center">
        <h2 className="font-display text-4xl font-bold tracking-tighter text-cream md:text-6xl">
          Hear from our <span className="text-maroon">students</span>
        </h2>
      </Reveal>

      <div className="relative z-10 flex w-full justify-center">
        <ScrollReelTestimonials testimonials={reviews} />
      </div>
    </section>
  )
}

export { Testimonials }
