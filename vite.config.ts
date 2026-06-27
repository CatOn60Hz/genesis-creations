import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // `npm run dev:https` (mode "https") serves over a self-signed cert so phone
  // sensor APIs that need a secure context — e.g. the projector screen's
  // deviceorientation tilt — fire during local testing. Plain `npm run dev`
  // stays HTTP (faster, no cert warning).
  plugins: [react(), tailwindcss(), ...(mode === "https" ? [basicSsl()] : [])],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    // Scan only the app's real entry. By default Vite globs every *.html in the
    // project, which made it crawl into venv_bg/ (a Python/Gradio virtualenv)
    // and fail on a Gradio template's unresolved `virtual:cc-init` import.
    entries: ["index.html"],
  },
}))
