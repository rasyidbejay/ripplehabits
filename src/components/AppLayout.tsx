import { NavLink, Outlet } from 'react-router-dom'
import { DesktopNav } from './DesktopNav'
import { MobileDock } from './MobileDock'
import { SettingsIcon } from './icons'

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-surface-primary text-content-primary">
      <header className="hidden border-b border-border/70 bg-surface-secondary/75 backdrop-blur-xl md:block">
        <DesktopNav />
      </header>

      <header
        className="sticky top-0 z-30 border-b border-border/70 bg-surface-primary/90 px-4 py-3 backdrop-blur-xl md:hidden"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-content-muted">Ripple</p>
            <h1 className="text-lg font-semibold tracking-tight text-content-primary">Habit Momentum</h1>
          </div>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              [
                'flex min-h-11 min-w-11 items-center justify-center rounded-xl border bg-surface-secondary transition',
                isActive ? 'border-accent/45 text-accent shadow-[0_0_0_3px_rgba(79,70,229,0.16)]' : 'border-border text-content-secondary',
              ].join(' ')
            }
          >
            <SettingsIcon width={19} height={19} />
          </NavLink>
        </div>
      </header>

      <main className="pb-28 md:pb-14">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <Outlet />
        </div>
      </main>

      <MobileDock />
    </div>
  )
}
