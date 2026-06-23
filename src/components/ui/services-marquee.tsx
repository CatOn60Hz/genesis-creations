// Auto-scrolling services strip — pure-CSS marquee so it never pauses.
import {
  Aperture,
  Video,
  Scissors,
  Plane,
  Mic,
  Music,
  Megaphone,
  Clapperboard,
  Building2,
  Radio,
  CalendarDays,
} from "lucide-react"

import { cn } from "@/lib/utils"

interface ServiceItem {
  id: string
  name: string
  icon: React.ReactNode
}

const defaultServices: ServiceItem[] = [
  { id: "photography", name: "Photography", icon: <Aperture /> },
  { id: "videography", name: "Videography", icon: <Video /> },
  { id: "editing", name: "Video Editing", icon: <Scissors /> },
  { id: "drone", name: "Drone Cinematography", icon: <Plane /> },
  { id: "sound", name: "Live Sound Mixing", icon: <Mic /> },
  { id: "recording", name: "Studio Recording", icon: <Music /> },
  { id: "marketing", name: "Digital Marketing", icon: <Megaphone /> },
  { id: "production", name: "Media Production", icon: <Clapperboard /> },
  { id: "rental", name: "Studio Rental", icon: <Building2 /> },
  { id: "broadcasting", name: "Broadcasting", icon: <Radio /> },
  { id: "events", name: "Event Coverage", icon: <CalendarDays /> },
]

interface ServicesMarqueeProps {
  services?: ServiceItem[]
  className?: string
  /** Tailwind color name used for the edge fade (defaults to the maroon-dark hero bg). */
  fadeFrom?: string
}

const ServicesMarquee = ({
  services = defaultServices,
  className,
  fadeFrom = "from-cream",
}: ServicesMarqueeProps) => {
  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      {/* Two identical copies so translateX(-50%) loops seamlessly */}
      <div className="gc-marquee-track">
        {[...services, ...services].map((service, index) => (
          <div
            key={`${service.id}-${index}`}
            aria-hidden={index >= services.length}
            className="mx-3 flex shrink-0 items-center gap-2 rounded-full border border-tan/30 bg-maroon-dark/5 px-5 py-2 text-maroon-dark backdrop-blur-sm"
          >
            <span className="text-tan [&>svg]:h-4 [&>svg]:w-4">
              {service.icon}
            </span>
            <span className="whitespace-nowrap text-sm font-medium tracking-wide">
              {service.name}
            </span>
          </div>
        ))}
      </div>

      {/* Edge fades */}
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r to-transparent",
          fadeFrom,
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l to-transparent",
          fadeFrom,
        )}
      />
    </div>
  )
}

export { ServicesMarquee }
