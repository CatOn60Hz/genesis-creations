// Client for the Genesis Kreations CMS backend (public/api/*.php): announcement,
// workshops and projector images.
//
// Same origin in production; override in dev via VITE_API_BASE in a .env file,
// e.g. VITE_API_BASE=https://genesiskreationsmedia.com/api

const API_BASE = (
  (import.meta.env.VITE_API_BASE as string | undefined) || "/api"
).replace(/\/$/, "")

const API_ORIGIN = /^https?:\/\//.test(API_BASE) ? new URL(API_BASE).origin : ""

// Make root-relative upload URLs absolute when hitting a remote API in dev.
function abs(url: string | null | undefined): string {
  if (!url) return ""
  return API_ORIGIN && url.startsWith("/") ? API_ORIGIN + url : url
}

async function getJSON<T>(path: string): Promise<T> {
  // `t=` busts any server/proxy (LiteSpeed) cache so GETs are always fresh.
  const sep = path.includes("?") ? "&" : "?"
  const res = await fetch(`${API_BASE}${path}${sep}t=${Date.now()}`, {
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

async function postForm<T>(
  path: string,
  fields: Record<string, string | Blob | undefined>,
  password: string
): Promise<T> {
  const form = new FormData()
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined) form.append(k, v)
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "X-Gallery-Password": password },
    body: form,
  })
  if (res.status === 401) throw new Error("Wrong password")
  if (!res.ok) {
    let msg = `Request failed: ${res.status}`
    try {
      const data = await res.json()
      if (data?.error) msg = data.error
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  return res.json()
}

/* ----------------------------- Announcement ----------------------------- */

export type Announcement = {
  enabled: boolean
  text: string
  ctaLabel: string
  ctaHref: string
}

export function fetchAnnouncement(): Promise<Announcement> {
  return getJSON<Announcement>("/announcement/get.php")
}

export function saveAnnouncement(
  a: Announcement,
  password: string
): Promise<Announcement> {
  return postForm<Announcement>(
    "/announcement/save.php",
    {
      enabled: a.enabled ? "1" : "0",
      text: a.text,
      ctaLabel: a.ctaLabel,
      ctaHref: a.ctaHref,
    },
    password
  )
}

/* ------------------------------ Testimonials ---------------------------- */

export type Testimonial = {
  id: string
  quote: string
  author: string
  role?: string
  image: { name: string; url: string } | null
  order?: number
  createdAt?: string
  updatedAt?: string
}

function normalizeTestimonial(t: Testimonial): Testimonial {
  return t.image ? { ...t, image: { ...t.image, url: abs(t.image.url) } } : t
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const data = await getJSON<{ testimonials: Testimonial[] }>(
    "/testimonials/list.php"
  )
  return (data.testimonials ?? []).map(normalizeTestimonial)
}

export async function saveTestimonial(
  fields: {
    id?: string
    quote: string
    author: string
    role?: string
    image?: File
  },
  password: string
): Promise<Testimonial[]> {
  const data = await postForm<{ testimonials: Testimonial[] }>(
    "/testimonials/save.php",
    {
      id: fields.id ?? "",
      quote: fields.quote,
      author: fields.author,
      role: fields.role ?? "",
      image: fields.image,
    },
    password
  )
  return (data.testimonials ?? []).map(normalizeTestimonial)
}

export async function deleteTestimonial(
  id: string,
  password: string
): Promise<Testimonial[]> {
  const data = await postForm<{ testimonials: Testimonial[] }>(
    "/testimonials/delete.php",
    { id },
    password
  )
  return (data.testimonials ?? []).map(normalizeTestimonial)
}

export async function reorderTestimonials(
  order: string[],
  password: string
): Promise<Testimonial[]> {
  const data = await postForm<{ testimonials: Testimonial[] }>(
    "/testimonials/reorder.php",
    { order: JSON.stringify(order) },
    password
  )
  return (data.testimonials ?? []).map(normalizeTestimonial)
}

/* ----------------------- Certification courses -------------------------- */

// Kinds map to the animated course icons (see animated-course-icon.tsx). Kept
// as a string union here to avoid coupling the API client to a UI component.
export type CertCourseKind =
  | "diploma"
  | "photography"
  | "videography"
  | "graphic-design"
  | "video-editing"
  | "drone"
  | "live-sound"
  | "studio-recording"

export type CourseModule = { title: string; items: string[] }

export type CertCourse = {
  id: string
  kind: CertCourseKind
  title: string
  subtitle: string
  why: string
  duration: string
  schedule: string
  format: string
  certification: string
  badge?: string
  who: string
  learn?: string[]
  modules?: CourseModule[]
  choose: string[]
  careers?: string[]
  order?: number
  createdAt?: string
  updatedAt?: string
}

export async function fetchCertCourses(): Promise<CertCourse[]> {
  const data = await getJSON<{ courses: CertCourse[] }>("/courses/list.php")
  return data.courses ?? []
}

export async function saveCertCourse(
  fields: {
    id?: string
    kind: CertCourseKind
    title: string
    subtitle: string
    why: string
    duration: string
    schedule: string
    format: string
    certification: string
    badge?: string
    who: string
    learn?: string[]
    modules?: CourseModule[]
    choose: string[]
    careers?: string[]
  },
  password: string
): Promise<CertCourse[]> {
  const data = await postForm<{ courses: CertCourse[] }>(
    "/courses/save.php",
    {
      id: fields.id ?? "",
      kind: fields.kind,
      title: fields.title,
      subtitle: fields.subtitle,
      why: fields.why,
      duration: fields.duration,
      schedule: fields.schedule,
      format: fields.format,
      certification: fields.certification,
      badge: fields.badge ?? "",
      who: fields.who,
      // Lists/objects travel as JSON strings (FormData is flat).
      learn: JSON.stringify(fields.learn ?? []),
      modules: JSON.stringify(fields.modules ?? []),
      choose: JSON.stringify(fields.choose ?? []),
      careers: JSON.stringify(fields.careers ?? []),
    },
    password
  )
  return data.courses ?? []
}

export async function deleteCertCourse(
  id: string,
  password: string
): Promise<CertCourse[]> {
  const data = await postForm<{ courses: CertCourse[] }>(
    "/courses/delete.php",
    { id },
    password
  )
  return data.courses ?? []
}

export async function reorderCertCourses(
  order: string[],
  password: string
): Promise<CertCourse[]> {
  const data = await postForm<{ courses: CertCourse[] }>(
    "/courses/reorder.php",
    { order: JSON.stringify(order) },
    password
  )
  return data.courses ?? []
}

/* ---------------------------- Page backgrounds -------------------------- */

// Admin-editable hero/background images, keyed by a named page slot. Pages fall
// back to their bundled image when a slot is unset.
export type BackgroundSlot =
  | "academy"
  | "services"
  | "digital-marketing"
  | "about"
  | "workshops"

type BgImage = { name: string; url: string }

function backgroundsToUrls(
  bg: Record<string, BgImage> | undefined
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [slot, img] of Object.entries(bg ?? {})) {
    if (img?.url) out[slot] = abs(img.url)
  }
  return out
}

