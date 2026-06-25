import { useEffect, useRef, useState } from "react"
import {
  Megaphone,
  CalendarDays,
  Images,
  Projector,
  Upload,
  Trash2,
  LogOut,
  Loader2,
  Plus,
  Save,
  Pencil,
  Star,
} from "lucide-react"

import {
  fetchAnnouncement,
  saveAnnouncement,
  type Announcement,
  fetchWorkshops,
  saveWorkshop,
  deleteWorkshop,
  type Workshop,
  type WorkshopSession,
  fetchProjectorImages,
  uploadProjectorImages,
  deleteProjectorImage,
  featureProjectorImage,
} from "@/lib/cms-api"
import {
  fetchGalleryPhotos,
  uploadGalleryPhotos,
  deleteGalleryPhoto,
} from "@/lib/gallery-api"

const PW_KEY = "gc-admin-pw"

type Tab = "announcement" | "workshops" | "gallery" | "projector"
type Img = { name: string; url: string }

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "announcement", label: "Announcement", icon: <Megaphone className="h-4 w-4" /> },
  { id: "workshops", label: "Workshops", icon: <CalendarDays className="h-4 w-4" /> },
  { id: "gallery", label: "Gallery", icon: <Images className="h-4 w-4" /> },
  { id: "projector", label: "Home Screen Photos", icon: <Projector className="h-4 w-4" /> },
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
  // Multi-line text inputs (one item / one session per line).
  learn: "",
  included: "",
  sessions: "",
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

// One item per non-empty line.
const parseList = (text: string): string[] =>
  text.split("\n").map((s) => s.trim()).filter(Boolean)

// One session per line: "City | Dates | Timing | Venue" (city required).
const parseSessions = (text: string): WorkshopSession[] =>
  text
    .split("\n")
    .map((line) => {
      const [city = "", dates = "", timing = "", venue = ""] = line
        .split("|")
        .map((s) => s.trim())
      return { city, dates, timing, venue }
    })
    .filter((s) => s.city)

const serializeSessions = (sessions?: WorkshopSession[]): string =>
  (sessions ?? [])
    .map((s) => [s.city, s.dates ?? "", s.timing ?? "", s.venue ?? ""].join(" | "))
    .join("\n")

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
  const fileRef = useRef<HTMLInputElement>(null)

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
          sessions: parseSessions(form.sessions),
          learn: parseList(form.learn),
          included: parseList(form.included),
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
      learn: (w.learn ?? []).join("\n"),
      included: (w.included ?? []).join("\n"),
      sessions: serializeSessions(w.sessions),
    })
    setCustomIcon(!!w.icon && !ICON_OPTIONS.some((o) => o.value === w.icon))
    setBanner(undefined)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const remove = async (id: string) => {
    if (!confirm("Delete this workshop?")) return
    setBusy(true)
    try {
      setItems(await deleteWorkshop(id, password))
      if (form.id === id) resetForm()
    } catch (e) {
      const m = e instanceof Error ? e.message : "Delete failed"
      setError(m)
      handleAuthErr(m)
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
        <textarea
          className={inputCls}
          rows={3}
          placeholder="Intro paragraph (description)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div>
          <label className="mb-1 block text-sm text-cream/70">
            Sessions — one per line:{" "}
            <span className="text-cream/50">City | Dates | Timing | Venue</span>
          </label>
          <textarea
            className={inputCls}
            rows={3}
            placeholder={"Chennai | July 16–18 | 10:00 AM – 4:00 PM | 340B/1A3B1, Vinayaka Avenue, Chennai 600097\nCoimbatore | July 27–29 | 10:00 AM – 4:00 PM | 34, Siruvani Main Rd, Coimbatore 641101"}
            value={form.sessions}
            onChange={(e) => setForm({ ...form, sessions: e.target.value })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-cream/70">
              What you'll learn — one per line
            </label>
            <textarea
              className={inputCls}
              rows={5}
              placeholder={"Drone theory & safety\nDGCA rules & regulations\nAerial cinematography"}
              value={form.learn}
              onChange={(e) => setForm({ ...form, learn: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-cream/70">
              What's included — one per line
            </label>
            <textarea
              className={inputCls}
              rows={5}
              placeholder={"3 days of intensive training\nDaily lunch & refreshments\nCompletion certificate"}
              value={form.included}
              onChange={(e) => setForm({ ...form, included: e.target.value })}
            />
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

      {/* List */}
      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-maroon" />
      ) : items.length === 0 ? (
        <p className="text-cream/50">No workshops yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((w) => (
            <div
              key={w.id}
              className="flex flex-col overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10"
            >
              {w.banner && (
                <img
                  src={w.banner.url}
                  alt={w.title}
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
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => edit(w)}
                    className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs hover:bg-white/20"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(w.id)}
                    className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs text-red-300 hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
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

  const doDelete = async (name: string) => {
    if (!confirm("Delete this image?")) return
    setBusy(true)
    try {
      setImages(await remove(name, password))
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
                  onClick={() => doDelete(p.name)}
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
    </div>
  )
}

/* ------------------------------ Dashboard ------------------------------- */

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
        <form
          onSubmit={login}
          className="w-full max-w-sm rounded-2xl border border-tan/15 bg-white/5 p-8 backdrop-blur"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.4em] text-maroon">
            Genesis Creations
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
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-maroon">
              Genesis Creations
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
          <ImageManager
            password={password}
            note="These photos play in the slideshow on the home page · hover a photo and tap ★ to make it appear first"
            list={fetchProjectorImages}
            upload={async (files, pw) => {
              const r = await uploadProjectorImages(files, pw)
              return { items: r.images, errors: r.errors }
            }}
            remove={deleteProjectorImage}
            onMakeFirst={featureProjectorImage}
            onAuthError={onAuthError}
          />
        )}
      </div>
    </main>
  )
}

export { AdminDashboard }
