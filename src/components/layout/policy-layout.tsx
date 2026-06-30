import { SEO } from "@/components/seo"
import { Reveal } from "@/components/ui/reveal"

// Shared scaffold for the legal/policy pages (Terms, Privacy, Refund). Renders a
// compact header that clears the fixed nav/banner, then a readable prose column.
// Child markup is plain semantic HTML (h2/p/ul) — styled here via descendant
// selectors so each page stays clean and faithful to its source document.
export function PolicyLayout({
  title,
  description,
  effectiveDate,
  children,
}: {
  title: string
  description: string
  effectiveDate: string
  children: React.ReactNode
}) {
  return (
    <main className="relative min-h-screen bg-maroon-dark text-cream">
      <SEO title={`${title} - Genesis Kreations`} description={description} />

      <div className="mx-auto max-w-3xl px-6 pt-28 pb-24 md:pt-36">
        <Reveal>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-maroon">
            Genesis Kreations
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-sm text-cream/50">Effective Date: {effectiveDate}</p>
        </Reveal>

        <Reveal>
          <div
            className="mt-12 leading-relaxed text-cream/75
              [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-cream
              [&_p]:mt-4
              [&_ul]:mt-4 [&_ul]:space-y-1.5 [&_li]:ml-5 [&_li]:list-disc [&_li]:marker:text-maroon
              [&_a]:text-maroon [&_a]:underline [&_a]:underline-offset-2"
          >
            {children}
          </div>
        </Reveal>
      </div>
    </main>
  )
}

// The shared registered-business contact block that closes every policy page.
// The page supplies its own "Contact Us" heading; this is just the address.
export function PolicyContact() {
  return (
    <>
      <p>
        <strong className="text-cream">Genesis Kreations Media Private Limited</strong>
        <br />
        Email:{" "}
        <a href="mailto:info@genesiskreationsmedia.com">
          info@genesiskreationsmedia.com
        </a>
        <br />
        Phone: <a href="tel:+917824850999">+91 78248 50999</a>
        <br />
        Website:{" "}
        <a href="https://www.genesiskreationsmedia.com" target="_blank" rel="noreferrer">
          www.genesiskreationsmedia.com
        </a>
        <br />
        Registered Office: #340B/1A3B1, Vinayaka Avenue, Okkiyam Thoraipakkam,
        Chennai 600097
      </p>
    </>
  )
}
