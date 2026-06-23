import {
  Camera,
  Lightbulb,
  Mic,
  Scissors,
  Video,
  Aperture,
  Plane,
  Joystick,
} from "lucide-react"

const areas = [
  { icon: <Camera />, name: "Camera" },
  { icon: <Lightbulb />, name: "Lighting" },
  { icon: <Mic />, name: "Audio" },
  { icon: <Scissors />, name: "Editing" },
  { icon: <Video />, name: "Video Production" },
  { icon: <Aperture />, name: "Photography" },
  { icon: <Plane />, name: "Aerial Cinematography" },
  { icon: <Joystick />, name: "Drone Pilot Training" },
]

const Services: React.FC = () => {
  return (
    <section id="services" className="bg-[linear-gradient(180deg,#f6e8ec_0%,#eeeeee_45%,#e4e4e7_100%)] text-maroon-dark py-24 px-6">
      <div className="mx-auto max-w-5xl text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-maroon">
          What You'll Master
        </p>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
          Skills for Every Media Career
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-maroon-dark">
          From the lens to the final cut, our hands-on training covers the full
          production pipeline.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-5 sm:grid-cols-4">
        {areas.map((a) => (
          <div
            key={a.name}
            className="flex flex-col items-center gap-3 rounded-2xl border border-tan/20 bg-maroon-dark/5 p-6 text-center transition-colors hover:bg-maroon-dark/10"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-maroon text-cream">
              {a.icon}
            </div>
            <span className="text-sm font-medium">{a.name}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export { Services }
