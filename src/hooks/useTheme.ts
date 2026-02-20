import { useEffect, useMemo, useState } from 'react'
import type { ThemePreference } from '../types/models'

const THEME_KEY = 'ripple:theme'
const ROOT_KEY = 'ripple:v1'

const isThemePreference = (value: unknown): value is ThemePreference =>
  value === 'light' || value === 'dark' || value === 'system'

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

const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

export const useTheme = () => {
  const [theme, setThemeState] = useState<ThemePreference>(() => readStoredTheme())
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => getSystemTheme())

  const resolvedTheme = useMemo(
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

  return {
    theme,
    resolvedTheme,
    setTheme: setThemeState,
  }
}
