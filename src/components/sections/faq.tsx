import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Plus } from "lucide-react"

import { Reveal } from "@/components/ui/reveal"
import { fetchFaqs } from "@/lib/cms-api"
import { cn } from "@/lib/utils"

type QA = { question: string; answer: string }

// Built-in defaults — shown until the CMS responds and as a fallback. The
// backend seeds these same entries on first run, so /admin starts with them.
const fallbackFaqs: QA[] = [
  {
    question: "Do I need any prior experience?",
    answer:
      "No. Our courses are built to take you from scratch — no prior knowledge or equipment is required. We teach the fundamentals first, then build up to professional, hands-on work.",
  },
  {
    question: "How long are the courses?",
    answer:
      "Most certification courses run for 1 month (Mon to Fri, about 3 hours a day). The Diploma in Visual Communication is a 1-year program, and some workshops run over a few focused days.",
  },
  {
    question: "Will I get a certificate?",
    answer:
      "Yes. Every course ends with an industry-recognized certificate from Genesis Kreations that carries real weight with studios, agencies, and clients.",
  },
  {
    question: "Where are the classes held?",
    answer:
      "At the Genesis Kreations Media Academy studio in Chennai, with a mix of hands-on studio sessions and real outdoor/location shoots.",
  },
  {
    question: "Do you help with jobs or freelancing?",
    answer:
      "We provide portfolio-building support, mentorship from working industry professionals, and guidance for both job-readiness and freelance work.",
  },
  {
    question: "How do I enroll?",
    answer:
      "Reach out through the Contact page or give us a call. We will walk you through the schedule, fees, and the next available batch.",
  },
]

const Faq: React.FC = () => {
  const [faqs, setFaqs] = useState<QA[]>(fallbackFaqs)
  const [open, setOpen] = useState<number | null>(0)

  useEffect(() => {
    let active = true
    fetchFaqs()
      .then((items) => {
        if (active && items.length) {
          setFaqs(items.map((f) => ({ question: f.question, answer: f.answer })))
        }
      })
      .catch(() => {
        /* keep fallback faqs */
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <section id="faq" className="relative px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <Reveal className="mb-10 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-maroon">
            Questions
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tighter text-cream md:text-5xl">
            Frequently asked questions
          </h2>
        </Reveal>

        <Reveal className="divide-y divide-white/10 border-t border-white/10">
          {faqs.map((f, i) => {
            const isOpen = open === i
            return (
              <div key={f.question + i}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-5 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-lg font-semibold tracking-tight text-cream md:text-xl">
                    {f.question}
                  </span>
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-maroon/10 text-maroon transition-transform duration-300",
                      isOpen && "rotate-45 bg-maroon text-cream"
                    )}
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 pr-12 text-sm leading-relaxed text-cream/65 md:text-base">
                        {f.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}

export { Faq }
