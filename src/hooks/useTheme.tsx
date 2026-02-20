import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { ThemePreference } from '../types/models'

const THEME_KEY = 'ripple:theme'
const ROOT_KEY = 'ripple:v1'

type ResolvedTheme = 'light' | 'dark'

type ThemeContextValue = {
  theme: ThemePreference
  resolvedTheme: ResolvedTheme
  setTheme: (nextTheme: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const isThemePreference = (value: unknown): value is ThemePreference =>
  value === 'light' || value === 'dark' || value === 'system'

const getSystemTheme = (): ResolvedTheme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

const readStoredTheme = (): ThemePreference => {
  const direct = localStorage.getItem(THEME_KEY)
  if (isThemePreference(direct)) {
    return direct
  }

  try {
    const root = JSON.parse(localStorage.getItem(ROOT_KEY) ?? '{}') as {
      userPreferences?: { theme?: unknown }
      data?: { userPreferences?: { theme?: unknown } }
    }
    const nested = root.userPreferences?.theme ?? root.data?.userPreferences?.theme
    return isThemePreference(nested) ? nested : 'system'
  } catch {
    return 'system'
  }
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemePreference>(() => readStoredTheme())
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme())

  const resolvedTheme = useMemo<ResolvedTheme>(
    () => (theme === 'system' ? systemTheme : theme),
    [theme, systemTheme],
  )

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
  }, [resolvedTheme])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light')
    }

    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }

  return context
}
