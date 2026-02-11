import type { Habit } from '../types/habit'

const HABITS_STORAGE_KEY = 'ripple:habits'

export const loadHabits = (): Habit[] => {
  const stored = localStorage.getItem(HABITS_STORAGE_KEY)

  if (!stored) {
    return []
  }

  try {
    return JSON.parse(stored) as Habit[]
  } catch {
    return []
  }
}

export const saveHabits = (habits: Habit[]): void => {
  localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits))
}
