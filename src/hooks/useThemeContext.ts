import { createContext, useContext } from 'react'
import type { ThemePreference } from '../types/models'

export type ResolvedTheme = 'light' | 'dark'

type ThemeContextValue = {
  theme: ThemePreference
  resolvedTheme: ResolvedTheme
  setTheme: (nextTheme: ThemePreference) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export const useTheme = () => {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }

  return context
}

export type { ThemePreference }
