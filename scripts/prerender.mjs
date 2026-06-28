// Build-time prerender: renders each static route to HTML so crawlers and AI
// agents that don't execute JavaScript still get full body content + correct
// per-route <head>. Runs in Node only (no browser), so it works on Hostinger's
// server build. See entry-server.tsx for the rendering side.
//
// Pipeline (see package.json "build"):
//   tsc -b  ->  vite build (client, produces dist/index.html template)
//           ->  vite build --ssr (produces .ssr-tmp/entry-server.js)
//           ->  node scripts/prerender.mjs   (this file)
//
// On the client the app uses createRoot (not hydrateRoot): the prerendered #root
// markup is replaced on first paint. That's intentional — it gives crawlers real
// content while keeping the existing CSR runtime, and the app-shell splash masks
// the swap. No hydration => no markup-mismatch fragility.

import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const dist = join(root, 'dist')
const ORIGIN = 'https://genesiskreationsmedia.com'

// Per-route <head> data. Mirrors each page's <SEO> props (the source of truth
// for the runtime/CSR head); kept here because react-helmet-async doesn't
// populate its SSR context under React 19's concurrent prerender. If you change
// a page's <SEO> title/description, update it here too.
const ROUTES = {
  '/': {
    out: 'index.html',
    title: 'Genesis Kreations — Chennai Media House',
    description:
      'Genesis Kreations — Chennai media house: Media Academy, Digital Marketing, Production, Studio Rental and Broadcasting.',
  },
  '/about': {
    out: 'about.html',
    title: 'About Us - Genesis Kreations',
    description:
      'Learn more about Genesis Kreations, our vision, mission, and the founder behind our media production company and academy.',
  },
  '/services': {
    out: 'services.html',
    title: 'Services - Genesis Kreations',
    description:
      "Discover Genesis Kreations' services: Media Production, Studio Rental, Studio Production, and Live Broadcasting.",
  },
  '/academy': {
    out: 'academy.html',
    title: 'Media Academy - Genesis Kreations',
    description:
      'Join Genesis Kreations Media Academy for professional courses in photography, videography, graphic design, and video editing.',
  },
  '/digital-marketing': {
    out: 'digital-marketing.html',
    title: 'Digital Marketing - Genesis Kreations',
    description:
      "Build your brand online with Genesis Kreations' Digital Marketing services including self-branding, social media management, Google & Meta Ads, and content planning.",
  },
  '/workshops': {
    out: 'workshops.html',
    title: 'Workshops & Masterclasses - Genesis Kreations',
    description:
      'Join hands-on sessions led by working professionals in gimbal operation, drone flying, cinematography, photography, and more.',
  },
}

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Replace the content="" of a <meta name|property="key" ...> tag.
function setMeta(html, key, value) {
  const re = new RegExp(
    `(<meta\\s+(?:name|property)="${key.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}"\\s+content=")[^"]*(")`,
  )
  return html.replace(re, `$1${esc(value)}$2`)
}

const { render } = await import(pathToFileURL(join(root, '.ssr-tmp', 'entry-server.js')).href)
const template = readFileSync(join(dist, 'index.html'), 'utf8')

let count = 0
for (const [route, meta] of Object.entries(ROUTES)) {
  const body = await render(route)
  const canonical = route === '/' ? `${ORIGIN}/` : `${ORIGIN}${route}`

  let html = template
  // Body content into #root (empty in the template).
  html = html.replace('<div id="root"></div>', `<div id="root">${body}</div>`)
  // Per-route head.
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(meta.title)}</title>`)
  html = setMeta(html, 'description', meta.description)
  html = setMeta(html, 'og:title', meta.title)
  html = setMeta(html, 'og:description', meta.description)
  html = setMeta(html, 'og:url', canonical)
  html = setMeta(html, 'twitter:title', meta.title)
  html = setMeta(html, 'twitter:description', meta.description)
  html = setMeta(html, 'twitter:url', canonical)
  // Canonical link (not in the template; insert right after <title>).
  html = html.replace(
    /(<title>[^<]*<\/title>)/,
    `$1\n    <link rel="canonical" href="${canonical}" />`,
  )

  writeFileSync(join(dist, meta.out), html, 'utf8')
  count++
  console.log(`prerendered ${route.padEnd(20)} -> dist/${meta.out} (${body.length}b body)`)
}

// Clean up the throwaway SSR bundle so it never ships.
rmSync(join(root, '.ssr-tmp'), { recursive: true, force: true })
console.log(`\nPrerendered ${count} routes.`)
