import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { DockTabs, dockItems } from "@/components/ui/dock-tabs"
import logo from "@/assets/logo.png"

const SiteNav: React.FC = () => {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  return (
    <>
      {/* Desktop: floating dock (md and up) */}
      <nav className="hidden md:block fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <DockTabs />
      </nav>

      {/* Mobile: hamburger button + slide-down menu (below md) */}
      <div className="md:hidden">
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="fixed top-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-maroon text-maroon-dark shadow-lg"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        {open && (
          <div className="fixed inset-0 z-40 bg-cream/95 backdrop-blur-sm pt-20 px-6">
            <img
              src={logo}
              alt="Genesis Creations"
              className="mb-8 h-12 w-auto"
            />
            <ul className="flex flex-col gap-1">
              {dockItems.map((item) => {
                const isActive = location.pathname === item.to
                return (
                  <li key={item.id}>
                    <Link
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-lg text-maroon-dark transition-colors",
                        isActive ? "bg-maroon" : "hover:bg-maroon/40"
                      )}
                    >
                      <span className="text-maroon-dark">{item.icon}</span>
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </>
  )
}

export { SiteNav }
