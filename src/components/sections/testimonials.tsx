import { TestimonialSlider } from "@/components/ui/testimonial-slider-1"

import johnImg from "@/assets/testimonials/student_john.png"
import jeremiahImg from "@/assets/testimonials/student_jeremiah.png"
import derrickImg from "@/assets/testimonials/student_derrick.png"

// Real Genesis Creations Media Academy student reviews.
const reviews = [
  {
    id: 1,
    name: "John Bosco",
    affiliation: "Media Academy · Genesis Creations",
    quote:
      "It gave me the confidence and skills that I needed to get into the Media industry.",
    imageSrc: johnImg,
    thumbnailSrc: johnImg,
  },
  {
    id: 2,
    name: "Jeremiah Philemon",
    affiliation: "Media Academy · Genesis Creations",
    quote:
      "Best place to learn media course — all the basic subjects required to excel in media are covered.",
    imageSrc: jeremiahImg,
    thumbnailSrc: jeremiahImg,
  },
  {
    id: 3,
    name: "Derrick Gannon",
    affiliation: "Media Academy · Genesis Creations",
    quote: "They teach from scratch so no prior knowledge is required.",
    imageSrc: derrickImg,
    thumbnailSrc: derrickImg,
  },
]

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="flex min-h-screen flex-col justify-center bg-maroon-dark text-cream py-16 px-6">
      <div className="mx-auto mb-8 max-w-6xl text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-maroon">
          What Our Students Say
        </p>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-cream">
          Hear From Our Students
        </h2>
      </div>

      <div className="mx-auto max-w-6xl">
        <TestimonialSlider reviews={reviews} />
      </div>
    </section>
  )
}

export { Testimonials }
