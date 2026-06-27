import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'

const rootEl = document.getElementById('root')!

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
