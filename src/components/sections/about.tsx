import { Wallet, Building2, GraduationCap } from "lucide-react"

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
    <section id="about" className="bg-maroon-dark text-cream py-24 px-6">
      <div className="mx-auto max-w-5xl text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-maroon">
          Welcome to Genesis Creations
        </p>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-maroon">
          Preparing Young Minds for a Career in Media
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-base md:text-lg text-cream">
          We at Genesis Creation's Academy provide you with all the necessary skills
          tailored for a solid grounding to help you jumpstart your career as a media
          professional. Gaining the right balance of knowledge and skill is much
          required in any career — our courses combine theoretical and practical
          sessions with guest lecturers.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-3">
        {advantages.map((a) => (
          <div
            key={a.title}
            className="rounded-2xl border border-tan bg-white/40 p-8 text-center shadow-sm transition-transform hover:-translate-y-1"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-maroon text-maroon-dark">
              {a.icon}
            </div>
            <h3 className="text-lg font-semibold text-maroon">{a.title}</h3>
            <p className="mt-2 text-sm text-cream">{a.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export { About }