export async function fetchBackgrounds(): Promise<Record<string, string>> {
  const data = await getJSON<{ backgrounds: Record<string, BgImage> }>(
    "/backgrounds/list.php"
  )
  return backgroundsToUrls(data.backgrounds)
}

export async function setBackground(
  slot: BackgroundSlot,
  image: File,
  password: string
): Promise<Record<string, string>> {
  const data = await postForm<{ backgrounds: Record<string, BgImage> }>(
    "/backgrounds/set.php",
    { slot, image },
    password
  )
  return backgroundsToUrls(data.backgrounds)
}

export async function clearBackground(
  slot: BackgroundSlot,
  password: string
): Promise<Record<string, string>> {
  const data = await postForm<{ backgrounds: Record<string, BgImage> }>(
    "/backgrounds/delete.php",
    { slot },
    password
  )
  return backgroundsToUrls(data.backgrounds)
}

/* ------------------------------- Workshops ------------------------------ */

export type WorkshopSession = {
  city: string
  dates?: string
  timing?: string
  venue?: string
}

export type Workshop = {
  id: string
  title: string
  description: string
  date: string
  location: string
  banner: { name: string; url: string } | null
  // Rich card fields (all optional — older records render with sensible
  // fallbacks built from title/description/date/location).
  tagline?: string
  badge?: string
  icon?: string
  registerUrl?: string
  note?: string
  sessions?: WorkshopSession[]
  learn?: string[]
  included?: string[]
  createdAt?: string
  updatedAt?: string
}

function normalizeWorkshop(w: Workshop): Workshop {
  return w.banner ? { ...w, banner: { ...w.banner, url: abs(w.banner.url) } } : w
}

export async function fetchWorkshops(): Promise<Workshop[]> {
  const data = await getJSON<{ workshops: Workshop[] }>("/workshops/list.php")
  return (data.workshops ?? []).map(normalizeWorkshop)
}

