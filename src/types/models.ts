export type ThemePreference = 'system' | 'light' | 'dark'

export type HabitCategory =
  | 'health'
  | 'fitness'
  | 'mindfulness'
  | 'productivity'
  | 'learning'
  | 'relationships'
  | 'finance'
  | 'custom'

export type HabitFrequencyType = 'daily' | 'weekly' | 'monthly' | 'custom'

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export interface UserPreferences {
  name: string
  timezone: string
  theme: ThemePreference
  weekStartsOn: Weekday
  remindersEnabled: boolean
  defaultHabitColor: string
  compactMode: boolean
  updatedAt: string
}

export interface Habit {
  id: string
  name: string
  description: string
  category: HabitCategory
  color: string
  icon: string
  frequencyType: HabitFrequencyType
  targetDays: Weekday[]
  createdDate: string
  isArchived: boolean
}

export interface CheckIn {
  habitId: Habit['id']
  date: string
  completed: boolean
  notes?: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: string
  progress: number
  goal: number
}

export interface Routine {
  id: string
  name: string
  description?: string
  habitIds: Habit['id'][]
  scheduledDays: Weekday[]
  timeOfDay?: string
  createdDate: string
  isArchived: boolean
}
