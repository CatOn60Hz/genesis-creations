import { useEffect, useState } from "react"

import {
  ScrollReelTestimonials,
  type ScrollReelTestimonial,
} from "@/components/ui/scroll-reel-testimonials"
import { Grain } from "@/components/ui/grain"
import { Reveal } from "@/components/ui/reveal"
import { fetchTestimonials } from "@/lib/cms-api"

import johnImg from "@/assets/testimonials/student_john.png"
import jeremiahImg from "@/assets/testimonials/student_jeremiah.png"
import derrickImg from "@/assets/testimonials/student_derrick.png"

// Built-in defaults — shown until the CMS responds, and as a fallback if the
// API is empty or unreachable. The backend seeds these same reviews on first
// run, so /admin starts with them ready to edit.
const fallbackReviews: ScrollReelTestimonial[] = [
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
  const [reviews, setReviews] = useState<ScrollReelTestimonial[]>(fallbackReviews)

  useEffect(() => {
    let active = true
    fetchTestimonials()
      .then((items) => {
        if (!active) return
        // A testimonial needs both a quote and a portrait to render in the reel.
        const mapped = items
          .filter((t) => t.quote && t.image?.url)
          .map<ScrollReelTestimonial>((t) => ({
            quote: t.quote,
            author: t.author,
            image: t.image!.url,
            alt: t.author,
          }))
        if (mapped.length) setReviews(mapped)
      })
      .catch(() => {
        /* keep fallback reviews */
      })
    return () => {
      active = false
    }
  }, [])

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
