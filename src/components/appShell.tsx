import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { ThemeSwitcher } from './ThemeSwitcher'
import { BarChart3Icon, CircleCheckBigIcon, RepeatIcon, SettingsIcon } from './icons'

const navItems = [
  { to: '/journal', label: 'Journal', icon: CircleCheckBigIcon },
  { to: '/habits', label: 'All Habits', icon: RepeatIcon },
  { to: '/progress', label: 'Progress', icon: BarChart3Icon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

const mobileTabs = [
  { to: '/journal', label: 'Journal', icon: CircleCheckBigIcon },
  { to: '/progress', label: 'Progress', icon: BarChart3Icon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

export const SidebarNavItem = ({ to, label, icon: Icon }: { to: string; label: string; icon: typeof CircleCheckBigIcon }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-accent-light text-accent' : 'text-content-secondary hover:bg-surface-tertiary'}`}
  >
    <Icon width={17} height={17} />
    {label}
  </NavLink>
)

export const AppSidebar = () => (
  <aside className="hidden w-64 shrink-0 border-r border-border bg-surface-secondary lg:flex lg:flex-col">
    <div className="border-b border-border px-5 py-5">
      <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Ripple</p>
      <p className="mt-1 text-lg font-semibold">Habit Journal</p>
    </div>
    <nav className="space-y-1 px-3 py-4">
      {navItems.map((item) => <SidebarNavItem key={item.to} {...item} />)}
    </nav>
    <div className="mt-auto border-t border-border px-4 py-4">
      <ThemeSwitcher />
    </div>
  </aside>
)

const titles: Record<string, string> = {
  '/journal': 'Journal',
  '/progress': 'Progress',
  '/habits': 'Manage Habits',
  '/settings': 'Settings',
}

export const MobileBottomTabs = () => (
  <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface-secondary px-4 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2 lg:hidden">
    <ul className="mx-auto flex max-w-md items-center justify-between">
      {mobileTabs.map(({ to, label, icon: Icon }) => (
        <li key={to} className="flex-1">
          <NavLink to={to} className={({ isActive }) => `flex flex-col items-center gap-1 rounded-xl py-2 text-xs ${isActive ? 'text-accent' : 'text-content-muted'}`}>
            <Icon width={18} height={18} />
            <span>{label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
)

export const FloatingAddButton = ({ visible }: { visible: boolean }) => {
  if (!visible) {
    return null
  }

  return (
    <Link
      to="/habits"
      className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-3xl leading-none text-white shadow-soft lg:hidden"
      aria-label="Add habit"
    >
      +
    </Link>
  )
}

export const AppLayout = () => {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-surface-primary text-content-primary">
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface-primary/95 px-4 py-3 lg:hidden">
            <h1 className="text-base font-semibold">{location.pathname.startsWith('/habits/') ? 'Habit Detail' : (titles[location.pathname] ?? 'Ripple')}</h1>
            <ThemeSwitcher />
          </header>
          <main className="flex-1 p-4 pb-28 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <FloatingAddButton visible={location.pathname === '/journal'} />
      <MobileBottomTabs />
    </div>
  )
}
