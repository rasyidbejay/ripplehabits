import { NavLink } from 'react-router-dom'
import { primaryNavItems } from './navItems'

export const MobileDock = () => (
  <nav className="liquid-glass-dock md:hidden">
    <ul className="flex items-stretch justify-around gap-1">
      {primaryNavItems.map(({ to, label, icon: Icon }) => (
        <li key={to} className="flex-1">
          <NavLink
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex min-h-12 flex-col items-center justify-center rounded-2xl border px-1.5 py-1 text-[10px] font-semibold transition ${
                isActive ? 'border-accent/30 bg-accent-light/70 text-accent' : 'border-transparent text-content-muted'
              }`
            }
          >
            <Icon width={19} height={19} />
            <span className="mt-1">{label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
)
