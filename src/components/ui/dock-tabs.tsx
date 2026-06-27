import { useState, useRef } from "react"
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion"
import { useLocation, useNavigate } from "react-router-dom"
import {
  Home,
  GraduationCap,
  Clapperboard,
  Megaphone,
  CalendarDays,
  Images,
  Info,
  Mail,
} from "lucide-react"

export interface DockItem {
  id: string
  name: string
  to: string
  icon: React.ReactNode
  color: string
}

// Genesis Kreations site navigation (spec §5), brand-tinted.
export const dockItems: DockItem[] = [
  { id: "home", name: "Home", to: "/", icon: <Home />, color: "bg-maroon-dark" },
  { id: "academy", name: "Media Academy", to: "/academy", icon: <GraduationCap />, color: "bg-maroon-dark" },
  { id: "services", name: "Services", to: "/services", icon: <Clapperboard />, color: "bg-maroon-dark" },
  { id: "digital-marketing", name: "Digital Marketing", to: "/digital-marketing", icon: <Megaphone />, color: "bg-maroon-dark" },
  { id: "workshops", name: "Workshops", to: "/workshops", icon: <CalendarDays />, color: "bg-maroon-dark" },
  { id: "gallery", name: "Gallery", to: "/gallery", icon: <Images />, color: "bg-maroon-dark" },
  { id: "about", name: "About", to: "/about", icon: <Info />, color: "bg-maroon-dark" },
  { id: "contact", name: "Contact", to: "/contact", icon: <Mail />, color: "bg-maroon-dark" },
]

function DockIcon({
  item,
  mouseX,
}: {
  item: DockItem
  mouseX: MotionValue<number>
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const isActive = location.pathname === item.to

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - bounds.x - bounds.width / 2
  })

  const widthSync = useTransform(distance, [-150, 0, 150], [50, 80, 50])
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 })

  const heightSync = useTransform(distance, [-150, 0, 150], [50, 80, 50])
  const height = useSpring(heightSync, { mass: 0.1, stiffness: 150, damping: 12 })

  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)

  return (
    <motion.button
      ref={ref}
      type="button"
      aria-label={item.name}
      onClick={() => navigate(item.to)}
      style={{ width, height }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsClicked(true)}
      onMouseUp={() => setIsClicked(false)}
      className="aspect-square cursor-pointer flex items-center justify-center relative group"
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className={`w-full h-full rounded-2xl shadow-lg flex items-center justify-center text-cream relative overflow-hidden transition-colors ${
          isActive ? "bg-maroon ring-2 ring-tan/80" : "bg-maroon-dark hover:bg-maroon-dark/80"
        }`}
        animate={{
          y: isClicked ? 2 : isHovered ? -8 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 17,
        }}
      >
        <motion.div
          className="text-xl"
          animate={{
            scale: isHovered ? 1.1 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 17,
          }}
        >
          {item.icon}
        </motion.div>

        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"
          animate={{
            opacity: isHovered ? 0.3 : 0.1,
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.8 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          y: isHovered ? -20 : 10,
          scale: isHovered ? 1 : 0.8,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-maroon-dark text-cream text-xs px-2 py-1 rounded-md whitespace-nowrap pointer-events-none border border-tan/20 shadow-xl"
      >
        {item.name}
      </motion.div>

      {/* Active indicator dot */}
      <motion.div
        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-maroon rounded-full"
        animate={{
          scale: isClicked ? 1.5 : 1,
          opacity: isActive || isClicked ? 1 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      />
    </motion.button>
  )
}

export function DockTabs() {
  const mouseX = useMotionValue(Infinity)

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className="mx-auto flex h-20 items-end gap-3 rounded-3xl bg-transparent px-4 pb-3.5 border-2 border-maroon-dark/30"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.1,
      }}
    >
      {dockItems.map((item) => (
        <DockIcon key={item.id} item={item} mouseX={mouseX} />
      ))}
    </motion.div>
  )
}
