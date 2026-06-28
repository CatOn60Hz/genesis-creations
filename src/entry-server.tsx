import { prerender } from 'react-dom/static'
import { StaticRouter } from 'react-router'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'

// Server entry used only at build time by scripts/prerender.mjs to render each
// static route's body HTML. Never shipped to the browser. Uses React 19's
// react-dom/static `prerender`, which resolves all Suspense (including the
// lazy-loaded route chunks) before returning complete HTML.
//
// We only extract the rendered <body> markup here; per-route <head> tags are
// applied by the prerender script from its own meta map. (react-helmet-async
// doesn't populate its SSR context under React 19's concurrent prerender, so
// the HelmetProvider is present only to satisfy <Helmet>'s context requirement
// during render — its output is intentionally unused.)
export async function render(url: string): Promise<string> {
  const { prelude } = await prerender(
    <HelmetProvider>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </HelmetProvider>,
  )
  return streamToString(prelude)
}

async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let out = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    out += decoder.decode(value, { stream: true })
  }
  return out + decoder.decode()
}