export async function saveWorkshop(
  fields: {
    id?: string
    title: string
    description: string
    date: string
    location: string
    tagline?: string
    badge?: string
    icon?: string
    registerUrl?: string
    note?: string
    sessions?: WorkshopSession[]
    learn?: string[]
    included?: string[]
    banner?: File
  },
  password: string
): Promise<Workshop[]> {
  const data = await postForm<{ workshops: Workshop[] }>(
    "/workshops/save.php",
    {
      id: fields.id ?? "",
      title: fields.title,
      description: fields.description,
      date: fields.date,
      location: fields.location,
      tagline: fields.tagline ?? "",
      badge: fields.badge ?? "",
      icon: fields.icon ?? "",
      registerUrl: fields.registerUrl ?? "",
      note: fields.note ?? "",
      // Lists/objects travel as JSON strings (FormData is flat).
      sessions: JSON.stringify(fields.sessions ?? []),
      learn: JSON.stringify(fields.learn ?? []),
      included: JSON.stringify(fields.included ?? []),
      banner: fields.banner,
    },
    password
  )
  return (data.workshops ?? []).map(normalizeWorkshop)
}

export async function deleteWorkshop(
  id: string,
  password: string
): Promise<Workshop[]> {
  const data = await postForm<{ workshops: Workshop[] }>(
    "/workshops/delete.php",
    { id },
    password
  )
  return (data.workshops ?? []).map(normalizeWorkshop)
}

/* --------------------- Home "Workshops & Courses" list ------------------ */

export type HomeCourseKind = "gimbal" | "drone" | "aerial" | "clapper" | "camera"

export type HomeCourse = {
  id: string
  kind: HomeCourseKind
  title: string
  text: string
  order?: number
  createdAt?: string
  updatedAt?: string
}

export async function fetchHomeCourses(): Promise<HomeCourse[]> {
  const data = await getJSON<{ courses: HomeCourse[] }>("/home-courses/list.php")
  return data.courses ?? []
}

export async function saveHomeCourse(
  fields: { id?: string; kind: HomeCourseKind; title: string; text: string },
  password: string
): Promise<HomeCourse[]> {
  const data = await postForm<{ courses: HomeCourse[] }>(
    "/home-courses/save.php",
    {
      id: fields.id ?? "",
      kind: fields.kind,
      title: fields.title,
      text: fields.text,
    },
    password
  )
  return data.courses ?? []
}

export async function deleteHomeCourse(
  id: string,
  password: string
): Promise<HomeCourse[]> {
  const data = await postForm<{ courses: HomeCourse[] }>(
    "/home-courses/delete.php",
    { id },
    password
  )
  return data.courses ?? []
}

export async function reorderHomeCourses(
  order: string[],
  password: string
): Promise<HomeCourse[]> {
  const data = await postForm<{ courses: HomeCourse[] }>(
    "/home-courses/reorder.php",
    { order: JSON.stringify(order) },
    password
  )
  return data.courses ?? []
}

/* ------------------------- Home-screen slideshow ------------------------ */

// Photos and videos share one ordered slideshow ("projector"). Items carry a
// type so the home screen knows whether to render an <img> or a <video>.
export type ProjectorItem = { name: string; type: "photo" | "video"; url: string }

function absItems(items: ProjectorItem[]): ProjectorItem[] {
  return (items ?? []).map((i) => ({ ...i, url: abs(i.url) }))
}

export async function fetchProjectorItems(): Promise<ProjectorItem[]> {
  const data = await getJSON<{ items: ProjectorItem[] }>("/projector/list.php")
  return absItems(data.items ?? [])
}

async function uploadProjectorMedia(
  endpoint: string,
  field: string,
  files: FileList | File[],
  password: string
): Promise<{ items: ProjectorItem[]; errors: string[] }> {
  const form = new FormData()
  Array.from(files).forEach((f) => form.append(field, f))
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "X-Gallery-Password": password },
    body: form,
  })
  if (res.status === 401) throw new Error("Wrong password")
  if (!res.ok) {
    let msg = `Upload failed: ${res.status}`
    try {
      const d = await res.json()
      if (d?.error) msg = d.error
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  const data = await res.json()
  return { items: absItems(data.items ?? []), errors: data.errors ?? [] }
}

export function uploadProjectorImages(
  files: FileList | File[],
  password: string
): Promise<{ items: ProjectorItem[]; errors: string[] }> {
  return uploadProjectorMedia("/projector/upload.php", "photos[]", files, password)
}

export function uploadProjectorVideos(
  files: FileList | File[],
  password: string
): Promise<{ items: ProjectorItem[]; errors: string[] }> {
  return uploadProjectorMedia(
    "/projector/upload-video.php",
    "videos[]",
    files,
    password
  )
}

export async function deleteProjectorItem(
  name: string,
  password: string
): Promise<ProjectorItem[]> {
  const data = await postForm<{ items: ProjectorItem[] }>(
    "/projector/delete.php",
    { name },
    password
  )
  return absItems(data.items ?? [])
}

// Save the full display order (array of item filenames, in order).
export async function reorderProjector(
  order: string[],
  password: string
): Promise<ProjectorItem[]> {
  const data = await postForm<{ items: ProjectorItem[] }>(
    "/projector/reorder.php",
    { order: JSON.stringify(order) },
    password
  )
  return absItems(data.items ?? [])
}
