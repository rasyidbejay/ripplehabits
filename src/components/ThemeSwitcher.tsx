import type { ComponentType, SVGProps } from 'react'
import { useTheme } from '../hooks/useTheme'
import type { ThemePreference } from '../types/models'
import { MonitorIcon, MoonIcon, SunIcon } from './icons'

const OPTIONS: Array<{ value: ThemePreference; label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }> = [
  { value: 'light', label: 'Light', Icon: SunIcon },
  { value: 'dark', label: 'Dark', Icon: MoonIcon },
  { value: 'system', label: 'System', Icon: MonitorIcon },
]

type ThemeSwitcherProps = {
  className?: string
}

export const ThemeSwitcher = ({ className = '' }: ThemeSwitcherProps) => {
  const { theme, setTheme } = useTheme()

  return (
    <div className={`inline-flex min-h-11 items-center rounded-2xl border border-border bg-surface-secondary p-1 ${className}`}>
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={[
              'flex min-h-10 min-w-10 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium transition-all duration-200',
              active ? 'bg-accent/15 text-accent' : 'text-content-secondary hover:text-content-primary',
            ].join(' ')}
            aria-pressed={active}
          >
            <Icon className={active ? 'active-icon fill-accent/20 text-accent' : 'text-content-muted'} width={16} height={16} />
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
