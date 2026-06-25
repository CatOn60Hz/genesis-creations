// Client for the Genesis Creations CMS backend (public/api/*.php): announcement,
// workshops and projector images.
//
// Same origin in production; override in dev via VITE_API_BASE in a .env file,
// e.g. VITE_API_BASE=https://genesiscreations.in/api

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
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" })
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

/* ------------------------------- Workshops ------------------------------ */

export type Workshop = {
  id: string
  title: string
  description: string
  date: string
  location: string
  banner: { name: string; url: string } | null
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

/* ------------------------------- Projector ------------------------------ */

export type ProjectorImage = { name: string; url: string }

export async function fetchProjectorImages(): Promise<ProjectorImage[]> {
  const data = await getJSON<{ images: ProjectorImage[] }>(
    "/projector/list.php"
  )
  return (data.images ?? []).map((i) => ({ ...i, url: abs(i.url) }))
}

export async function uploadProjectorImages(
  files: FileList | File[],
  password: string
): Promise<{ images: ProjectorImage[]; errors: string[] }> {
  const form = new FormData()
  Array.from(files).forEach((f) => form.append("photos[]", f))
  const res = await fetch(`${API_BASE}/projector/upload.php`, {
    method: "POST",
    headers: { "X-Gallery-Password": password },
    body: form,
  })
  if (res.status === 401) throw new Error("Wrong password")
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
  const data = await res.json()
  return {
    images: (data.images ?? []).map((i: ProjectorImage) => ({
      ...i,
      url: abs(i.url),
    })),
    errors: data.errors ?? [],
  }
}

export async function deleteProjectorImage(
  name: string,
  password: string
): Promise<ProjectorImage[]> {
  const data = await postForm<{ images: ProjectorImage[] }>(
    "/projector/delete.php",
    { name },
    password
  )
  return (data.images ?? []).map((i) => ({ ...i, url: abs(i.url) }))
}
