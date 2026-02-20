import { NavLink, Outlet } from 'react-router-dom'
import { OnboardingModal } from './OnboardingModal'
import { useUserPreferences } from '../hooks/useUserPreferences'

const navItems = [
  { to: '/', label: 'Today' },
  { to: '/habits', label: 'Habits' },
  { to: '/insights', label: 'Insights' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/settings', label: 'Settings' },
]

export const Layout = () => {
  const { shouldShowOnboarding, savePreferences } = useUserPreferences()
  const defaultTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

  return (
    <div className="min-h-screen bg-surface-tertiary text-content-primary">
      <header className="border-b border-border bg-surface-secondary/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Ripple</p>
            <h1 className="text-lg font-semibold">Habit Tracker</h1>
          </div>
          <nav className="flex gap-2 rounded-full bg-surface-tertiary p-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }: { isActive: boolean }) =>
                  [
                    'rounded-full px-4 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-content-secondary hover:text-content-primary',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      <OnboardingModal
        open={shouldShowOnboarding}
        defaultTimezone={defaultTimezone}
        onSave={savePreferences}
      />
    </div>
  )
}
