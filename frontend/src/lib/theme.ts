const STORAGE_KEY = 'theme:color-scheme'

type Scheme = 'light' | 'dark' | 'system'

export function getStoredScheme(): Scheme {
  const v = localStorage.getItem(STORAGE_KEY) as Scheme | null
  return v || 'system'
}

export function applyScheme(scheme: Scheme) {
  const root = document.documentElement
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = scheme === 'dark' || (scheme === 'system' && prefersDark)
  root.classList.toggle('dark', isDark)
}

export function setScheme(scheme: Scheme) {
  localStorage.setItem(STORAGE_KEY, scheme)
  applyScheme(scheme)
}

export function initTheme() {
  applyScheme(getStoredScheme())
}

export type { Scheme }

