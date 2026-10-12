import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages project sites need a repo subpath, e.g. `/photobooth/`.
// Local/dev defaults to `/`. CI sets BASE_PATH from the repository name.
const base = process.env.BASE_PATH || '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
})
