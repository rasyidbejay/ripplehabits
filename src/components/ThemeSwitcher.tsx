import type { ComponentType, SVGProps } from 'react'
import { useTheme } from '../hooks/useThemeContext'
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
    <div className={`inline-flex min-h-11 items-center rounded-2xl border border-border-strong bg-surface-elevated p-1 ${className}`}>
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={[
              'flex min-h-9 min-w-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold transition-all duration-200',
              active
                ? 'bg-accent text-white shadow-[0_6px_18px_rgba(79,70,229,0.36)]'
                : 'text-content-secondary hover:text-content-primary',
            ].join(' ')}
            aria-pressed={active}
          >
            <Icon className={active ? 'text-white' : 'text-content-muted'} width={15} height={15} />
            <span className="hidden lg:inline">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
