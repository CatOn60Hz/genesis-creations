import {
  TestimonialsSection,
  type Testimonial,
} from "@/components/ui/simple-animated-testimonials"

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "John Bosco",
    role: "Media Academy Student",
    company: "Genesis Creations",
    content:
      "It gave me the confidence and skills that I needed to get into the Media industry.",
    rating: 5,
    avatar: "https://genesiscreations.in/assets/img/testimony4.png",
  },
  {
    id: 2,
    name: "Jeremiah Philemon",
    role: "Media Academy Student",
    company: "Genesis Creations",
    content:
      "Best place to learn media course — all the basic subjects required to excel in media are covered.",
    rating: 5,
    avatar: "https://genesiscreations.in/assets/img/testimony2.png",
  },
  {
    id: 3,
    name: "Derrick Gannon",
    role: "Media Academy Student",
    company: "Genesis Creations",
    content: "They teach from scratch so no prior knowledge is required.",
    rating: 5,
    avatar: "https://genesiscreations.in/assets/img/testimony3.png",
  },
]

const Testimonials: React.FC = () => {
  return (
    <TestimonialsSection
      title="What Our Students Say"
      subtitle="Hear from students who launched their media careers with Genesis Creations."
      testimonials={testimonials}
      showVerifiedBadge={true}
      className="bg-tan/40 text-cream"
    />
  )
}

export { Testimonials }
