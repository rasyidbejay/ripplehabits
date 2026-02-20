import type { ComponentType, SVGProps } from 'react'
import {
  BarChart3Icon,
  CalendarDaysIcon,
  CircleCheckBigIcon,
  HouseIcon,
  RepeatIcon,
  SettingsIcon,
} from './icons'

type NavItem = {
  to: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

export const primaryNavItems: NavItem[] = [
  { to: '/', label: 'Home', icon: HouseIcon },
  { to: '/today', label: 'Today', icon: CircleCheckBigIcon },
  { to: '/habits', label: 'Habits', icon: RepeatIcon },
  { to: '/calendar', label: 'Calendar', icon: CalendarDaysIcon },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3Icon },
]

export const desktopNavItems: NavItem[] = [
  ...primaryNavItems,
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]
