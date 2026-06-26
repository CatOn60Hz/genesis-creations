import { useEffect, useMemo, useRef, useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"

// A small dependency-free calendar that lets the admin pick one or more days.
// The selection is stored back into a plain, human-readable string (e.g.
// "July 16, 17, 18") so the workshop card and PHP backend stay unchanged.
// The field also remains hand-editable for free-form values.

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

function monthFromToken(tok: string): number {
  const t = tok.toLowerCase()
  if (t.length < 3) return -1
  return MONTHS.findIndex((m) => m.toLowerCase().startsWith(t.slice(0, 3)))
}

// Tolerant parse of our own output and legacy strings ("July 16,17,18",
// "July 30, 31 · August 1", "January 5, 2027"). Anything unparseable is
// simply ignored — the raw text still lives in the input.
function parseDates(value: string): Date[] {
  const now = new Date()
  const out: Date[] = []
  for (const group of value.split("·")) {
    let month = -1
    for (const tok of group.match(/[A-Za-z]+/g) ?? []) {
      const m = monthFromToken(tok)
      if (m >= 0) {
        month = m
        break
      }
    }
    if (month < 0) continue
    const yearMatch = group.match(/\b\d{4}\b/)
    const year = yearMatch ? Number(yearMatch[0]) : now.getFullYear()
    for (const d of group.match(/\b\d{1,2}\b/g) ?? []) {
      const day = Number(d)
      if (day >= 1 && day <= 31) out.push(new Date(year, month, day))
    }
  }
  return out
}

function formatDates(dates: Date[]): string {
  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime())
  const groups: { y: number; m: number; days: number[] }[] = []
  for (const d of sorted) {
    let g = groups.find((g) => g.y === d.getFullYear() && g.m === d.getMonth())
    if (!g) {
      g = { y: d.getFullYear(), m: d.getMonth(), days: [] }
      groups.push(g)
    }
    if (!g.days.includes(d.getDate())) g.days.push(d.getDate())
  }
  const thisYear = new Date().getFullYear()
  return groups
    .map((g) => {
      const base = `${MONTHS[g.m]} ${g.days.join(", ")}`
      return g.y !== thisYear ? `${base}, ${g.y}` : base
    })
    .join(" · ")
}

export function MultiDatePicker({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const selected = useMemo(() => parseDates(value), [value])
  const selectedKeys = useMemo(
    () => new Set(selected.map(dayKey)),
    [selected]
  )

  const [view, setView] = useState(() => {
    const f = selected[0] ?? new Date()
    return { y: f.getFullYear(), m: f.getMonth() }
  })

  // Jump the calendar to the first selected date whenever it's opened.
  useEffect(() => {
    if (!open) return
    const f = parseDates(value)[0]
    if (f) setView({ y: f.getFullYear(), m: f.getMonth() })
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const toggleDay = (day: number) => {
    const d = new Date(view.y, view.m, day)
    const k = dayKey(d)
    const next = selectedKeys.has(k)
      ? selected.filter((s) => dayKey(s) !== k)
      : [...selected, d]
    onChange(formatDates(next))
  }

  const shift = (delta: number) =>
    setView(({ y, m }) => {
      const d = new Date(y, m + delta, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })

  const firstWeekday = new Date(view.y, view.m, 1).getDay()
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate()
  const today = new Date()

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex items-center gap-2 rounded-lg border border-tan/20 bg-maroon-dark/60 px-3">
        <CalendarDays className="h-4 w-4 shrink-0 text-maroon" />
        <input
          className="w-full bg-transparent py-3 text-cream outline-none"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Open calendar"
          className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-cream/70 hover:bg-white/10 hover:text-cream"
        >
          <CalendarDays className="h-4 w-4" />
        </button>
      </div>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-72 rounded-xl border border-tan/20 bg-maroon-dark p-3 text-cream shadow-xl">
          {/* Month nav */}
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => shift(-1)}
              aria-label="Previous month"
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold">
              {MONTHS[view.m]} {view.y}
            </span>
            <button
              type="button"
              onClick={() => shift(1)}
              aria-label="Next month"
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday header */}
          <div className="mb-1 grid grid-cols-7 text-center text-[0.65rem] uppercase tracking-wide text-cream/50">
            {WEEKDAYS.map((w) => (
              <span key={w} className="py-1">
                {w}
              </span>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <span key={`blank-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const isSelected = selectedKeys.has(
                dayKey(new Date(view.y, view.m, day))
              )
              const isToday =
                today.getFullYear() === view.y &&
                today.getMonth() === view.m &&
                today.getDate() === day
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`flex h-9 items-center justify-center rounded-md text-sm transition-colors ${
                    isSelected
                      ? "bg-maroon font-semibold text-cream"
                      : "hover:bg-white/10"
                  } ${isToday && !isSelected ? "ring-1 ring-maroon/60" : ""}`}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-xs text-cream/60">
            <span>
              {selected.length
                ? `${selected.length} day${selected.length > 1 ? "s" : ""} selected`
                : "Pick one or more days"}
            </span>
            {selected.length > 0 && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="rounded px-2 py-1 hover:bg-white/10 hover:text-cream"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
