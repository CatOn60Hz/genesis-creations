import { useState } from "react"
import { MapPin, Phone, Mail, Send, Loader2, CheckCircle2, MessageCircle } from "lucide-react"

import { Reveal } from "@/components/ui/reveal"
import { SEO } from "@/components/seo"
import { InstagramIcon, FacebookIcon } from "@/components/ui/social-icons"
import contactHero from "@/assets/contact-hero.jpg"

// Web3Forms access key — submissions are emailed to the address registered with
// this key at web3forms.com. The key is safe to expose client-side (it only
// allows sending to the pre-registered inbox).
const WEB3FORMS_KEY = "60dd81fa-07b1-4572-a766-272273f2e1fe"

const inputCls =
  "w-full rounded-lg border border-tan/20 bg-maroon-dark/60 px-4 py-3 text-cream placeholder:text-cream/40 outline-none transition-colors focus:border-maroon"

type Status = "idle" | "submitting" | "success" | "error"

export function Contact() {
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("submitting")
    setError("")

    const form = e.currentTarget
    const data = new FormData(form)
    data.append("access_key", WEB3FORMS_KEY)
    data.append("subject", "New enquiry from genesiskreationsmedia.com")
    data.append("from_name", "Genesis Kreations Website")

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: data,
      })
      const json = await res.json()
      if (json.success) {
        setStatus("success")
        form.reset()
      } else {
        setStatus("error")
        setError(json.message || "Something went wrong. Please try again.")
      }
    } catch {
      setStatus("error")
      setError("Network error. Please check your connection and try again.")
    }
  }

  return (
    <main className="relative min-h-screen text-cream">
      <SEO
        title="Contact Us - Genesis Kreations"
        description="Get in touch with Genesis Kreations, a Chennai media house. Reach us about our academy, digital marketing, production, studio rental and broadcasting services."
      />

      {/* Full-screen workshop group photo background under a dark scrim so the
          cream text and form stay readable over the bright image. */}
      <section className="relative flex min-h-[100dvh] items-center overflow-hidden px-6 py-28 md:py-32">
        <img
          src={contactHero}
          alt="The Genesis Kreations team at a gimbal workshop in Chennai"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.68)_42%,rgba(0,0,0,0.93)_100%)]" />
        <div className="relative z-10 mx-auto w-full max-w-6xl">
        <Reveal>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-maroon">
            Genesis Kreations
          </p>
          <h1 className="text-5xl font-bold uppercase leading-[0.95] tracking-tight md:text-7xl">
            Contact Us
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-cream/80">
            Have a project, a course enquiry, or a collaboration in mind? Send us
            a message and our team will get back to you shortly.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          {/* Contact details */}
          <Reveal>
            <div className="space-y-8">
              <h2 className="text-xl font-semibold">Reach us directly</h2>

              <a
                href="https://maps.google.com/?q=Genesis+Kreations+Okkiyam+Thoraipakkam+Chennai"
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 text-cream/80 transition-colors hover:text-maroon"
              >
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-maroon" />
                <span>
                  #340/B1A3B1, Vinayaka Avenue, Okkiyam Thoraipakkam,
                  Chennai 600097
                </span>
              </a>

              <a
                href="tel:+917824850999"
                className="flex items-center gap-3 text-cream/80 transition-colors hover:text-maroon"
              >
                <Phone className="h-5 w-5 shrink-0 text-maroon" />
                +91 78248 50999
              </a>

              <a
                href="mailto:info@genesiskreationsmedia.com"
                className="flex items-center gap-3 text-cream/80 transition-colors hover:text-maroon"
              >
                <Mail className="h-5 w-5 shrink-0 text-maroon" />
                info@genesiskreationsmedia.com
              </a>

              <a
                href="https://wa.me/917824850999"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-cream/80 transition-colors hover:text-maroon"
              >
                <MessageCircle className="h-5 w-5 shrink-0 text-maroon" />
                Chat on WhatsApp
              </a>

              <a
                href="https://www.instagram.com/genesiscreationsmedia"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-cream/80 transition-colors hover:text-maroon"
              >
                <InstagramIcon className="h-5 w-5 shrink-0 text-maroon" />
                @genesiscreationsmedia
              </a>

              <a
                href="https://www.facebook.com/share/1bEZrS1VUJ/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-cream/80 transition-colors hover:text-maroon"
              >
                <FacebookIcon className="h-5 w-5 shrink-0 text-maroon" />
                Genesis Creations Media Academy
              </a>
            </div>
          </Reveal>

          {/* Form */}
          <Reveal delay={0.1}>
            {status === "success" ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-tan/15 bg-maroon-dark/55 p-10 text-center backdrop-blur">
                <CheckCircle2 className="h-14 w-14 text-maroon" />
                <h2 className="mt-4 text-2xl font-semibold">Message sent!</h2>
                <p className="mt-2 max-w-sm text-cream/75">
                  Thanks for reaching out. We&apos;ve received your message and
                  will get back to you soon.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="mt-6 rounded-full border border-tan/25 px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:border-maroon"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-tan/15 bg-maroon-dark/55 p-6 backdrop-blur md:p-8"
              >
                {/* Honeypot field — hidden from users, catches bots. */}
                <input
                  type="checkbox"
                  name="botcheck"
                  className="hidden"
                  style={{ display: "none" }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-sm font-medium text-cream/80">
                      Name <span className="text-maroon">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Your name"
                      className={inputCls}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-sm font-medium text-cream/80">
                      Email <span className="text-maroon">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      className={inputCls}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="phone" className="text-sm font-medium text-cream/80">
                      Phone
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+91 ..."
                      className={inputCls}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="topic" className="text-sm font-medium text-cream/80">
                      I&apos;m interested in
                    </label>
                    <select id="topic" name="topic" className={inputCls} defaultValue="">
                      <option value="" disabled>
                        Select a topic
                      </option>
                      <option value="Media Academy">Media Academy</option>
                      <option value="Digital Marketing">Digital Marketing</option>
                      <option value="Production">Production</option>
                      <option value="Studio Rental">Studio Rental</option>
                      <option value="Workshops">Workshops</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-2">
                  <label htmlFor="message" className="text-sm font-medium text-cream/80">
                    Message <span className="text-maroon">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Tell us a bit about what you need…"
                    className={`${inputCls} resize-y`}
                  />
                </div>

                {status === "error" && (
                  <p className="mt-4 text-sm text-red-400">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-maroon px-6 py-3 font-medium text-cream transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Send message
                    </>
                  )}
                </button>
              </form>
            )}
          </Reveal>
        </div>
        </div>
      </section>
    </main>
  )
}
