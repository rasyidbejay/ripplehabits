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
                  'flex min-h-12 flex-col items-center justify-center rounded-2xl border px-1.5 py-1 text-[10px] font-semibold tracking-wide transition-all duration-200',
                  isActive
                    ? 'border-accent/25 bg-accent-light/70 text-accent shadow-[0_8px_18px_rgba(79,70,229,0.16)]'
                    : 'border-transparent text-content-muted',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={[
                      'transition-all duration-200',
                      isActive ? 'active-icon text-accent' : 'text-content-muted',
                    ].join(' ')}
                    width={20}
                    height={20}
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
