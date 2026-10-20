/** Public files under `public/` — respects Vite `base` (Netlify `/`, GitHub Pages `./`). */
export function publicUrl(path: string): string {
  const base = import.meta.env.BASE_URL
  const clean = path.replace(/^\//, '')
  return `${base}${clean}`
}
