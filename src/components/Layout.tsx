import { NavLink, Outlet } from 'react-router-dom'
import { OnboardingModal } from './OnboardingModal'
import { useUserPreferences } from '../hooks/useUserPreferences'

const navItems = [
  { to: '/', label: 'Habits' },
  { to: '/insights', label: 'Insights' },
  { to: '/settings', label: 'Settings' },
]

export const Layout = () => {
  const { shouldShowOnboarding, savePreferences } = useUserPreferences()
  const defaultTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Ripple</p>
            <h1 className="text-lg font-semibold">Habit Tracker</h1>
          </div>
          <nav className="flex gap-2 rounded-full bg-slate-100 p-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }: { isActive: boolean }) =>
                  [
                    'rounded-full px-4 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900',
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
