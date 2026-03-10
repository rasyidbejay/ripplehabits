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

export type HabitFrequencyType = 'daily' | 'weekly' | 'specific_days' | 'custom_target'

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export type CompletionStatus = 'completed' | 'partial' | 'skipped' | 'missed'

export interface UserPreferences {
  name: string
  timezone: string
  theme: ThemePreference
  weekStartsOn: Weekday
  remindersEnabled: boolean
  defaultHabitColor: string
  compactMode: boolean
  defaultHabitFrequency: HabitFrequencyType
  updatedAt: string
}

export interface HabitStreakMeta {
  current: number
  longest: number
  lastCompletedDate?: string
}

export interface Habit {
  id: string
  name: string
  description: string
  category: HabitCategory
  color: string
  icon: string
  emoji?: string
  frequencyType: HabitFrequencyType
  targetDays: Weekday[]
  targetValue?: number
  unit?: string
  reminderTime?: string
  notes?: string
  createdDate: string
  updatedDate: string
  isArchived: boolean
  archived: boolean
  active: boolean
  streak: HabitStreakMeta
  completionHistory: string[]
  lastCompletedDate?: string
  sortOrder: number
}

export interface CheckIn {
  habitId: Habit['id']
  date: string
  completed: boolean
  value?: number
  status: CompletionStatus
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
