import { useEffect, useRef, useState } from "react"
import { Upload, Trash2, LogOut, Loader2, ImageIcon } from "lucide-react"

import {
  fetchGalleryPhotos,
  uploadGalleryPhotos,
  deleteGalleryPhoto,
  type GalleryPhoto,
} from "@/lib/gallery-api"

// Remembers the password for the session only (cleared when the tab closes).
const PW_KEY = "gc-gallery-pw"

const GalleryAdmin: React.FC = () => {
  const [password, setPassword] = useState<string>(
    () => sessionStorage.getItem(PW_KEY) ?? ""
  )
  const [authed, setAuthed] = useState<boolean>(
    () => !!sessionStorage.getItem(PW_KEY)
  )
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const loadPhotos = () => {
    setLoading(true)
    fetchGalleryPhotos()
      .then(setPhotos)
      .catch(() => setError("Couldn't load photos from the server."))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadPhotos()
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return
    sessionStorage.setItem(PW_KEY, password)
    setAuthed(true)
  }

  const handleLogout = () => {
    sessionStorage.removeItem(PW_KEY)
    setPassword("")
    setAuthed(false)
  }

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      const { photos: next, errors } = await uploadGalleryPhotos(files, password)
      setPhotos(next)
      setNotice(
        errors.length
          ? `Uploaded with ${errors.length} skipped: ${errors.join("; ")}`
          : `Uploaded ${files.length} photo${files.length > 1 ? "s" : ""}.`
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed"
      setError(msg)
      if (msg === "Wrong password") handleLogout()
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const handleDelete = async (name: string) => {
    if (!confirm("Delete this photo? This can't be undone.")) return
    setBusy(true)
    setError(null)
    try {
      setPhotos(await deleteGalleryPhoto(name, password))
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Delete failed"
      setError(msg)
      if (msg === "Wrong password") handleLogout()
    } finally {
      setBusy(false)
    }
  }

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-maroon-dark px-6 text-cream">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-2xl border border-tan/15 bg-white/5 p-8 backdrop-blur"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.4em] text-maroon">
            Genesis Creations
          </p>
          <h1 className="mb-6 text-2xl font-semibold">Gallery Admin</h1>
          <label className="mb-2 block text-sm text-cream/70" htmlFor="pw">
            Password
          </label>
          <input
            id="pw"
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 w-full rounded-lg border border-tan/20 bg-maroon-dark/60 px-4 py-3 text-cream outline-none focus:border-maroon"
            placeholder="Enter admin password"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-maroon px-6 py-3 font-medium text-cream transition-transform hover:scale-[1.02]"
          >
            Sign in
          </button>
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </form>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-maroon-dark px-6 py-16 text-cream">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-maroon">
              Genesis Creations
            </p>
            <h1 className="text-3xl font-semibold md:text-4xl">Gallery Admin</h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-tan/20 px-4 py-2 text-sm text-cream/80 transition-colors hover:bg-white/5"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>

        {/* Upload zone */}
        <label
          className={`mb-6 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-tan/25 bg-white/5 px-6 py-12 text-center transition-colors hover:border-maroon ${
            busy ? "pointer-events-none opacity-60" : ""
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          {busy ? (
            <Loader2 className="h-8 w-8 animate-spin text-maroon" />
          ) : (
            <Upload className="h-8 w-8 text-maroon" />
          )}
          <span className="text-lg font-medium">
            {busy ? "Working…" : "Click to upload photos"}
          </span>
          <span className="text-sm text-cream/60">
            JPG, PNG, WebP or GIF · up to 15 MB each · select multiple at once
          </span>
        </label>

        {error && (
          <p className="mb-4 rounded-lg bg-red-500/15 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}
        {notice && (
          <p className="mb-4 rounded-lg bg-maroon/15 px-4 py-3 text-sm text-cream">
            {notice}
          </p>
        )}

        <div className="mb-4 flex items-center gap-2 text-sm text-cream/60">
          <ImageIcon className="h-4 w-4" />
          {loading ? "Loading…" : `${photos.length} photo${photos.length === 1 ? "" : "s"} in the gallery`}
        </div>

        {/* Current photos */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((p) => (
            <div
              key={p.name}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-white/10"
            >
              <img
                src={p.url}
                alt={p.name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleDelete(p.name)}
                disabled={busy}
                aria-label={`Delete ${p.name}`}
                className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100 disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {!loading && photos.length === 0 && (
          <p className="mt-12 text-center text-cream/50">
            No photos yet. Upload some above to get started.
          </p>
        )}
      </div>
    </main>
  )
}

export { GalleryAdmin }
