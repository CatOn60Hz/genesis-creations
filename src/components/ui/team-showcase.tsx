import { useState } from "react"

import { cn } from "@/lib/utils"
import { LinkedInIcon, InstagramIcon, XIcon } from "@/components/ui/social-icons"

// Adapted for Genesis Kreations: lucide-react icons instead of react-icons, the
// "@/" path alias, and cream theming so it reads on the brand's dark sections.
// An optional `objectPosition` lets a portrait be framed on the face.

export interface TeamMember {
  id: string
  name: string
  role: string
  image: string
  /** CSS object-position for the photo crop, e.g. "65% 20%". Defaults to center. */
  objectPosition?: string
  social?: {
    twitter?: string
    linkedin?: string
    instagram?: string
  }
}

const DEFAULT_MEMBERS: TeamMember[] = [
  {
    id: "1",
    name: "Ava Bennett",
    role: "director of photography",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    social: { twitter: "#", linkedin: "#" },
  },
  {
    id: "2",
    name: "Marcus Cole",
    role: "FOUNDER",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
    social: { twitter: "#", linkedin: "#" },
  },
  {
    id: "3",
    name: "Priya Nair",
    role: "LEAD EDITOR",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
    social: { instagram: "#", linkedin: "#" },
  },
]

interface TeamShowcaseProps {
  members?: TeamMember[]
}

export default function TeamShowcase({ members = DEFAULT_MEMBERS }: TeamShowcaseProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const col1 = members.filter((_, i) => i % 3 === 0)
  const col2 = members.filter((_, i) => i % 3 === 1)
  const col3 = members.filter((_, i) => i % 3 === 2)

  return (
    <div className="flex flex-col md:flex-row items-start gap-8 md:gap-10 lg:gap-14 select-none w-full max-w-5xl mx-auto py-8 px-4 md:px-6 font-sans">
      {/* ── Left: photo grid ── */}
      <div className="flex gap-2 md:gap-3 flex-shrink-0 overflow-x-auto pb-1 md:pb-0">
        {/* Column 1 */}
        <div className="flex flex-col gap-2 md:gap-3">
          {col1.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="w-[110px] h-[120px] sm:w-[130px] sm:h-[140px] md:w-[155px] md:h-[165px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-2 md:gap-3 mt-[48px] sm:mt-[56px] md:mt-[68px]">
          {col2.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="w-[122px] h-[132px] sm:w-[145px] sm:h-[155px] md:w-[172px] md:h-[182px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>

        {/* Column 3 */}
        <div className="flex flex-col gap-2 md:gap-3 mt-[22px] sm:mt-[26px] md:mt-[32px]">
          {col3.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="w-[115px] h-[125px] sm:w-[136px] sm:h-[146px] md:w-[162px] md:h-[172px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>
      </div>

      {/* ── Right: member name list ── */}
      <div className="flex flex-col sm:grid sm:grid-cols-2 md:flex md:flex-col gap-4 md:gap-5 pt-0 md:pt-2 flex-1 w-full">
        {members.map((member) => (
          <MemberRow
            key={member.id}
            member={member}
            hoveredId={hoveredId}
            onHover={setHoveredId}
          />
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Photo card
───────────────────────────────────────── */

function PhotoCard({
  member,
  className,
  hoveredId,
  onHover,
}: {
  member: TeamMember
  className: string
  hoveredId: string | null
  onHover: (id: string | null) => void
}) {
  const isActive = hoveredId === member.id
  const isDimmed = hoveredId !== null && !isActive

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl cursor-pointer flex-shrink-0 ring-1 ring-white/10 transition-opacity duration-300",
        className,
        isDimmed ? "opacity-60" : "opacity-100"
      )}
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
    >
      <img
        src={member.image}
        alt={member.name}
        loading="lazy"
        className="w-full h-full object-cover transition-[filter] duration-500"
        style={{
          objectPosition: member.objectPosition ?? "center",
          filter: isActive
            ? "grayscale(0) brightness(1)"
            : "grayscale(1) brightness(0.77)",
        }}
      />
    </div>
  )
}

/* ─────────────────────────────────────────
   Member name section
───────────────────────────────────────── */

function MemberRow({
  member,
  hoveredId,
  onHover,
}: {
  member: TeamMember
  hoveredId: string | null
  onHover: (id: string | null) => void
}) {
  const isActive = hoveredId === member.id
  const isDimmed = hoveredId !== null && !isActive
  const hasSocial =
    member.social?.twitter ?? member.social?.linkedin ?? member.social?.instagram

  return (
    <div
      className={cn(
        "cursor-pointer transition-opacity duration-300",
        isDimmed ? "opacity-50" : "opacity-100"
      )}
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Name + social */}
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "w-4 h-3 rounded-[5px] flex-shrink-0 transition-all duration-300",
            isActive ? "bg-maroon w-5" : "bg-cream/25"
          )}
        />
        <span
          className={cn(
            "text-base md:text-[18px] font-semibold leading-none tracking-tight transition-colors duration-300",
            isActive ? "text-cream" : "text-cream/80"
          )}
        >
          {member.name}
        </span>

        {/* Social icons */}
        {hasSocial && (
          <div
            className={cn(
              "flex items-center gap-1.5 ml-0.5 transition-all duration-200",
              isActive
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-2 pointer-events-none"
            )}
          >
            {member.social?.twitter && (
              <a
                href={member.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded text-cream/60 hover:text-cream hover:bg-cream/10 transition-all duration-150 hover:scale-110"
                title="X / Twitter"
              >
                <XIcon className="h-3.5 w-3.5" />
              </a>
            )}
            {member.social?.linkedin && (
              <a
                href={member.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded text-cream/60 hover:text-cream hover:bg-cream/10 transition-all duration-150 hover:scale-110"
                title="LinkedIn"
              >
                <LinkedInIcon className="h-3.5 w-3.5" />
              </a>
            )}
            {member.social?.instagram && (
              <a
                href={member.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded text-cream/60 hover:text-cream hover:bg-cream/10 transition-all duration-150 hover:scale-110"
                title="Instagram"
              >
                <InstagramIcon className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Role */}
      <p className="mt-1.5 pl-[27px] text-[8px] md:text-[10px] font-medium uppercase tracking-[0.2em] text-cream/50">
        {member.role}
      </p>
    </div>
  )
}
