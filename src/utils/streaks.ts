import type { CheckIn, Habit } from '../types/models'
import { calculateHabitStreak } from './habitAnalytics'

type HabitId = Habit['id']

interface MilestoneDefinition {
  readonly threshold: number
  readonly label: string
}

export interface StreakMilestone {
  readonly threshold: number
  readonly label: string
}

const DAILY_MILESTONES: readonly MilestoneDefinition[] = [
  { threshold: 3, label: 'Starter' },
  { threshold: 7, label: 'On a roll' },
  { threshold: 14, label: 'Committed' },
  { threshold: 30, label: 'Momentum' },
  { threshold: 60, label: 'Dedicated' },
  { threshold: 100, label: 'Centurion' },
  { threshold: 365, label: 'Legend' },
] as const

const fallbackHabit = (habitId: HabitId): Habit => {
  const now = new Date().toISOString()

  return {
    id: habitId,
    name: '',
    description: '',
    category: 'custom',
    color: '#6366f1',
    icon: 'sparkles',
    frequencyType: 'daily',
    targetDays: [],
    createdDate: now,
    updatedDate: now,
    isArchived: false,
    archived: false,
    active: true,
    streak: { current: 0, longest: 0 },
    completionHistory: [],
    sortOrder: 0,
  }
}

const resolveHabit = (
  habitOrId: HabitId | Habit,
  habits?: Habit[],
): Habit => {
  if (typeof habitOrId !== 'string') {
    return habitOrId
  }

  return habits?.find((habit) => habit.id === habitOrId) ?? fallbackHabit(habitOrId)
}

export const calculateCurrentStreak = (
  habitOrId: HabitId | Habit,
  checkins: readonly CheckIn[],
  habits?: Habit[],
): number => calculateHabitStreak(resolveHabit(habitOrId, habits), [...checkins]).current

export const calculateLongestStreak = (
  habitOrId: HabitId | Habit,
  checkins: readonly CheckIn[],
  habits?: Habit[],
): number => calculateHabitStreak(resolveHabit(habitOrId, habits), [...checkins]).longest

export const getStreakMilestone = (streak: number): StreakMilestone | null => {
  if (!Number.isFinite(streak) || streak <= 0) {
    return null
  }

  const achieved = DAILY_MILESTONES.filter(
    (milestone) => streak >= milestone.threshold,
  ).at(-1)

  if (!achieved) {
    return null
  }

  return {
    threshold: achieved.threshold,
    label: achieved.label,
  }
}
