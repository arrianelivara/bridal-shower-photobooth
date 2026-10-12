/** Resolve a file from `public/` against Vite's configured base path. */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL
  const clean = path.replace(/^\//, '')
  return `${base}${clean}`
}
