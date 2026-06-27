import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu as MenuIcon, X } from "lucide-react"

import { DockTabs, dockItems } from "@/components/ui/dock-tabs"
import { MenuContainer, MenuItem } from "@/components/ui/fluid-menu"

const SiteNav: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <>
      {/* Desktop: floating dock (md and up) */}
      <nav
        data-site-nav
        className="hidden md:block fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      >
        <DockTabs />
      </nav>

      {/* Mobile: fluid circular menu (below md). Keyed on the path so it
          collapses automatically after navigating to a new page. The top sits
          below the announcement banner when one is showing (--announcement-h is
          published by AnnouncementBanner; 0 otherwise). */}
      <div
        data-site-nav
        className="md:hidden fixed right-4 z-50"
        style={{ top: "calc(var(--announcement-h, 0px) + 1rem)" }}
      >
        <MenuContainer key={location.pathname}>
          {/* Toggle — the Menu icon morphs into an X while the stack is open. */}
          <MenuItem
            aria-label="Toggle menu"
            icon={
              <div className="relative flex h-5 w-5 items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out origin-center opacity-100 scale-100 rotate-0 [div[data-expanded=true]_&]:opacity-0 [div[data-expanded=true]_&]:scale-0 [div[data-expanded=true]_&]:rotate-180">
                  <MenuIcon size={18} strokeWidth={2} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out origin-center opacity-0 scale-0 -rotate-180 [div[data-expanded=true]_&]:opacity-100 [div[data-expanded=true]_&]:scale-100 [div[data-expanded=true]_&]:rotate-0">
                  <X size={18} strokeWidth={2} />
                </div>
              </div>
            }
          />

          {dockItems.map((item) => (
            <MenuItem
              key={item.id}
              aria-label={item.name}
              label={item.name}
              isActive={location.pathname === item.to}
              onClick={() => navigate(item.to)}
              icon={item.icon}
            />
          ))}
        </MenuContainer>
      </div>

      {/* Keep a crawlable text nav for SEO / no-JS, visually hidden. */}
      <nav className="sr-only" aria-label="Site">
        {dockItems.map((item) => (
          <Link key={item.id} to={item.to}>
            {item.name}
          </Link>
        ))}
      </nav>
    </>
  )
}

export { SiteNav }
