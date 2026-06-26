import { Routes, Route, Link, useLocation } from "react-router-dom"
import { ReactLenis } from "lenis/react"

import { SiteNav } from "@/components/layout/site-nav"
import { AnnouncementBanner } from "@/components/ui/announcement-banner"
import { SiteFooter } from "@/components/sections/site-footer"
import { BeamsBackground } from "@/components/ui/beams-background"
import { Home } from "@/pages/home"
import { Academy } from "@/pages/academy"
import { Services } from "@/pages/services"
import { Gallery } from "@/pages/gallery"
import { Workshops } from "@/pages/workshops"
import { AdminDashboard } from "@/pages/admin"
import { dockItems } from "@/components/ui/dock-tabs"

// Placeholder page for sections not yet built.
function SectionStub() {
  const location = useLocation()
  const item = dockItems.find((i) => i.to === location.pathname)

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-maroon-dark/40 text-cream">
      <p className="mb-3 text-xs uppercase tracking-[0.3em] text-maroon">
        Genesis Creations
      </p>
      <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-maroon">
        {item?.name ?? "Page"}
      </h1>
      <p className="mt-4 max-w-md text-cream">
        This section is coming soon. The page scaffold is wired and ready for content.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-full bg-maroon px-6 py-3 text-sm font-medium text-maroon-dark transition-transform hover:scale-105"
      >
        Back to Home
      </Link>
    </section>
  )
}

function App() {
  // The announcement banner and site nav are for visitors, not the admin dashboard.
  const location = useLocation()
  const isAdmin =
    location.pathname === "/admin" || location.pathname === "/gallery-admin"
  // Home and Gallery render their own SiteFooter inside their self-contained
  // scroll containers, so the global footer is for every other public page.
  const isHome = location.pathname === "/"
  const isGallery = location.pathname === "/gallery"

  const routes = (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/academy" element={<Academy />} />
      <Route path="/services" element={<Services />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/workshops" element={<Workshops />} />
      {/* Unified admin dashboard (gallery-admin kept as an alias). */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/gallery-admin" element={<AdminDashboard />} />
      {dockItems
        .filter(
          (item) =>
            item.to !== "/" &&
            item.to !== "/academy" &&
            item.to !== "/services" &&
            item.to !== "/gallery" &&
            item.to !== "/workshops"
        )
        .map((item) => (
          <Route key={item.id} path={item.to} element={<SectionStub />} />
        ))}
      <Route path="*" element={<SectionStub />} />
    </Routes>
  )

  return (
    <>
      {!isAdmin && <AnnouncementBanner />}
      {!isAdmin && <SiteNav />}
      {/* Home drives its own scoped Lenis (with snap); admin stays a plain
          dashboard. Every other page gets the same smooth scroll, root-bound. */}
      {isHome || isAdmin ? (
        routes
      ) : isGallery ? (
        <>
          {/* Gallery owns its scroll container and drives its own scoped Lenis
              (like home), so it sits outside the root Lenis. */}
          <BeamsBackground className="fixed inset-0 -z-10" intensity="medium" />
          {routes}
        </>
      ) : (
        <>
          {/* Same fixed crimson beams as the home page, glowing behind the
              translucent page backgrounds. */}
          <BeamsBackground className="fixed inset-0 -z-10" intensity="medium" />
          <ReactLenis
            root
            options={{ lerp: 0.09, smoothWheel: true, syncTouch: true }}
          >
            {routes}
            <SiteFooter />
          </ReactLenis>
        </>
      )}
    </>
  )
}

export default App
