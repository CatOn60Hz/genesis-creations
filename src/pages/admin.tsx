import { useEffect, useMemo, useRef, useState } from "react"
import {
  Megaphone,
  CalendarDays,
  Images,
  Projector,
  MessageSquareQuote,
  ImagePlus,
  RotateCcw,
  GraduationCap,
  BookOpen,
  HelpCircle,
  Film,
  Clapperboard,
  Video,
  ArrowUp,
  ArrowDown,
  Upload,
  Trash2,
  LogOut,
  Loader2,
  Plus,
  Save,
  Pencil,
  Star,
  MapPin,
  Clock,
  CircleCheck,
  X,
} from "lucide-react"

import { SEO } from "@/components/seo"
import { WorkshopCard } from "@/pages/workshops"

import {
  fetchAnnouncement,
  saveAnnouncement,
  type Announcement,
  fetchWorkshops,
  saveWorkshop,
  deleteWorkshop,
  reorderWorkshops,
  type Workshop,
  type WorkshopSession,
  fetchProjectorItems,
  uploadProjectorImages,
  uploadProjectorVideos,
  addProjectorYoutube,
  deleteProjectorItem,
  reorderProjector,
  type ProjectorItem,
  fetchReels,
  uploadReels,
  saveReelYoutube,
  deleteReel,
  reorderReels,
  type ReelItem,
  fetchTestimonials,
  saveTestimonial,
  deleteTestimonial,
  reorderTestimonials,
  type Testimonial,
  fetchBackgrounds,
  setBackground,
  clearBackground,
  type BackgroundSlot,
  fetchHomeCourses,
  saveHomeCourse,
  deleteHomeCourse,
  reorderHomeCourses,
  type HomeCourse,
  type HomeCourseKind,
  fetchCertCourses,
  saveCertCourse,
  deleteCertCourse,
  reorderCertCourses,
  type CertCourse,
  type CertCourseKind,
  type CourseModule,
  fetchFaqs,
  saveFaq,
  deleteFaq,
  reorderFaqs,
  type FaqItem,
} from "@/lib/cms-api"
import {
  fetchGalleryPhotos,
  uploadGalleryPhotos,
  deleteGalleryPhoto,
} from "@/lib/gallery-api"
import { MultiDatePicker } from "@/components/ui/multi-date-picker"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

const PW_KEY = "gc-admin-pw"

type Tab =
  | "announcement"
  | "workshops"
  | "courses"
  | "testimonials"
  | "homeCourses"
  | "faq"
  | "gallery"
  | "projector"
  | "reels"
  | "backgrounds"
type Img = { name: string; url: string }

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "announcement", label: "Announcement", icon: <Megaphone className="h-4 w-4" /> },
  { id: "workshops", label: "Workshops", icon: <CalendarDays className="h-4 w-4" /> },
  { id: "courses", label: "Courses", icon: <BookOpen className="h-4 w-4" /> },
  { id: "testimonials", label: "Testimonials", icon: <MessageSquareQuote className="h-4 w-4" /> },
  { id: "homeCourses", label: "Home Courses", icon: <GraduationCap className="h-4 w-4" /> },
  { id: "faq", label: "FAQ", icon: <HelpCircle className="h-4 w-4" /> },
  { id: "gallery", label: "Gallery", icon: <Images className="h-4 w-4" /> },
  { id: "projector", label: "Home Screen", icon: <Projector className="h-4 w-4" /> },
  { id: "reels", label: "Reels", icon: <Clapperboard className="h-4 w-4" /> },
  { id: "backgrounds", label: "Backgrounds", icon: <ImagePlus className="h-4 w-4" /> },
]

/* ----------------------------- shared styles ---------------------------- */

const inputCls =
  "w-full rounded-lg border border-tan/20 bg-maroon-dark/60 px-4 py-3 text-cream outline-none focus:border-maroon"
const btnCls =
  "inline-flex items-center gap-2 rounded-full bg-maroon px-5 py-2.5 font-medium text-cream transition-transform hover:scale-[1.02] disabled:opacity-50"

/* ----------------------------- Announcement ----------------------------- */

function AnnouncementEditor({
  password,
  onAuthError,
}: {
  password: string
  onAuthError: () => void
}) {
  const [data, setData] = useState<Announcement | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    fetchAnnouncement()
      .then(setData)
      .catch(() =>
        setData({ enabled: true, text: "", ctaLabel: "", ctaHref: "" })
      )
  }, [])

  const save = async () => {
    if (!data) return
    setBusy(true)
    setMsg(null)
    try {
      const saved = await saveAnnouncement(data, password)
      setData(saved)
      setMsg("Saved.")
    } catch (e) {
      const m = e instanceof Error ? e.message : "Save failed"
      setMsg(m)
      if (m === "Wrong password") onAuthError()
    } finally {
      setBusy(false)
    }
  }

  if (!data) {
    return <Loader2 className="h-6 w-6 animate-spin text-maroon" />
  }

  return (
    <div className="max-w-2xl space-y-5">
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={data.enabled}
          onChange={(e) => setData({ ...data, enabled: e.target.checked })}
          className="h-5 w-5 accent-maroon"
        />
        <span>Show the announcement banner</span>
      </label>

      <div>
        <label className="mb-1 block text-sm text-cream/70">Message</label>
        <textarea
          value={data.text}
          onChange={(e) => setData({ ...data, text: e.target.value })}
          rows={2}
          className={inputCls}
          placeholder="New: Media Production Masterclass launches next week!"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-cream/70">Button label</label>
          <input
            value={data.ctaLabel}
            onChange={(e) => setData({ ...data, ctaLabel: e.target.value })}
            className={inputCls}
            placeholder="Register now"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-cream/70">
            Button link (e.g. /workshops or https://…)
          </label>
          <input
            value={data.ctaHref}
            onChange={(e) => setData({ ...data, ctaHref: e.target.value })}
            className={inputCls}
            placeholder="/workshops"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button type="button" onClick={save} disabled={busy} className={btnCls}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save announcement
        </button>
        {msg && <span className="text-sm text-cream/70">{msg}</span>}
      </div>
    </div>
  )
}

/* ------------------------------- Workshops ------------------------------ */

type SessionRow = { city: string; dates: string; timing: string; venue: string }

const EMPTY_SESSION: SessionRow = { city: "", dates: "", timing: "", venue: "" }

const EMPTY_FORM = {
  id: "",
  title: "",
  description: "",
  date: "",
  location: "",
  tagline: "",
  badge: "",
  icon: "",
  registerUrl: "",
  note: "",
  // Structured, field-by-field inputs that mirror the workshop card.
  learn: [] as string[],
  included: [] as string[],
  sessions: [] as SessionRow[],
}

// Icon keys offered in the admin (must match the map in workshops.tsx).
const ICON_OPTIONS = [
  { value: "", label: "Default (cap)" },
  { value: "drone", label: "Drone" },
  { value: "gimbal", label: "Gimbal / Video" },
  { value: "camera", label: "Camera / Photography" },
  { value: "editing", label: "Editing" },
  { value: "audio", label: "Audio" },
]

// Drop blank rows before saving.
const cleanList = (items: string[]): string[] =>
  items.map((s) => s.trim()).filter(Boolean)

// Keep only sessions that name a city; trim the rest.
const cleanSessions = (rows: SessionRow[]): WorkshopSession[] =>
  rows
    .map((s) => ({
      city: s.city.trim(),
      dates: s.dates.trim(),
      timing: s.timing.trim(),
      venue: s.venue.trim(),
    }))
    .filter((s) => s.city)

// Rehydrate stored sessions into editable rows (every field present).
const sessionsToRows = (sessions?: WorkshopSession[]): SessionRow[] =>
  (sessions ?? []).map((s) => ({
    city: s.city ?? "",
    dates: s.dates ?? "",
    timing: s.timing ?? "",
    venue: s.venue ?? "",
  }))

