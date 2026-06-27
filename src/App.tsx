import { useEffect, useRef, lazy, Suspense } from "react"
import { Routes, Route, Link, useLocation } from "react-router-dom"
import { ReactLenis, type LenisRef } from "lenis/react"

import { SiteNav } from "@/components/layout/site-nav"
import { AnnouncementBanner } from "@/components/ui/announcement-banner"
import { SiteFooter } from "@/components/sections/site-footer"
import { BeamsBackground } from "@/components/ui/beams-background"
import { useIsTouch } from "@/components/hooks/use-is-touch"
import { Home } from "@/pages/home"
import { dockItems } from "@/components/ui/dock-tabs"

// Code-split the secondary pages so the initial download is just the home page
// + shared vendor. Each route's chunk loads on navigation.
const Academy = lazy(() => import("@/pages/academy").then((m) => ({ default: m.Academy })))
const Services = lazy(() => import("@/pages/services").then((m) => ({ default: m.Services })))
const DigitalMarketing = lazy(() =>
  import("@/pages/digital-marketing").then((m) => ({ default: m.DigitalMarketing }))
)
const Gallery = lazy(() => import("@/pages/gallery").then((m) => ({ default: m.Gallery })))
const Workshops = lazy(() => import("@/pages/workshops").then((m) => ({ default: m.Workshops })))
const About = lazy(() => import("@/pages/about").then((m) => ({ default: m.About })))
const AdminDashboard = lazy(() =>
  import("@/pages/admin").then((m) => ({ default: m.AdminDashboard }))
)

// Placeholder page for sections not yet built.
function SectionStub() {
  const location = useLocation()
  const item = dockItems.find((i) => i.to === location.pathname)

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-maroon-dark/40 text-cream">
      <p className="mb-3 text-xs uppercase tracking-[0.3em] text-maroon">
        Genesis Kreations
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

  // Lenis smooth scroll forces a layout read every animation frame (its
  // `setScroll` was measured as the dominant main-thread cost on mobile — ~1.4s
  // of forced reflow over a single scroll). Phones already scroll smoothly
  // natively and Lenis doesn't smooth touch anyway, so it's pure cost there.
  // Skip Lenis on touch devices and let the browser scroll natively.
  const isTouch = useIsTouch()

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

  // Lazy-loaded pages mount their content AFTER the root Lenis has already
  // measured the page, so its scroll limit is stale (computed against the short
  // Suspense fallback) and the page won't scroll. body/#root are height:100% so
  // a ResizeObserver won't catch it — instead watch for DOM mutations under
  // #root (which fire when the lazy chunk mounts) and re-measure Lenis, coalesced
  // to once per frame.
  useEffect(() => {
    const root = document.getElementById("root")
    if (!root || typeof MutationObserver === "undefined") return
    let scheduled = false
    const remeasure = () => {
      if (scheduled) return
      scheduled = true
      requestAnimationFrame(() => {
        scheduled = false
        rootLenisRef.current?.lenis?.resize()
      })
    }
    const mo = new MutationObserver(remeasure)
    mo.observe(root, { childList: true, subtree: true })
    return () => mo.disconnect()
  }, [])

  const routes = (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
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
    </Suspense>
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
          {isTouch ? (
            // Native scroll on touch — the route-change/hash effects above
            // already fall back to window.scrollTo when there's no Lenis.
            <>
              {routes}
              <SiteFooter />
            </>
          ) : (
            <ReactLenis
              root
              ref={rootLenisRef}
              options={{ lerp: 0.09, smoothWheel: true }}
            >
              {routes}
              <SiteFooter />
            </ReactLenis>
          )}
        </>
      )}
    </>
  )
}

export default App
