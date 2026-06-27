import { useEffect, useRef } from "react"
import { Routes, Route, Link, useLocation } from "react-router-dom"
import { ReactLenis, type LenisRef } from "lenis/react"

import { SiteNav } from "@/components/layout/site-nav"
import { AnnouncementBanner } from "@/components/ui/announcement-banner"
import { SiteFooter } from "@/components/sections/site-footer"
import { BeamsBackground } from "@/components/ui/beams-background"
import { Home } from "@/pages/home"
import { Academy } from "@/pages/academy"
import { Services } from "@/pages/services"
import { DigitalMarketing } from "@/pages/digital-marketing"
import { Gallery } from "@/pages/gallery"
import { Workshops } from "@/pages/workshops"
import { About } from "@/pages/about"
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

  // The root Lenis instance persists across the smooth-scroll pages (academy,
  // services, workshops, stubs), so navigating between them would otherwise keep
  // the previous page's scroll position. Reset it to the top on every route
  // change. Home and Gallery mount their own scoped Lenis fresh, so they already
  // start at the top; window.scrollTo covers the admin (no-Lenis) pages.
  const rootLenisRef = useRef<LenisRef>(null)
  useEffect(() => {
    const lenis = rootLenisRef.current?.lenis
    // A hash (e.g. /about#faq) scrolls to that section instead of the top.
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1))
      if (el) {
        if (lenis) lenis.scrollTo(el, { offset: -24 })
        else el.scrollIntoView({ behavior: "smooth" })
        return
      }
    }
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo(0, 0)
    }
  }, [location.pathname, location.hash])

  const routes = (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/academy" element={<Academy />} />
      <Route path="/services" element={<Services />} />
      <Route path="/digital-marketing" element={<DigitalMarketing />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/workshops" element={<Workshops />} />
      <Route path="/about" element={<About />} />
      {/* Unified admin dashboard (gallery-admin kept as an alias). */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/gallery-admin" element={<AdminDashboard />} />
      {dockItems
        .filter(
          (item) =>
            item.to !== "/" &&
            item.to !== "/academy" &&
            item.to !== "/services" &&
            item.to !== "/digital-marketing" &&
            item.to !== "/gallery" &&
            item.to !== "/workshops" &&
            item.to !== "/about"
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
            ref={rootLenisRef}
            options={{ lerp: 0.09, smoothWheel: true }}
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
