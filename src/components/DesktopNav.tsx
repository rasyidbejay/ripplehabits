import { NavLink } from 'react-router-dom'
import { ThemeSwitcher } from './ThemeSwitcher'
import { desktopNavItems } from './navItems'

export const DesktopNav = () => (
  <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
    <div className="flex items-center gap-6">
      <div className="rounded-2xl border border-accent/30 bg-accent-light/70 px-4 py-2">
        <p className="text-base font-semibold tracking-tight text-accent">Ripple</p>
      </div>
      <nav className="flex items-center gap-1.5">
        {desktopNavItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `group flex min-h-11 items-center gap-2 rounded-xl border px-3.5 text-sm font-medium transition ${
                isActive
                  ? 'border-accent/30 bg-accent-light/60 text-accent'
                  : 'border-transparent text-content-secondary hover:border-border hover:bg-surface-elevated'
              }`
            }
          >
            <Icon width={17} height={17} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
    <ThemeSwitcher />
  </div>
)
