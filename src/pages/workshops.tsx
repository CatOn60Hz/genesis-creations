import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { CalendarDays, MapPin, Loader2 } from "lucide-react"

import { fetchWorkshops, type Workshop } from "@/lib/cms-api"
import { PixelTrail } from "@/components/ui/pixel-trail"

const Workshops: React.FC = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkshops()
      .then(setWorkshops)
      .catch(() => setWorkshops([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-maroon-dark pb-32 text-cream">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f6e8ec_0%,#eeeeee_45%,#e4e4e7_100%)] px-6 py-28 text-maroon-dark md:py-40">
        <div className="absolute inset-0 z-0 opacity-40">
          <PixelTrail pixelSize={60} fadeDuration={500} pixelClassName="bg-maroon-dark/10" />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-maroon">
            Genesis Creations
          </p>
          <h1 className="mb-8 text-5xl font-bold tracking-tight md:text-7xl">
            Workshops &amp; <span className="text-maroon">Masterclasses</span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-maroon-dark/80 md:text-xl">
            Hands-on sessions led by working professionals — gimbal, drone,
            cinematography, photography and more. Find an upcoming session and
            register.
          </p>
        </div>
      </section>

      {/* Listing */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-20 text-cream/60">
              <Loader2 className="h-6 w-6 animate-spin" /> Loading workshops…
            </div>
          ) : workshops.length === 0 ? (
            <p className="py-20 text-center text-cream/60">
              No workshops are scheduled right now. Check back soon!
            </p>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {workshops.map((w, i) => (
                <motion.article
                  key={w.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                  className="flex flex-col overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10"
                >
                  {w.banner && (
                    <div className="aspect-[16/9] w-full overflow-hidden">
                      <img
                        src={w.banner.url}
                        alt={w.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <h2 className="text-xl font-semibold text-cream">{w.title}</h2>
                    {(w.date || w.location) && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-maroon">
                        {w.date && (
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-4 w-4" /> {w.date}
                          </span>
                        )}
                        {w.location && (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" /> {w.location}
                          </span>
                        )}
                      </div>
                    )}
                    {w.description && (
                      <p className="text-sm leading-relaxed text-cream/75 whitespace-pre-line">
                        {w.description}
                      </p>
                    )}
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export { Workshops }
