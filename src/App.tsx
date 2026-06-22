import { Routes, Route, Link, useLocation } from "react-router-dom"

import { SiteNav } from "@/components/layout/site-nav"
import { Home } from "@/pages/home"
import { dockItems } from "@/components/ui/dock-tabs"

// Placeholder page for sections not yet built.
function SectionStub() {
  const location = useLocation()
  const item = dockItems.find((i) => i.to === location.pathname)

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-cream text-maroon-dark">
      <p className="mb-3 text-xs uppercase tracking-[0.3em] text-maroon">
        Genesis Creations
      </p>
      <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-maroon">
        {item?.name ?? "Page"}
      </h1>
      <p className="mt-4 max-w-md text-maroon-dark/70">
        This section is coming soon. The page scaffold is wired and ready for content.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-full bg-maroon px-6 py-3 text-sm font-medium text-cream transition-transform hover:scale-105"
      >
        Back to Home
      </Link>
    </section>
  )
}

function App() {
  return (
    <>
      <SiteNav />
      <Routes>
        <Route path="/" element={<Home />} />
        {dockItems
          .filter((item) => item.to !== "/")
          .map((item) => (
            <Route key={item.id} path={item.to} element={<SectionStub />} />
          ))}
        <Route path="*" element={<SectionStub />} />
      </Routes>
    </>
  )
}

export default App
