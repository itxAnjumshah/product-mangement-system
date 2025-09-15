import { Link, NavLink, Outlet } from 'react-router-dom'
import { getStoredScheme, setScheme, type Scheme } from '../lib/theme'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function Layout() {
  const [scheme, setLocalScheme] = useState<Scheme>('system')

  useEffect(() => {
    setLocalScheme(getStoredScheme())
  }, [])

  function cycleScheme() {
    const order: Scheme[] = ['light', 'dark', 'system']
    const next = order[(order.indexOf(scheme) + 1) % order.length]
    setLocalScheme(next)
    setScheme(next)
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950">
      <header className="sticky top-0 z-10 border-b border-white/20 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/40 dark:border-white/10 dark:bg-gray-900/60">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow"></div>
              <span className="text-lg font-semibold">Product Manager</span>
            </Link>
            <div className="flex items-center gap-1">
              <nav className="hidden items-center gap-1 sm:flex">
                <NavLink to="/" end className={({ isActive }) => `btn-secondary ${isActive ? '!bg-gray-100 dark:!bg-gray-800' : ''}`}>Products</NavLink>
                <NavLink to="/categories" className={({ isActive }) => `btn-secondary ${isActive ? '!bg-gray-100 dark:!bg-gray-800' : ''}`}>Categories</NavLink>
              </nav>
              <Button variant="outline" className="ml-1" onClick={cycleScheme} title="Toggle theme">
                {scheme === 'light' ? '☀️' : scheme === 'dark' ? '🌙' : '🖥️'}
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <footer className="mt-10 border-t border-black/5 py-6 text-center text-xs text-gray-500">Built with React + Tailwind</footer>
    </div>
  )
}