function WorkshopsManager({
  password,
  onAuthError,
}: {
  password: string
  onAuthError: () => void
}) {
  const [items, setItems] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  // True when the icon is a free-typed keyword rather than a preset.
  const [customIcon, setCustomIcon] = useState(false)
  const [banner, setBanner] = useState<File | undefined>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Id of the workshop awaiting delete confirmation (null = dialog closed).
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Object URL for a freshly-picked banner file, so the live preview can show
  // it before it's uploaded. Revoked when the file changes or clears.
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  useEffect(() => {
    if (!banner) {
      setBannerPreview(null)
      return
    }
    const url = URL.createObjectURL(banner)
    setBannerPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [banner])

  // Build a Workshop from the current form so the preview renders the exact
  // same card the public Workshops page shows. Falls back to the already-saved
  // banner when editing and no new file has been picked.
  const previewWorkshop: Workshop = useMemo(() => {
    const existing = form.id ? items.find((w) => w.id === form.id) : undefined
    return {
      id: form.id || "preview",
      title: form.title.trim() || "Workshop title",
      description: form.description,
      date: form.date,
      location: form.location,
      banner: bannerPreview
        ? { name: "preview", url: bannerPreview }
        : existing?.banner ?? null,
      tagline: form.tagline,
      badge: form.badge,
      icon: form.icon,
      registerUrl: form.registerUrl,
      note: form.note,
      sessions: cleanSessions(form.sessions),
      learn: cleanList(form.learn),
      included: cleanList(form.included),
    }
  }, [form, items, bannerPreview])

  useEffect(() => {
    fetchWorkshops()
      .then(setItems)
      .catch(() => setError("Couldn't load workshops."))
      .finally(() => setLoading(false))
  }, [])

  const resetForm = () => {
    setForm({ ...EMPTY_FORM })
    setCustomIcon(false)
    setBanner(undefined)
    if (fileRef.current) fileRef.current.value = ""
  }

  const handleAuthErr = (m: string) => {
    if (m === "Wrong password") onAuthError()
  }

  const submit = async () => {
    if (!form.title.trim()) {
      setError("Title is required.")
      return
    }
    setBusy(true)
    setError(null)
    try {
      const next = await saveWorkshop(
        {
          id: form.id || undefined,
          title: form.title,
          description: form.description,
          date: form.date,
          location: form.location,
          tagline: form.tagline,
          badge: form.badge,
          icon: form.icon,
          registerUrl: form.registerUrl,
          note: form.note,
          sessions: cleanSessions(form.sessions),
          learn: cleanList(form.learn),
          included: cleanList(form.included),
          banner,
        },
        password
      )
      setItems(next)
      resetForm()
    } catch (e) {
      const m = e instanceof Error ? e.message : "Save failed"
      setError(m)
      handleAuthErr(m)
    } finally {
      setBusy(false)
    }
  }

  const edit = (w: Workshop) => {
    setForm({
      id: w.id,
      title: w.title,
      description: w.description,
      date: w.date,
      location: w.location,
      tagline: w.tagline ?? "",
      badge: w.badge ?? "",
      icon: w.icon ?? "",
      registerUrl: w.registerUrl ?? "",
      note: w.note ?? "",
      learn: [...(w.learn ?? [])],
      included: [...(w.included ?? [])],
      sessions: sessionsToRows(w.sessions),
    })
    setCustomIcon(!!w.icon && !ICON_OPTIONS.some((o) => o.value === w.icon))
    setBanner(undefined)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const confirmRemove = async () => {
    if (!confirmId) return
    const id = confirmId
    setBusy(true)
    try {
      setItems(await deleteWorkshop(id, password))
      if (form.id === id) resetForm()
      setConfirmId(null)
    } catch (e) {
      const m = e instanceof Error ? e.message : "Delete failed"
      setError(m)
      handleAuthErr(m)
    } finally {
      setBusy(false)
    }
  }

  /* --- repeatable-row helpers (sessions / learn / included) --- */

  const addSession = () =>
    setForm((f) => ({ ...f, sessions: [...f.sessions, { ...EMPTY_SESSION }] }))

  const updateSession = (i: number, key: keyof SessionRow, value: string) =>
    setForm((f) => ({
      ...f,
      sessions: f.sessions.map((s, si) => (si === i ? { ...s, [key]: value } : s)),
    }))

  const removeSession = (i: number) =>
    setForm((f) => ({ ...f, sessions: f.sessions.filter((_, si) => si !== i) }))

  const addListItem = (key: "learn" | "included") =>
    setForm((f) => ({ ...f, [key]: [...f[key], ""] }))

  const updateListItem = (key: "learn" | "included", i: number, value: string) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].map((s, si) => (si === i ? value : s)),
    }))

  const removeListItem = (key: "learn" | "included", i: number) =>
    setForm((f) => ({ ...f, [key]: f[key].filter((_, si) => si !== i) }))

  // Swap a workshop with its neighbour and persist the new order. Optimistic,
  // with a refetch fallback if the save fails.
  const move = async (idx: number, dir: -1 | 1) => {
    const j = idx + dir
    if (j < 0 || j >= items.length) return
    const next = items.slice()
    ;[next[idx], next[j]] = [next[j], next[idx]]
    setItems(next)
    setBusy(true)
    setError(null)
    try {
      setItems(await reorderWorkshops(next.map((w) => w.id), password))
    } catch (e) {
      const m = e instanceof Error ? e.message : "Reorder failed"
      setError(m)
      handleAuthErr(m)
      try {
        setItems(await fetchWorkshops())
      } catch {
        /* keep optimistic order if refetch also fails */
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-10">
      {/* Editor form with a live preview of the public workshop card beside it */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] xl:items-start">
        <div className="space-y-4 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          {form.id ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {form.id ? "Edit workshop" : "Add a workshop"}
        </h3>
        <input
          className={inputCls}
          placeholder="Title * (e.g. Professional Drone Workshop)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          className={inputCls}
          placeholder="Tagline (short line under the title)"
          value={form.tagline}
          onChange={(e) => setForm({ ...form, tagline: e.target.value })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            className={inputCls}
            placeholder='Badge (e.g. "3 Days")'
            value={form.badge}
            onChange={(e) => setForm({ ...form, badge: e.target.value })}
          />
          <select
            className={inputCls}
            value={customIcon ? "__custom" : form.icon}
            onChange={(e) => {
              if (e.target.value === "__custom") {
                setCustomIcon(true)
                setForm({ ...form, icon: "" })
              } else {
                setCustomIcon(false)
                setForm({ ...form, icon: e.target.value })
              }
            }}
          >
            {ICON_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-maroon-dark">
                {o.label}
              </option>
            ))}
            <option value="__custom" className="bg-maroon-dark">
              Custom…
            </option>
          </select>
        </div>
        {customIcon && (
          <input
            className={inputCls}
            placeholder="Custom icon keyword (e.g. rocket, film, music, design, broadcast)"
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
          />
        )}
        <div className="space-y-1.5">
          <label className="block text-sm text-cream/70">Description</label>
          <textarea
            className={inputCls}
            rows={8}
            placeholder={
              "Description\n\nPress Enter for a new line.\nLeave a blank line between paragraphs."
            }
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <p className="text-xs text-cream/50">
            Tip: leave a blank line between blocks to split the text into separate
            paragraphs. Watch the live preview to see how it will look.
          </p>
        </div>

        {/* Sessions — one block per city, mirroring the card rows */}
        <div className="space-y-3">
          <label className="block text-sm text-cream/70">Sessions</label>
          {form.sessions.map((s, i) => (
            <div
              key={i}
              className="space-y-3 rounded-2xl bg-black/20 p-4 ring-1 ring-white/10"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-maroon">
                  Session {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeSession(i)}
                  aria-label="Remove session"
                  className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-cream/60 hover:bg-white/10 hover:text-red-300"
                >
                  <X className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 rounded-lg border border-tan/20 bg-maroon-dark/60 px-3">
                  <MapPin className="h-4 w-4 shrink-0 text-maroon" />
                  <input
                    className="w-full bg-transparent py-3 text-cream outline-none"
                    placeholder="City (e.g. Chennai)"
                    value={s.city}
                    onChange={(e) => updateSession(i, "city", e.target.value)}
                  />
                </label>
                <MultiDatePicker
                  value={s.dates}
                  onChange={(v) => updateSession(i, "dates", v)}
                  placeholder="Dates (e.g. July 16, 17, 18)"
                />
                <label className="flex items-center gap-2 rounded-lg border border-tan/20 bg-maroon-dark/60 px-3">
                  <Clock className="h-4 w-4 shrink-0 text-maroon" />
                  <input
                    className="w-full bg-transparent py-3 text-cream outline-none"
                    placeholder="Timing (e.g. 10:00 AM – 4:00 PM)"
                    value={s.timing}
                    onChange={(e) => updateSession(i, "timing", e.target.value)}
                  />
                </label>
                <label className="flex items-center gap-2 rounded-lg border border-tan/20 bg-maroon-dark/60 px-3">
                  <MapPin className="h-4 w-4 shrink-0 text-maroon" />
                  <input
                    className="w-full bg-transparent py-3 text-cream outline-none"
                    placeholder="Venue / address"
                    value={s.venue}
                    onChange={(e) => updateSession(i, "venue", e.target.value)}
                  />
                </label>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addSession}
            className="inline-flex items-center gap-2 rounded-full border border-dashed border-tan/30 px-4 py-2 text-sm text-cream/80 hover:border-maroon hover:text-cream"
          >
            <Plus className="h-4 w-4" /> Add session
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* What you'll learn — one bullet per row */}
          <div className="space-y-2">
            <label className="block text-sm text-cream/70">What you'll learn</label>
            {form.learn.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <CircleCheck className="h-4 w-4 shrink-0 text-maroon" />
                <input
                  className={inputCls}
                  placeholder="e.g. Aerial cinematography"
                  value={item}
                  onChange={(e) => updateListItem("learn", i, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeListItem("learn", i)}
                  aria-label="Remove item"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-cream/60 hover:bg-white/10 hover:text-red-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addListItem("learn")}
              className="inline-flex items-center gap-2 rounded-full border border-dashed border-tan/30 px-4 py-2 text-sm text-cream/80 hover:border-maroon hover:text-cream"
            >
              <Plus className="h-4 w-4" /> Add item
            </button>
          </div>

          {/* What's included — one tag per row */}
          <div className="space-y-2">
            <label className="block text-sm text-cream/70">What's included</label>
            {form.included.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-maroon" />
                <input
                  className={inputCls}
                  placeholder="e.g. Course completion certificate"
                  value={item}
                  onChange={(e) => updateListItem("included", i, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeListItem("included", i)}
                  aria-label="Remove item"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-cream/60 hover:bg-white/10 hover:text-red-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addListItem("included")}
              className="inline-flex items-center gap-2 rounded-full border border-dashed border-tan/30 px-4 py-2 text-sm text-cream/80 hover:border-maroon hover:text-cream"
            >
              <Plus className="h-4 w-4" /> Add item
            </button>
          </div>
        </div>

        <input
          className={inputCls}
          placeholder="Register link (https://forms.gle/…)"
          value={form.registerUrl}
          onChange={(e) => setForm({ ...form, registerUrl: e.target.value })}
        />
        <textarea
          className={inputCls}
          rows={2}
          placeholder="Note (e.g. instructor / limited seats) — optional"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />

        <div>
          <label className="mb-1 block text-sm text-cream/70">
            Banner image {form.id && "(leave empty to keep current)"}
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => setBanner(e.target.files?.[0])}
            className="text-sm text-cream/70 file:mr-3 file:rounded-full file:border-0 file:bg-maroon file:px-4 file:py-2 file:text-cream"
          />
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={submit} disabled={busy} className={btnCls}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {form.id ? "Update" : "Add workshop"}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-cream/60 hover:text-cream"
            >
              Cancel edit
            </button>
          )}
          {error && <span className="text-sm text-red-400">{error}</span>}
        </div>
        </div>

        {/* Live preview — the exact card visitors see on the Workshops page */}
        <div className="space-y-3 xl:sticky xl:top-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cream/50">
            Live preview
          </p>
          <WorkshopCard w={previewWorkshop} index={0} />
          <p className="text-xs text-cream/40">
            Updates as you edit — this is exactly how visitors see the workshop.
          </p>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-maroon" />
      ) : items.length === 0 ? (
        <p className="text-cream/50">No workshops yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((w, idx) => (
            <div
              key={w.id}
              className="flex flex-col overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10"
            >
              {w.banner && (
                <img
                  src={w.banner.url}
                  alt={w.title}
                  loading="lazy"
                  className="aspect-[16/9] w-full object-cover"
                />
              )}
              <div className="flex flex-1 flex-col gap-1 p-4">
                <h4 className="font-semibold text-cream">{w.title}</h4>
                <p className="text-xs text-maroon">
                  {[
                    w.badge,
                    w.sessions?.length
                      ? w.sessions
                          .map((s) => [s.city, s.dates].filter(Boolean).join(" "))
                          .join(", ")
                      : [w.date, w.location].filter(Boolean).join(" · "),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="line-clamp-2 text-sm text-cream/70">
                  {w.description}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => move(idx, -1)}
                    disabled={busy || idx === 0}
                    aria-label="Move earlier"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, 1)}
                    disabled={busy || idx === items.length - 1}
                    aria-label="Move later"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => edit(w)}
                    className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs hover:bg-white/20"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmId(w.id)}
                    disabled={busy}
                    className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs text-red-300 hover:bg-red-600 hover:text-white disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmId !== null}
        title="Delete this workshop?"
        message={
          items.find((w) => w.id === confirmId)?.title
            ? `“${items.find((w) => w.id === confirmId)?.title}” will be permanently removed.`
            : "This workshop will be permanently removed."
        }
        busy={busy}
        onConfirm={confirmRemove}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}

/* ---------------------------- Image manager ----------------------------- */

function ImageManager({
  password,
  note,
  list,
  upload,
  remove,
  onMakeFirst,
  onAuthError,
}: {
  password: string
  note: string
  list: () => Promise<Img[]>
  upload: (files: FileList, pw: string) => Promise<{ items: Img[]; errors: string[] }>
  remove: (name: string, pw: string) => Promise<Img[]>
  // When provided, each image gets a "make first" control and the first image
  // is badged as the one shown first (used for the home-screen photos).
  onMakeFirst?: (name: string, pw: string) => Promise<Img[]>
  onAuthError: () => void
}) {
  const [images, setImages] = useState<Img[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Name of the image awaiting delete confirmation (null = dialog closed).
  const [confirmName, setConfirmName] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    list()
      .then(setImages)
      .catch(() => setError("Couldn't load images."))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAuthErr = (m: string) => {
    if (m === "Wrong password") onAuthError()
  }

  const doUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setBusy(true)
    setError(null)
    try {
      const { items, errors } = await upload(files, password)
      setImages(items)
      if (errors.length) setError(`Skipped: ${errors.join("; ")}`)
    } catch (e) {
      const m = e instanceof Error ? e.message : "Upload failed"
      setError(m)
      handleAuthErr(m)
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const confirmDelete = async () => {
    if (!confirmName) return
    setBusy(true)
    try {
      setImages(await remove(confirmName, password))
      setConfirmName(null)
    } catch (e) {
      const m = e instanceof Error ? e.message : "Delete failed"
      setError(m)
      handleAuthErr(m)
    } finally {
      setBusy(false)
    }
  }

  const doMakeFirst = async (name: string) => {
    if (!onMakeFirst) return
    setBusy(true)
    setError(null)
    try {
      setImages(await onMakeFirst(name, password))
    } catch (e) {
      const m = e instanceof Error ? e.message : "Couldn't set first"
      setError(m)
      handleAuthErr(m)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <label
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-tan/25 bg-white/5 px-6 py-10 text-center transition-colors hover:border-maroon ${
          busy ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => doUpload(e.target.files)}
        />
        {busy ? (
          <Loader2 className="h-7 w-7 animate-spin text-maroon" />
        ) : (
          <Upload className="h-7 w-7 text-maroon" />
        )}
        <span className="font-medium">
          {busy ? "Working…" : "Click to upload images"}
        </span>
        <span className="text-sm text-cream/60">{note}</span>
      </label>

      {error && (
        <p className="rounded-lg bg-red-500/15 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-maroon" />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((p, i) => (
            <div
              key={p.name}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-white/10"
            >
              <img src={p.url} alt={p.name} loading="lazy" className="h-full w-full object-cover" />

              {onMakeFirst && i === 0 && (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-maroon px-2 py-1 text-[0.65rem] font-medium text-cream">
                  <Star className="h-3 w-3 fill-current" /> Shown first
                </span>
              )}

              <div className="absolute right-2 top-2 flex gap-2">
                {onMakeFirst && i !== 0 && (
                  <button
                    type="button"
                    onClick={() => doMakeFirst(p.name)}
                    disabled={busy}
                    aria-label="Make this appear first"
                    title="Make this appear first"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-maroon group-hover:opacity-100"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setConfirmName(p.name)}
                  disabled={busy}
                  aria-label="Delete"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {images.length === 0 && (
            <p className="col-span-full text-cream/50">No images yet.</p>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmName !== null}
        title="Delete this image?"
        message="This image will be permanently removed."
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmName(null)}
      />
    </div>
  )
}

/* ------------------------------ Dashboard ------------------------------- */

/* ------------------------------ Testimonials ---------------------------- */

const EMPTY_TESTIMONIAL = { id: "", quote: "", author: "", role: "" }

function TestimonialsManager({
  password,
  onAuthError,
}: {
  password: string
  onAuthError: () => void
}) {
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ ...EMPTY_TESTIMONIAL })
  const [image, setImage] = useState<File | undefined>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // The record being edited (for its existing portrait preview), if any.
  const editing = items.find((t) => t.id === form.id) ?? null

  useEffect(() => {
    fetchTestimonials()
      .then(setItems)
      .catch(() => setError("Couldn't load testimonials."))
      .finally(() => setLoading(false))
  }, [])

  const handleErr = (e: unknown) => {
    const m = e instanceof Error ? e.message : "Something went wrong"
    setError(m)
    if (m === "Wrong password") onAuthError()
  }

  const resetForm = () => {
    setForm({ ...EMPTY_TESTIMONIAL })
    setImage(undefined)
    if (fileRef.current) fileRef.current.value = ""
  }

  const submit = async () => {
    if (!form.quote.trim() || !form.author.trim()) {
      setError("Quote and author are required.")
      return
    }
    if (!form.id && !image) {
      setError("Please add a portrait photo.")
      return
    }
    setBusy(true)
    setError(null)
    try {
      const next = await saveTestimonial(
        {
          id: form.id || undefined,
          quote: form.quote,
          author: form.author,
          role: form.role,
          image,
        },
        password
      )
      setItems(next)
      resetForm()
    } catch (e) {
      handleErr(e)
    } finally {
      setBusy(false)
    }
  }

  const edit = (t: Testimonial) => {
    setForm({ id: t.id, quote: t.quote, author: t.author, role: t.role ?? "" })
    setImage(undefined)
    if (fileRef.current) fileRef.current.value = ""
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const confirmRemove = async () => {
    if (!confirmId) return
    const id = confirmId
    setBusy(true)
    try {
      setItems(await deleteTestimonial(id, password))
      if (form.id === id) resetForm()
      setConfirmId(null)
    } catch (e) {
      handleErr(e)
    } finally {
      setBusy(false)
    }
  }

  const move = async (idx: number, dir: -1 | 1) => {
    const j = idx + dir
    if (j < 0 || j >= items.length) return
    const next = items.slice()
    ;[next[idx], next[j]] = [next[j], next[idx]]
    setItems(next) // optimistic
    setBusy(true)
    setError(null)
    try {
      setItems(await reorderTestimonials(next.map((t) => t.id), password))
    } catch (e) {
      handleErr(e)
      try {
        setItems(await fetchTestimonials())
      } catch {
        /* ignore */
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-10">
      {/* Editor */}
      <div className="max-w-2xl space-y-4 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          {form.id ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {form.id ? "Edit testimonial" : "Add a testimonial"}
        </h3>
        <textarea
          className={`${inputCls} min-h-[90px]`}
          placeholder="Quote * (what the student said)"
          value={form.quote}
          onChange={(e) => setForm({ ...form, quote: e.target.value })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            className={inputCls}
            placeholder="Student name *"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
          />
          <input
            className={inputCls}
            placeholder="Course / role (optional)"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-black/40 ring-1 ring-white/10">
            {image ? (
              <img
                src={URL.createObjectURL(image)}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : editing?.image?.url ? (
              <img
                src={editing.image.url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full border border-tan/20 px-4 py-2 text-sm text-cream/80 transition-colors hover:bg-white/5"
          >
            <Upload className="h-4 w-4" />
            {form.id ? "Replace photo" : "Portrait photo *"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setImage(e.target.files?.[0])}
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex items-center gap-3">
          <button type="button" onClick={submit} disabled={busy} className={btnCls}>
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {form.id ? "Save changes" : "Add testimonial"}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-full border border-tan/20 px-4 py-2 text-sm text-cream/80 transition-colors hover:bg-white/5"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center gap-2 text-cream/60">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <p className="text-cream/60">No testimonials yet — add one above.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((t, idx) => (
            <li
              key={t.id}
              className="flex items-center gap-4 rounded-xl border border-tan/15 bg-white/5 p-3"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-black/40">
                {t.image?.url && (
                  <img
                    src={t.image.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-cream/90">“{t.quote}”</p>
                <p className="mt-1 text-xs text-cream/55">
                  {t.author}
                  {t.role ? ` · ${t.role}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(idx, -1)}
                  disabled={busy || idx === 0}
                  aria-label="Move up"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-tan/20 text-cream transition-colors hover:border-maroon disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, 1)}
                  disabled={busy || idx === items.length - 1}
                  aria-label="Move down"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-tan/20 text-cream transition-colors hover:border-maroon disabled:opacity-30"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => edit(t)}
                  aria-label="Edit"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-tan/20 text-cream transition-colors hover:border-maroon"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmId(t.id)}
                  disabled={busy}
                  aria-label="Delete"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-400/40 text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={confirmId !== null}
        title="Delete testimonial?"
        message="This permanently removes the testimonial and its photo."
        busy={busy}
        onConfirm={confirmRemove}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}

/* ----------------------- Certification courses -------------------------- */

const CERT_COURSE_KINDS: { value: CertCourseKind; label: string }[] = [
  { value: "diploma", label: "Diploma" },
  { value: "photography", label: "Photography" },
  { value: "videography", label: "Videography" },
  { value: "graphic-design", label: "Graphic Design" },
  { value: "video-editing", label: "Video Editing" },
  { value: "drone", label: "Drone" },
  { value: "live-sound", label: "Live Sound" },
  { value: "studio-recording", label: "Studio Recording" },
]

// Reusable editor for a simple string[] field (add / edit / remove rows).
function ListField({
  label,
  hint,
  items,
  onChange,
  placeholder,
}: {
  label: string
  hint?: string
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-cream/80">{label}</label>
      {hint && <p className="-mt-1 text-xs text-cream/45">{hint}</p>}
      {items.map((v, i) => (
        <div key={i} className="flex gap-2">
          <input
            className={inputCls}
            value={v}
            placeholder={placeholder}
            onChange={(e) =>
              onChange(items.map((x, xi) => (xi === i ? e.target.value : x)))
            }
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, xi) => xi !== i))}
            aria-label="Remove"
            className="flex h-[46px] w-11 shrink-0 items-center justify-center rounded-lg border border-red-400/40 text-red-300 transition-colors hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="inline-flex items-center gap-2 rounded-full border border-tan/20 px-4 py-2 text-sm text-cream/80 transition-colors hover:bg-white/5"
      >
        <Plus className="h-4 w-4" /> Add
      </button>
    </div>
  )
}

// Editor for the diploma's module breakdown: a list of { title, items[] }.
function ModulesField({
  modules,
  onChange,
}: {
  modules: CourseModule[]
  onChange: (modules: CourseModule[]) => void
}) {
  const update = (i: number, patch: Partial<CourseModule>) =>
    onChange(modules.map((m, mi) => (mi === i ? { ...m, ...patch } : m)))

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-cream/80">
        Modules (curriculum breakdown)
      </label>
      <p className="-mt-1 text-xs text-cream/45">
        Leave empty for single-skill courses — they use the “What you’ll learn”
        list instead.
      </p>
      {modules.map((m, i) => (
        <div
          key={i}
          className="space-y-2 rounded-xl border border-tan/15 bg-black/20 p-3"
        >
          <div className="flex gap-2">
            <input
              className={inputCls}
              value={m.title}
              placeholder="Module title"
              onChange={(e) => update(i, { title: e.target.value })}
            />
            <button
              type="button"
              onClick={() => onChange(modules.filter((_, mi) => mi !== i))}
              aria-label="Remove module"
              className="flex h-[46px] w-11 shrink-0 items-center justify-center rounded-lg border border-red-400/40 text-red-300 transition-colors hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="pl-3">
            <ListField
              label="Topics"
              items={m.items}
              onChange={(items) => update(i, { items })}
              placeholder="Topic covered in this module"
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...modules, { title: "", items: [] }])}
        className="inline-flex items-center gap-2 rounded-full border border-tan/20 px-4 py-2 text-sm text-cream/80 transition-colors hover:bg-white/5"
      >
        <Plus className="h-4 w-4" /> Add module
      </button>
    </div>
  )
}

type CourseForm = {
  id: string
  kind: CertCourseKind
  title: string
  subtitle: string
  badge: string
  why: string
  duration: string
  schedule: string
  format: string
  certification: string
  who: string
  learn: string[]
  choose: string[]
  careers: string[]
  modules: CourseModule[]
}

const EMPTY_COURSE: CourseForm = {
  id: "",
  kind: "photography",
  title: "",
  subtitle: "",
  badge: "",
  why: "",
  duration: "",
  schedule: "",
  format: "",
  certification: "",
  who: "",
  learn: [],
  choose: [],
  careers: [],
  modules: [],
}

const courseToForm = (c: CertCourse): CourseForm => ({
  id: c.id,
  kind: c.kind,
  title: c.title,
  subtitle: c.subtitle ?? "",
  badge: c.badge ?? "",
  why: c.why ?? "",
  duration: c.duration ?? "",
  schedule: c.schedule ?? "",
  format: c.format ?? "",
  certification: c.certification ?? "",
  who: c.who ?? "",
  learn: [...(c.learn ?? [])],
  choose: [...(c.choose ?? [])],
  careers: [...(c.careers ?? [])],
  modules: (c.modules ?? []).map((m) => ({ title: m.title, items: [...m.items] })),
})

function CoursesManager({
  password,
  onAuthError,
}: {
  password: string
  onAuthError: () => void
}) {
  const [items, setItems] = useState<CertCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<CourseForm>({ ...EMPTY_COURSE })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => {
    fetchCertCourses()
      .then(setItems)
      .catch(() => setError("Couldn't load courses."))
      .finally(() => setLoading(false))
  }, [])

  const handleErr = (e: unknown) => {
    const m = e instanceof Error ? e.message : "Something went wrong"
    setError(m)
    if (m === "Wrong password") onAuthError()
  }

  const resetForm = () => setForm({ ...EMPTY_COURSE })

  const submit = async () => {
    if (!form.title.trim()) {
      setError("Title is required.")
      return
    }
    setBusy(true)
    setError(null)
    try {
      const next = await saveCertCourse(
        {
          id: form.id || undefined,
          kind: form.kind,
          title: form.title,
          subtitle: form.subtitle,
          why: form.why,
          duration: form.duration,
          schedule: form.schedule,
          format: form.format,
          certification: form.certification,
          badge: form.badge,
          who: form.who,
          learn: form.learn,
          modules: form.modules,
          choose: form.choose,
          careers: form.careers,
        },
        password
      )
      setItems(next)
      resetForm()
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (e) {
      handleErr(e)
    } finally {
      setBusy(false)
    }
  }

  const edit = (c: CertCourse) => {
    setForm(courseToForm(c))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const confirmRemove = async () => {
    if (!confirmId) return
    const id = confirmId
    setBusy(true)
    try {
      setItems(await deleteCertCourse(id, password))
      if (form.id === id) resetForm()
      setConfirmId(null)
    } catch (e) {
      handleErr(e)
    } finally {
      setBusy(false)
    }
  }

  const move = async (idx: number, dir: -1 | 1) => {
    const j = idx + dir
    if (j < 0 || j >= items.length) return
    const next = items.slice()
    ;[next[idx], next[j]] = [next[j], next[idx]]
    setItems(next) // optimistic
    setBusy(true)
    setError(null)
    try {
      setItems(await reorderCertCourses(next.map((c) => c.id), password))
    } catch (e) {
      handleErr(e)
      try {
        setItems(await fetchCertCourses())
      } catch {
        /* ignore */
      }
    } finally {
      setBusy(false)
    }
  }

  const set = (patch: Partial<CourseForm>) => setForm((f) => ({ ...f, ...patch }))

  return (
    <div className="space-y-10">
      <p className="text-sm text-cream/70">
        The certification courses shown on the Academy page. Drag order with the
        arrows; the first card is the most prominent.
      </p>

      {/* Editor */}
      <div className="max-w-2xl space-y-5 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          {form.id ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {form.id ? "Edit course" : "Add a course"}
        </h3>

        <input
          className={inputCls}
          placeholder="Title * (e.g. Photography)"
          value={form.title}
          onChange={(e) => set({ title: e.target.value })}
        />
        <input
          className={inputCls}
          placeholder="Subtitle (e.g. Professional Photography Certification Course)"
          value={form.subtitle}
          onChange={(e) => set({ subtitle: e.target.value })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-cream/70">Icon</label>
            <select
              className={inputCls}
              value={form.kind}
              onChange={(e) => set({ kind: e.target.value as CertCourseKind })}
            >
              {CERT_COURSE_KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </div>
          <input
            className={inputCls}
            placeholder='Badge (e.g. "Launching Soon")'
            value={form.badge}
            onChange={(e) => set({ badge: e.target.value })}
          />
        </div>

        <textarea
          className={`${inputCls} min-h-[110px]`}
          placeholder="Intro paragraph (the “why this course” text)"
          value={form.why}
          onChange={(e) => set({ why: e.target.value })}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <input
            className={inputCls}
            placeholder="Duration (e.g. 1 Month)"
            value={form.duration}
            onChange={(e) => set({ duration: e.target.value })}
          />
          <input
            className={inputCls}
            placeholder="Schedule (e.g. Mon to Fri, 3 hours/day)"
            value={form.schedule}
            onChange={(e) => set({ schedule: e.target.value })}
          />
          <input
            className={inputCls}
            placeholder="Format (e.g. Studio + outdoor shoots)"
            value={form.format}
            onChange={(e) => set({ format: e.target.value })}
          />
          <input
            className={inputCls}
            placeholder="Certification (e.g. Certified Photographer)"
            value={form.certification}
            onChange={(e) => set({ certification: e.target.value })}
          />
        </div>

        <ListField
          label="What you’ll learn"
          hint="Used for single-skill courses. Leave empty if you fill Modules below."
          items={form.learn}
          onChange={(learn) => set({ learn })}
          placeholder="A skill or topic covered"
        />

        <ModulesField
          modules={form.modules}
          onChange={(modules) => set({ modules })}
        />

        <ListField
          label="Why choose this course"
          items={form.choose}
          onChange={(choose) => set({ choose })}
          placeholder="A reason to choose this course"
        />

        <ListField
          label="Career opportunities"
          hint="Optional — mainly for the diploma."
          items={form.careers}
          onChange={(careers) => set({ careers })}
          placeholder="A job role / career path"
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-cream/80">
            Who it’s for
          </label>
          <textarea
            className={`${inputCls} min-h-[80px]`}
            placeholder="Who should take this course"
            value={form.who}
            onChange={(e) => set({ who: e.target.value })}
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex items-center gap-3">
          <button type="button" onClick={submit} disabled={busy} className={btnCls}>
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {form.id ? "Save changes" : "Add course"}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-full border border-tan/20 px-4 py-2 text-sm text-cream/80 transition-colors hover:bg-white/5"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center gap-2 text-cream/60">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <p className="text-cream/60">No courses yet — add one above.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((c, idx) => (
            <li
              key={c.id}
              className="flex items-center gap-4 rounded-xl border border-tan/15 bg-white/5 p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-cream/90">
                  {c.title}
                  {c.badge ? (
                    <span className="ml-2 rounded-full bg-maroon/20 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-maroon">
                      {c.badge}
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 truncate text-xs text-cream/55">
                  {c.kind} · {c.duration}
                  {c.subtitle ? ` · ${c.subtitle}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(idx, -1)}
                  disabled={busy || idx === 0}
                  aria-label="Move up"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-tan/20 text-cream transition-colors hover:border-maroon disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, 1)}
                  disabled={busy || idx === items.length - 1}
                  aria-label="Move down"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-tan/20 text-cream transition-colors hover:border-maroon disabled:opacity-30"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => edit(c)}
                  aria-label="Edit"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-tan/20 text-cream transition-colors hover:border-maroon"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmId(c.id)}
                  disabled={busy}
                  aria-label="Delete"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-400/40 text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={confirmId !== null}
        title="Delete course?"
        message="This permanently removes the course from the Academy page."
        busy={busy}
        onConfirm={confirmRemove}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}

/* --------------------- Home "Workshops & Courses" list ------------------ */

const HOME_COURSE_KINDS: { value: HomeCourseKind; label: string }[] = [
  { value: "gimbal", label: "Gimbal (rotating icon)" },
  { value: "drone", label: "Drone (take-off icon)" },
  { value: "aerial", label: "Aerial (plane icon)" },
  { value: "clapper", label: "Media / production (clapperboard icon)" },
  { value: "camera", label: "Photography (camera icon)" },
]

const EMPTY_HOME_COURSE = {
  id: "",
  kind: "clapper" as HomeCourseKind,
  title: "",
  text: "",
}

function HomeCoursesManager({
  password,
  onAuthError,
}: {
  password: string
  onAuthError: () => void
}) {
  const [items, setItems] = useState<HomeCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ ...EMPTY_HOME_COURSE })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => {
    fetchHomeCourses()
      .then(setItems)
      .catch(() => setError("Couldn't load courses."))
      .finally(() => setLoading(false))
  }, [])

  const handleErr = (e: unknown) => {
    const m = e instanceof Error ? e.message : "Something went wrong"
    setError(m)
    if (m === "Wrong password") onAuthError()
  }

  const resetForm = () => setForm({ ...EMPTY_HOME_COURSE })

  const submit = async () => {
    if (!form.title.trim()) {
      setError("Title is required.")
      return
    }
    setBusy(true)
    setError(null)
    try {
      const next = await saveHomeCourse(
        {
          id: form.id || undefined,
          kind: form.kind,
          title: form.title,
          text: form.text,
        },
        password
      )
      setItems(next)
      resetForm()
    } catch (e) {
      handleErr(e)
    } finally {
      setBusy(false)
    }
  }

  const edit = (c: HomeCourse) => {
    setForm({ id: c.id, kind: c.kind, title: c.title, text: c.text })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const confirmRemove = async () => {
    if (!confirmId) return
    const id = confirmId
    setBusy(true)
    try {
      setItems(await deleteHomeCourse(id, password))
      if (form.id === id) resetForm()
      setConfirmId(null)
    } catch (e) {
      handleErr(e)
    } finally {
      setBusy(false)
    }
  }

  const move = async (idx: number, dir: -1 | 1) => {
    const j = idx + dir
    if (j < 0 || j >= items.length) return
    const next = items.slice()
    ;[next[idx], next[j]] = [next[j], next[idx]]
    setItems(next) // optimistic
    setBusy(true)
    setError(null)
    try {
      setItems(await reorderHomeCourses(next.map((c) => c.id), password))
    } catch (e) {
      handleErr(e)
      try {
        setItems(await fetchHomeCourses())
      } catch {
        /* ignore */
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-10">
      <p className="text-sm text-cream/70">
        The “Workshops &amp; Courses” menu on the home page. Each row links to the
        Workshops page.
      </p>

      {/* Editor */}
      <div className="max-w-2xl space-y-4 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          {form.id ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {form.id ? "Edit course" : "Add a course"}
        </h3>
        <input
          className={inputCls}
          placeholder="Title * (e.g. Drone Workshop)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          className={`${inputCls} min-h-[70px]`}
          placeholder="Short description (one line under the title)"
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
        />
        <div>
          <label className="mb-1 block text-sm text-cream/70">Icon</label>
          <select
            className={inputCls}
            value={form.kind}
            onChange={(e) =>
              setForm({ ...form, kind: e.target.value as HomeCourseKind })
            }
          >
            {HOME_COURSE_KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex items-center gap-3">
          <button type="button" onClick={submit} disabled={busy} className={btnCls}>
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {form.id ? "Save changes" : "Add course"}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-full border border-tan/20 px-4 py-2 text-sm text-cream/80 transition-colors hover:bg-white/5"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center gap-2 text-cream/60">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <p className="text-cream/60">No courses yet — add one above.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((c, idx) => (
            <li
              key={c.id}
              className="flex items-center gap-4 rounded-xl border border-tan/15 bg-white/5 p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-cream/90">{c.title}</p>
                <p className="mt-0.5 truncate text-xs text-cream/55">
                  {c.kind} · {c.text}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(idx, -1)}
                  disabled={busy || idx === 0}
                  aria-label="Move up"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-tan/20 text-cream transition-colors hover:border-maroon disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, 1)}
                  disabled={busy || idx === items.length - 1}
                  aria-label="Move down"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-tan/20 text-cream transition-colors hover:border-maroon disabled:opacity-30"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => edit(c)}
                  aria-label="Edit"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-tan/20 text-cream transition-colors hover:border-maroon"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmId(c.id)}
                  disabled={busy}
                  aria-label="Delete"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-400/40 text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={confirmId !== null}
        title="Delete course?"
        message="This row will be removed from the home page menu."
        busy={busy}
        onConfirm={confirmRemove}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}

/* ---------------------------------- FAQ --------------------------------- */

const EMPTY_FAQ = { id: "", question: "", answer: "" }

function FaqManager({
  password,
  onAuthError,
}: {
  password: string
  onAuthError: () => void
}) {
  const [items, setItems] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ ...EMPTY_FAQ })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => {
    fetchFaqs()
      .then(setItems)
      .catch(() => setError("Couldn't load FAQ."))
      .finally(() => setLoading(false))
  }, [])

  const handleErr = (e: unknown) => {
    const m = e instanceof Error ? e.message : "Something went wrong"
    setError(m)
    if (m === "Wrong password") onAuthError()
  }

  const resetForm = () => setForm({ ...EMPTY_FAQ })

  const submit = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      setError("Question and answer are required.")
      return
    }
    setBusy(true)
    setError(null)
    try {
      const next = await saveFaq(
        { id: form.id || undefined, question: form.question, answer: form.answer },
        password
      )
      setItems(next)
      resetForm()
    } catch (e) {
      handleErr(e)
    } finally {
      setBusy(false)
    }
  }

  const edit = (f: FaqItem) => {
    setForm({ id: f.id, question: f.question, answer: f.answer })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const confirmRemove = async () => {
    if (!confirmId) return
    const id = confirmId
    setBusy(true)
    try {
      setItems(await deleteFaq(id, password))
      if (form.id === id) resetForm()
      setConfirmId(null)
    } catch (e) {
      handleErr(e)
    } finally {
      setBusy(false)
    }
  }

  const move = async (idx: number, dir: -1 | 1) => {
    const j = idx + dir
    if (j < 0 || j >= items.length) return
    const next = items.slice()
    ;[next[idx], next[j]] = [next[j], next[idx]]
    setItems(next) // optimistic
    setBusy(true)
    setError(null)
    try {
      setItems(await reorderFaqs(next.map((f) => f.id), password))
    } catch (e) {
      handleErr(e)
      try {
        setItems(await fetchFaqs())
      } catch {
        /* ignore */
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-10">
      <p className="text-sm text-cream/70">
        The “Frequently asked questions” accordion on the About page.
      </p>

      {/* Editor */}
      <div className="max-w-2xl space-y-4 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          {form.id ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {form.id ? "Edit question" : "Add a question"}
        </h3>
        <input
          className={inputCls}
          placeholder="Question *"
          value={form.question}
          onChange={(e) => setForm({ ...form, question: e.target.value })}
        />
        <textarea
          className={`${inputCls} min-h-[100px]`}
          placeholder="Answer *"
          value={form.answer}
          onChange={(e) => setForm({ ...form, answer: e.target.value })}
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex items-center gap-3">
          <button type="button" onClick={submit} disabled={busy} className={btnCls}>
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {form.id ? "Save changes" : "Add question"}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-full border border-tan/20 px-4 py-2 text-sm text-cream/80 transition-colors hover:bg-white/5"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center gap-2 text-cream/60">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <p className="text-cream/60">No questions yet — add one above.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((f, idx) => (
            <li
              key={f.id}
              className="flex items-center gap-4 rounded-xl border border-tan/15 bg-white/5 p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-cream/90">{f.question}</p>
                <p className="mt-0.5 truncate text-xs text-cream/55">{f.answer}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(idx, -1)}
                  disabled={busy || idx === 0}
                  aria-label="Move up"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-tan/20 text-cream transition-colors hover:border-maroon disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, 1)}
                  disabled={busy || idx === items.length - 1}
                  aria-label="Move down"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-tan/20 text-cream transition-colors hover:border-maroon disabled:opacity-30"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => edit(f)}
                  aria-label="Edit"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-tan/20 text-cream transition-colors hover:border-maroon"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmId(f.id)}
                  disabled={busy}
                  aria-label="Delete"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-400/40 text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={confirmId !== null}
        title="Delete question?"
        message="This question will be removed from the FAQ."
        busy={busy}
        onConfirm={confirmRemove}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}

/* ---------------------------- Page backgrounds -------------------------- */

const BG_SLOTS: { id: BackgroundSlot; label: string; hint: string }[] = [
  { id: "academy", label: "Media Academy", hint: "Hero background on the Academy page" },
  { id: "services", label: "Our Services", hint: "Hero background on the Services page" },
  {
    id: "digital-marketing",
    label: "Digital Marketing",
    hint: "Hero background on the Digital Marketing page",
  },
  { id: "about", label: "About Us", hint: "Hero background on the About page" },
  { id: "workshops", label: "Workshops", hint: "Hero background on the Workshops page" },
]

function BackgroundsManager({
  password,
  onAuthError,
}: {
  password: string
  onAuthError: () => void
}) {
  const [map, setMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null) // slot id being worked on
  const [error, setError] = useState<string | null>(null)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    fetchBackgrounds()
      .then(setMap)
      .catch(() => setError("Couldn't load backgrounds."))
      .finally(() => setLoading(false))
  }, [])

  const handleErr = (e: unknown) => {
    const m = e instanceof Error ? e.message : "Something went wrong"
    setError(m)
    if (m === "Wrong password") onAuthError()
  }

  const onUpload = async (slot: BackgroundSlot, file: File) => {
    setBusy(slot)
    setError(null)
    try {
      setMap(await setBackground(slot, file, password))
    } catch (e) {
      handleErr(e)
    } finally {
      setBusy(null)
      const input = fileRefs.current[slot]
      if (input) input.value = ""
    }
  }

  const onReset = async (slot: BackgroundSlot) => {
    setBusy(slot)
    setError(null)
    try {
      setMap(await clearBackground(slot, password))
    } catch (e) {
      handleErr(e)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-cream/70">
        Replace the large hero image at the top of each page. JPG, PNG, WebP or
        GIF · up to 50 MB · landscape images work best. “Reset to default”
        restores the image that ships with the site.
      </p>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-cream/60">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {BG_SLOTS.map((slot) => {
            const url = map[slot.id]
            const working = busy === slot.id
            return (
              <div
                key={slot.id}
                className="space-y-3 rounded-2xl border border-tan/15 bg-white/5 p-4"
              >
                <div>
                  <h3 className="font-semibold">{slot.label}</h3>
                  <p className="text-xs text-cream/55">{slot.hint}</p>
                </div>
                <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-black/40">
                  {url ? (
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-cream/40">
                      Using default image
                    </div>
                  )}
                  {working && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <Loader2 className="h-5 w-5 animate-spin text-cream" />
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileRefs.current[slot.id]?.click()}
                    disabled={working}
                    className={btnCls}
                  >
                    <Upload className="h-4 w-4" />
                    {url ? "Replace" : "Upload"}
                  </button>
                  {url && (
                    <button
                      type="button"
                      onClick={() => onReset(slot.id)}
                      disabled={working}
                      className="inline-flex items-center gap-2 rounded-full border border-tan/20 px-4 py-2 text-sm text-cream/80 transition-colors hover:bg-white/5 disabled:opacity-50"
                    >
                      <RotateCcw className="h-4 w-4" /> Reset to default
                    </button>
                  )}
                </div>
                <input
                  ref={(el) => {
                    fileRefs.current[slot.id] = el
                  }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) onUpload(slot.id, f)
                  }}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const AdminDashboard: React.FC = () => {
  const [password, setPassword] = useState(() => sessionStorage.getItem(PW_KEY) ?? "")
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem(PW_KEY))
  const [tab, setTab] = useState<Tab>("announcement")
  const [error, setError] = useState<string | null>(null)

  const login = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return
    sessionStorage.setItem(PW_KEY, password)
    setAuthed(true)
  }

  const logout = () => {
    sessionStorage.removeItem(PW_KEY)
    setPassword("")
    setAuthed(false)
  }

  const onAuthError = () => {
    setError("Session expired — please sign in again.")
    logout()
  }

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-maroon-dark px-6 text-cream">
        <SEO title="Admin Login - Genesis Kreations" noindex />
        <form
          onSubmit={login}
          className="w-full max-w-sm rounded-2xl border border-tan/15 bg-white/5 p-8 backdrop-blur"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.4em] text-maroon">
            Genesis Kreations
          </p>
          <h1 className="mb-6 text-2xl font-semibold">Admin Dashboard</h1>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputCls} mb-4`}
            placeholder="Admin password"
          />
          <button type="submit" className={`${btnCls} w-full justify-center`}>
            Sign in
          </button>
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </form>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-maroon-dark px-6 py-14 text-cream">
      <SEO title="Admin Dashboard - Genesis Kreations" noindex />
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-maroon">
              Genesis Kreations
            </p>
            <h1 className="text-3xl font-semibold md:text-4xl">Admin Dashboard</h1>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full border border-tan/20 px-4 py-2 text-sm text-cream/80 transition-colors hover:bg-white/5"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
                tab === t.id
                  ? "bg-maroon text-cream"
                  : "bg-white/5 text-cream/70 hover:bg-white/10"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Panels */}
        {tab === "announcement" && (
          <AnnouncementEditor password={password} onAuthError={onAuthError} />
        )}
        {tab === "workshops" && (
          <WorkshopsManager password={password} onAuthError={onAuthError} />
        )}
        {tab === "courses" && (
          <CoursesManager password={password} onAuthError={onAuthError} />
        )}
        {tab === "testimonials" && (
          <TestimonialsManager password={password} onAuthError={onAuthError} />
        )}
        {tab === "homeCourses" && (
          <HomeCoursesManager password={password} onAuthError={onAuthError} />
        )}
        {tab === "faq" && (
          <FaqManager password={password} onAuthError={onAuthError} />
        )}
        {tab === "gallery" && (
          <ImageManager
            password={password}
            note="JPG, PNG, WebP or GIF · up to 50 MB each · shows on the Gallery page"
            list={fetchGalleryPhotos}
            upload={async (files, pw) => {
              const r = await uploadGalleryPhotos(files, pw)
              return { items: r.photos, errors: r.errors }
            }}
            remove={deleteGalleryPhoto}
            onAuthError={onAuthError}
          />
        )}
        {tab === "projector" && (
          <SlideshowManager password={password} onAuthError={onAuthError} />
        )}
        {tab === "reels" && (
          <ReelsManager password={password} onAuthError={onAuthError} />
        )}
        {tab === "backgrounds" && (
          <BackgroundsManager password={password} onAuthError={onAuthError} />
        )}
      </div>
    </main>
  )
}

/* --------------------------- Home-screen slideshow --------------------------- */

function SlideshowManager({
  password,
  onAuthError,
}: {
  password: string
  onAuthError: () => void
}) {
  const [items, setItems] = useState<ProjectorItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [ytUrl, setYtUrl] = useState("")
  const photoRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchProjectorItems()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleErr(e: unknown) {
    const m = e instanceof Error ? e.message : "Something went wrong"
    setError(m)
    if (m === "Wrong password") onAuthError()
  }

  async function onUpload(files: FileList, kind: "photo" | "video") {
    setBusy(true)
    setError("")
    try {
      const r =
        kind === "photo"
          ? await uploadProjectorImages(files, password)
          : await uploadProjectorVideos(files, password)
      setItems(r.items)
      if (r.errors.length) setError(r.errors.join(" · "))
    } catch (e) {
      handleErr(e)
    } finally {
      setBusy(false)
      if (photoRef.current) photoRef.current.value = ""
      if (videoRef.current) videoRef.current.value = ""
    }
  }

  async function onAddYoutube() {
    if (!ytUrl.trim()) return
    setBusy(true)
    setError("")
    try {
      setItems(await addProjectorYoutube(ytUrl.trim(), password))
      setYtUrl("")
    } catch (e) {
      handleErr(e)
    } finally {
      setBusy(false)
    }
  }

  async function onDelete(name: string) {
    setBusy(true)
    setError("")
    try {
      setItems(await deleteProjectorItem(name, password))
    } catch (e) {
      handleErr(e)
    } finally {
      setBusy(false)
    }
  }

  async function move(idx: number, dir: -1 | 1) {
    const j = idx + dir
    if (j < 0 || j >= items.length) return
    const next = items.slice()
    ;[next[idx], next[j]] = [next[j], next[idx]]
    setItems(next) // optimistic
    setBusy(true)
    setError("")
    try {
      setItems(await reorderProjector(next.map((i) => i.name), password))
    } catch (e) {
      handleErr(e)
      try {
        setItems(await fetchProjectorItems())
      } catch {
        /* ignore */
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-cream/70">
        Photos, videos and YouTube videos play in the home-screen slideshow, in
        the order shown below — use the arrows to reorder. Videos: MP4, WebM, MOV
        or OGG · up to 50 MB · they autoplay muted with an unmute button on the
        site. YouTube videos autoplay muted and advance when they finish.
      </p>

      {/* Add a YouTube video */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 sm:flex-row sm:items-center">
        <input
          className={`${inputCls} flex-1`}
          placeholder="Paste a YouTube or Shorts link…"
          value={ytUrl}
          onChange={(e) => setYtUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              onAddYoutube()
            }
          }}
        />
        <button
          type="button"
          onClick={onAddYoutube}
          disabled={busy || !ytUrl.trim()}
          className={btnCls}
        >
          <Video className="h-4 w-4" /> Add YouTube video
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => photoRef.current?.click()}
          disabled={busy}
          className={btnCls}
        >
          <Upload className="h-4 w-4" /> Add photos
        </button>
        <button
          type="button"
          onClick={() => videoRef.current?.click()}
          disabled={busy}
          className={btnCls}
        >
          <Film className="h-4 w-4" /> Add videos
        </button>
        {busy && (
          <span className="flex items-center gap-2 text-sm text-cream/60">
            <Loader2 className="h-4 w-4 animate-spin" /> Working…
          </span>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-cream/60">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <p className="text-cream/60">No media yet — add photos or videos above.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((it, idx) => (
            <li
              key={it.name}
              className="flex items-center gap-4 rounded-xl border border-tan/15 bg-white/5 p-3"
            >
              <div className="h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-black">
                {it.type === "video" ? (
                  <video
                    src={it.url}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                ) : it.type === "youtube" ? (
                  <img
                    src={`https://i.ytimg.com/vi/${it.videoId}/hqdefault.jpg`}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img src={it.url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-maroon/20 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-maroon">
                  {it.type === "video" ? (
                    <Film className="h-3 w-3" />
                  ) : it.type === "youtube" ? (
                    <Video className="h-3 w-3" />
                  ) : (
                    <Images className="h-3 w-3" />
                  )}
                  {it.type}
                </span>
                <p className="mt-1 truncate text-xs text-cream/50">{it.name}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(idx, -1)}
                  disabled={busy || idx === 0}
                  aria-label="Move up"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-tan/20 text-cream transition-colors hover:border-maroon disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, 1)}
                  disabled={busy || idx === items.length - 1}
                  aria-label="Move down"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-tan/20 text-cream transition-colors hover:border-maroon disabled:opacity-30"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(it.name)}
                  disabled={busy}
                  aria-label="Delete"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-400/40 text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={photoRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const f = e.target.files
          if (f && f.length) onUpload(f, "photo")
        }}
      />
      <input
        ref={videoRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/ogg,video/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const f = e.target.files
          if (f && f.length) onUpload(f, "video")
        }}
      />
    </div>
  )
}

/* ---------------------------------- Reels -------------------------------- */

function ReelsManager({
  password,
  onAuthError,
}: {
  password: string
  onAuthError: () => void
}) {
  const [items, setItems] = useState<ReelItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [ytUrl, setYtUrl] = useState("")
  const videoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchReels()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleErr(e: unknown) {
    const m = e instanceof Error ? e.message : "Something went wrong"
    setError(m)
    if (m === "Wrong password") onAuthError()
  }

  async function onUpload(files: FileList) {
    setBusy(true)
    setError("")
    try {
      const r = await uploadReels(files, password)
      setItems(r.items)
      if (r.errors.length) setError(r.errors.join(" · "))
    } catch (e) {
      handleErr(e)
    } finally {
      setBusy(false)
      if (videoRef.current) videoRef.current.value = ""
    }
  }

  async function onAddYoutube() {
    if (!ytUrl.trim()) return
    setBusy(true)
    setError("")
    try {
      setItems(await saveReelYoutube(ytUrl.trim(), password))
      setYtUrl("")
    } catch (e) {
      handleErr(e)
    } finally {
      setBusy(false)
    }
  }

  async function onDelete(id: string) {
    setBusy(true)
    setError("")
    try {
      setItems(await deleteReel(id, password))
    } catch (e) {
      handleErr(e)
    } finally {
      setBusy(false)
    }
  }

  async function move(idx: number, dir: -1 | 1) {
    const j = idx + dir
    if (j < 0 || j >= items.length) return
    const next = items.slice()
    ;[next[idx], next[j]] = [next[j], next[idx]]
    setItems(next) // optimistic
    setBusy(true)
    setError("")
    try {
      setItems(await reorderReels(next.map((i) => i.id), password))
    } catch (e) {
      handleErr(e)
      try {
        setItems(await fetchReels())
      } catch {
        /* ignore */
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-cream/70">
        Short vertical videos for the “Watch our latest reels” wall on the home
        page, in the order shown — use the arrows to reorder. Add a YouTube /
        Shorts link, or upload your own video (MP4, WebM, MOV or OGG · up to 50 MB).
        They play in a pop-up when a visitor taps one. If there are no reels, the
        section is hidden on the site.
      </p>

      {/* Add a YouTube reel */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 sm:flex-row sm:items-center">
        <input
          className={`${inputCls} flex-1`}
          placeholder="Paste a YouTube or Shorts link…"
          value={ytUrl}
          onChange={(e) => setYtUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              onAddYoutube()
            }
          }}
        />
        <button
          type="button"
          onClick={onAddYoutube}
          disabled={busy || !ytUrl.trim()}
          className={btnCls}
        >
          <Video className="h-4 w-4" /> Add YouTube reel
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => videoRef.current?.click()}
          disabled={busy}
          className={btnCls}
        >
          <Upload className="h-4 w-4" /> Upload a video
        </button>
        {busy && (
          <span className="flex items-center gap-2 text-sm text-cream/60">
            <Loader2 className="h-4 w-4 animate-spin" /> Working…
          </span>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-cream/60">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <p className="text-cream/60">No reels yet — add one above.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((it, idx) => (
            <li
              key={it.id}
              className="overflow-hidden rounded-xl border border-tan/15 bg-white/5"
            >
              <div className="relative aspect-[9/16] w-full bg-black">
                {it.kind === "youtube" ? (
                  <img
                    src={`https://i.ytimg.com/vi/${it.videoId}/hqdefault.jpg`}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <video
                    src={`${it.url}#t=0.1`}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                )}
                <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-cream">
                  {it.kind === "youtube" ? (
                    <Video className="h-3 w-3" />
                  ) : (
                    <Film className="h-3 w-3" />
                  )}
                  {it.kind === "youtube" ? "YouTube" : "File"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1 p-2">
                <button
                  type="button"
                  onClick={() => move(idx, -1)}
                  disabled={busy || idx === 0}
                  aria-label="Move earlier"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-tan/20 text-cream transition-colors hover:border-maroon disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, 1)}
                  disabled={busy || idx === items.length - 1}
                  aria-label="Move later"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-tan/20 text-cream transition-colors hover:border-maroon disabled:opacity-30"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(it.id)}
                  disabled={busy}
                  aria-label="Delete"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-400/40 text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={videoRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/ogg,video/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const f = e.target.files
          if (f && f.length) onUpload(f)
        }}
      />
    </div>
  )
}

export { AdminDashboard }
