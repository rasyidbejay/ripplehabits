import { NavLink } from 'react-router-dom'
import { desktopNavItems } from './navItems'
import { ThemeSwitcher } from './ThemeSwitcher'

export const DesktopNav = () => {
  return (
    <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
      <div className="flex items-center gap-4">
        <p className="text-xl font-semibold tracking-tight text-accent">Ripple</p>
        <nav className="hidden items-center gap-2 lg:flex">
          {desktopNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                [
                  'flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-accent/15 text-accent'
                    : 'text-content-secondary hover:bg-surface-tertiary hover:text-content-primary',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={[
                      'transition-all duration-200',
                      isActive
                        ? 'active-icon fill-accent/20 text-accent'
                        : 'text-content-muted',
                    ].join(' ')}
                    width={18}
                    height={18}
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
