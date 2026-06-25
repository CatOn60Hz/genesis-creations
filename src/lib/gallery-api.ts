// Client for the Hostinger PHP gallery backend (public/api/gallery/*.php).
//
// In production the site and the API share an origin, so the default
// "/api/gallery" works. For local dev, point at the live API by setting
// VITE_GALLERY_API in a .env file, e.g.
//   VITE_GALLERY_API=https://genesiscreations.in/api/gallery

export type GalleryPhoto = { name: string; url: string }

const API_BASE = (
  (import.meta.env.VITE_GALLERY_API as string | undefined) || "/api/gallery"
).replace(/\/$/, "")

// When the API base is a full URL (dev pointing at the live server), the photo
// URLs come back root-relative ("/uploads/..."); make them absolute so the
// <img> tags load from the live server rather than the dev origin.
const API_ORIGIN = /^https?:\/\//.test(API_BASE) ? new URL(API_BASE).origin : ""

function absolutize(photos: GalleryPhoto[]): GalleryPhoto[] {
  if (!API_ORIGIN) return photos
  return photos.map((p) =>
    p.url.startsWith("/") ? { ...p, url: API_ORIGIN + p.url } : p
  )
}

export async function fetchGalleryPhotos(): Promise<GalleryPhoto[]> {
  const res = await fetch(`${API_BASE}/list.php`)
  if (!res.ok) throw new Error(`List failed: ${res.status}`)
  const data = await res.json()
  return absolutize(data.photos ?? [])
}

export async function uploadGalleryPhotos(
  files: FileList | File[],
  password: string
): Promise<{ photos: GalleryPhoto[]; errors: string[] }> {
  const form = new FormData()
  Array.from(files).forEach((f) => form.append("photos[]", f))
  const res = await fetch(`${API_BASE}/upload.php`, {
    method: "POST",
    headers: { "X-Gallery-Password": password },
    body: form,
  })
  if (res.status === 401) throw new Error("Wrong password")
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
  const data = await res.json()
  return { photos: absolutize(data.photos ?? []), errors: data.errors ?? [] }
}

export async function deleteGalleryPhoto(
  name: string,
  password: string
): Promise<GalleryPhoto[]> {
  const form = new FormData()
  form.append("name", name)
  const res = await fetch(`${API_BASE}/delete.php`, {
    method: "POST",
    headers: { "X-Gallery-Password": password },
    body: form,
  })
  if (res.status === 401) throw new Error("Wrong password")
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`)
  const data = await res.json()
  return absolutize(data.photos ?? [])
}
