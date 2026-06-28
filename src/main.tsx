import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'

const rootEl = document.getElementById('root')!

// The static/prerendered HTML carries SEO tags (description, canonical, og:*,
// twitter:*) marked data-prerendered-seo so crawlers see them without JS. Once
// the SPA boots, the <SEO> component (react-helmet-async) renders its own copies
// — and React 19 hoists those natively without deduping against ours — so we
// remove the prerendered ones here to avoid duplicate meta/canonical tags.
document
  .querySelectorAll('head [data-prerendered-seo]')
  .forEach((el) => el.remove())

// Fade out and remove the static app-shell splash (see index.html) once React
// has painted its first content into #root.
function hideSplash() {
  const splash = document.getElementById('app-splash')
  if (!splash) return
  splash.classList.add('gc-hide')
  const remove = () => splash.remove()
  splash.addEventListener('transitionend', remove, { once: true })
  setTimeout(remove, 500) // fallback if transitionend doesn't fire
}

// Reveal the app on the first React commit (works whether the landing route is
// eager or a lazy/Suspense one), with a double rAF so it has actually painted.
const splashObserver = new MutationObserver(() => {
  if (rootEl.childElementCount > 0) {
    splashObserver.disconnect()
    requestAnimationFrame(() => requestAnimationFrame(hideSplash))
  }
})
splashObserver.observe(rootEl, { childList: true })
// Safety net: never let the splash get stuck if something goes wrong.
setTimeout(hideSplash, 8000)

createRoot(rootEl).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
