import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { DesktopNav } from './DesktopNav'
import { MobileDock } from './MobileDock'
import { SettingsIcon } from './icons'

const TITLES: Record<string, string> = {
  '/': 'Home',
  '/today': 'Today',
  '/habits': 'Habits',
  '/calendar': 'Calendar',
  '/dashboard': 'Dashboard',
  '/settings': 'Settings',
}

export const AppLayout = () => {
  const location = useLocation()
  const title = TITLES[location.pathname] ?? 'Ripple'

  return (
    <div className="min-h-screen bg-surface-primary text-content-primary">
      <header className="hidden border-b border-border/80 bg-surface-secondary/85 backdrop-blur md:block">
        <DesktopNav />
      </header>

      <header className="sticky top-0 z-30 border-b border-border/70 bg-surface-primary/90 px-4 py-3 backdrop-blur md:hidden" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-content-muted">Ripple</p>
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
          <NavLink to="/settings" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border bg-surface-secondary">
            <SettingsIcon width={18} height={18} />
          </NavLink>
        </div>
      </header>

      <main className="pb-28 md:pb-12">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>
      <MobileDock />
    </div>
  )
}
