import { NavLink } from 'react-router-dom'
import { primaryNavItems } from './navItems'

type MobileDockProps = {
  className?: string
}

export const MobileDock = ({ className = '' }: MobileDockProps) => {
  return (
    <nav className={`liquid-glass-dock md:hidden ${className}`}>
      <ul className="flex items-stretch justify-around gap-1">
        {primaryNavItems.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                [
                  'flex min-h-11 flex-col items-center justify-center rounded-2xl px-2 py-1 text-[10px] font-medium tracking-wide transition-all duration-200',
                  isActive
                    ? 'scale-105 text-accent'
                    : 'text-content-muted hover:text-content-primary',
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
                    width={22}
                    height={22}
                  />
                  <span className="mt-1 leading-none">{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
