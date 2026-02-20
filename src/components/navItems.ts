import {
  BarChart3Icon,
  CalendarCheckIcon,
  CalendarIcon,
  HomeIcon,
  ListTodoIcon,
  SettingsIcon,
} from './icons'

export const primaryNavItems = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/today', label: 'Today', icon: CalendarCheckIcon },
  { to: '/habits', label: 'Habits', icon: ListTodoIcon },
  { to: '/calendar', label: 'Calendar', icon: CalendarIcon },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3Icon },
] as const

export const desktopNavItems = [...primaryNavItems, { to: '/settings', label: 'Settings', icon: SettingsIcon }] as const
