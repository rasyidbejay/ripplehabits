import { NavLink } from 'react-router-dom'
import { desktopNavItems } from './navItems'
import { ThemeSwitcher } from './ThemeSwitcher'

export const DesktopNav = () => {
  return (
    <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-8 py-4">
      <div className="flex min-w-0 items-center gap-5">
        <div className="rounded-2xl border border-accent/35 bg-accent-light/60 px-3 py-1.5">
          <p className="text-base font-semibold tracking-tight text-accent">Ripple</p>
        </div>
        <nav className="flex items-center gap-1.5">
          {desktopNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                [
                  'group flex min-h-11 items-center gap-2 rounded-xl px-3.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'border border-accent/25 bg-accent-light/70 text-accent shadow-[0_8px_20px_rgba(79,70,229,0.12)]'
                    : 'border border-transparent text-content-secondary hover:border-border hover:bg-surface-elevated hover:text-content-primary',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={[
                      'transition-all duration-200',
                      isActive ? 'active-icon text-accent' : 'text-content-muted group-hover:text-content-primary',
                    ].join(' ')}
                    width={17}
                    height={17}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
      <ThemeSwitcher />
    </div>
  )
}
