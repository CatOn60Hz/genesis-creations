import { MapPin, Phone, Mail } from "lucide-react"

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
    <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
  </svg>
)

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
)

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
    <path d="M.06 24l1.69-6.16a11.87 11.87 0 0 1-1.59-5.95C.16 5.34 5.5 0 12.06 0a11.82 11.82 0 0 1 8.41 3.49 11.82 11.82 0 0 1 3.48 8.41c0 6.56-5.34 11.9-11.9 11.9a11.9 11.9 0 0 1-5.69-1.45L.06 24zm6.6-3.8c1.68.99 3.28 1.59 5.4 1.59 5.45 0 9.89-4.43 9.89-9.89A9.86 9.86 0 0 0 12.07 2C6.6 2 2.17 6.43 2.17 11.89c0 2.23.65 3.9 1.74 5.65l-1 3.65 3.75-.99zm11.39-5.55c-.07-.12-.27-.2-.57-.35-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42z" />
  </svg>
)

const SiteFooter: React.FC = () => {
  return (
    <footer id="contact" className="bg-[linear-gradient(180deg,#f6e8ec_0%,#eeeeee_45%,#e4e4e7_100%)] text-maroon-dark pt-20 pb-28 px-6">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
        {/* CTA / brand */}
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Start Your Media Career Today
          </h2>
          <p className="mt-4 max-w-md text-maroon-dark">
            Join Genesis Creations Media Academy and learn from working
            professionals in a fully equipped studio environment.
          </p>
          <a
            href="tel:+917824850999"
            className="mt-8 inline-block rounded-full bg-maroon px-8 py-3 text-sm font-medium text-maroon-dark transition-transform hover:scale-105"
          >
            Call to Enroll
          </a>
        </div>

        {/* Contact details */}
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 h-5 w-5 shrink-0 text-maroon" />
            <p className="text-maroon-dark">
              #340B/1A3B1, Vinayaka Avenue, Okkiyam Thoraipakkam, Chennai 600097
            </p>
          </div>
          <a
            href="tel:+917824850999"
            className="flex items-center gap-3 text-maroon-dark transition-colors hover:text-maroon"
          >
            <Phone className="h-5 w-5 shrink-0 text-maroon" />
            +91 78248 50999
          </a>
          <a
            href="mailto:info@genesiscreations.in"
            className="flex items-center gap-3 text-maroon-dark transition-colors hover:text-maroon"
          >
            <Mail className="h-5 w-5 shrink-0 text-maroon" />
            info@genesiscreations.in
          </a>

          <div className="flex items-center gap-4 pt-2">
            <a
              href="#"
              aria-label="Facebook"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-maroon-dark/10 transition-colors hover:bg-maroon"
            >
              <FacebookIcon />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-maroon-dark/10 transition-colors hover:bg-maroon"
            >
              <InstagramIcon />
            </a>
            <a
              href="#"
              aria-label="WhatsApp"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-maroon-dark/10 transition-colors hover:bg-maroon"
            >
              <WhatsAppIcon />
            </a>
          </div>
        </div>
      </div>

      <p className="mx-auto mt-16 max-w-6xl border-t border-maroon-dark/15 pt-6 text-center text-xs text-maroon-dark">
        © {new Date().getFullYear()} Genesis Creations · genesiscreations.com
      </p>
    </footer>
  )
}

export { SiteFooter }
