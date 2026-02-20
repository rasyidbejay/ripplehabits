import { NavLink, Outlet } from 'react-router-dom'
import { DesktopNav } from './DesktopNav'
import { MobileDock } from './MobileDock'
import { SettingsIcon } from './icons'

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-surface-primary text-content-primary">
      <header className="hidden border-b border-border/80 bg-surface-secondary/80 backdrop-blur md:block">
        <DesktopNav />
      </header>

      <header className="sticky top-0 z-20 border-b border-border/60 bg-surface-primary/90 px-4 py-3 backdrop-blur md:hidden" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-accent">Ripple</h1>
          <NavLink to="/settings" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border bg-surface-secondary text-content-secondary">
            <SettingsIcon className="h-5 w-5" />
          </NavLink>
        </div>
      </header>

      <main className="pb-28 md:pb-8">
        <div className="mx-auto w-full max-w-5xl px-4 py-5 md:px-6 md:py-8">
          <div className="rounded-3xl border border-border bg-surface-secondary p-4 shadow-sm md:p-6">
            <Outlet />
          </div>
        </div>
      </main>

      <MobileDock />
    </div>
  )
}
