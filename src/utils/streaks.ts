import type { CheckIn, Habit } from '../types/models'

type HabitId = Habit['id']
type DateKey = `${number}-${number}-${number}`

type StreakPeriod = 'daily' | 'weekly'

interface MilestoneDefinition {
  readonly threshold: number
  readonly label: string
}

export interface StreakMilestone {
  readonly threshold: number
  readonly label: string
}

const ACTIVE_PERIOD: StreakPeriod = 'daily'

const DAY_IN_MS = 24 * 60 * 60 * 1000

const DAILY_MILESTONES: readonly MilestoneDefinition[] = [
  { threshold: 3, label: 'Starter' },
  { threshold: 7, label: 'On a roll' },
  { threshold: 14, label: 'Committed' },
  { threshold: 30, label: 'Momentum' },
  { threshold: 60, label: 'Dedicated' },
  { threshold: 100, label: 'Centurion' },
  { threshold: 365, label: 'Legend' },
] as const

const normalizeDateKey = (value: string): DateKey | null => {
  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed.toISOString().slice(0, 10) as DateKey
}

const toUtcTimestamp = (dateKey: DateKey): number => {
  return new Date(`${dateKey}T00:00:00.000Z`).getTime()
}

const shiftDateKeyByDays = (dateKey: DateKey, dayDelta: number): DateKey => {
  const shiftedTimestamp = toUtcTimestamp(dateKey) + dayDelta * DAY_IN_MS
  return new Date(shiftedTimestamp).toISOString().slice(0, 10) as DateKey
}

const getDailyCompletionDays = (
  habitId: HabitId,
  checkins: readonly CheckIn[],
): DateKey[] => {
  const completionByDate = new Map<DateKey, boolean>()

  checkins.forEach((checkin) => {
    if (checkin.habitId !== habitId) {
      return
    }

    const dateKey = normalizeDateKey(checkin.date)

    if (!dateKey) {
      return
    }

    const wasCompleted = completionByDate.get(dateKey) ?? false
    completionByDate.set(dateKey, wasCompleted || checkin.completed)
  })

  return [...completionByDate.entries()]
    .filter(([, completed]) => completed)
    .map(([dateKey]) => dateKey)
    .sort((left, right) => toUtcTimestamp(left) - toUtcTimestamp(right))
}

const getCurrentDailyStreak = (completedDays: readonly DateKey[]): number => {
  if (completedDays.length === 0) {
    return 0
  }

  const completionSet = new Set(completedDays)
  const today = normalizeDateKey(new Date().toISOString())

  if (!today) {
    return 0
  }

  const yesterday = shiftDateKeyByDays(today, -1)

  let cursor = completionSet.has(today)
    ? today
    : completionSet.has(yesterday)
      ? yesterday
      : null

  if (!cursor) {
    return 0
  }

  let streak = 0

  while (completionSet.has(cursor)) {
    streak += 1
    cursor = shiftDateKeyByDays(cursor, -1)
  }

  return streak
}

const getLongestDailyStreak = (completedDays: readonly DateKey[]): number => {
  if (completedDays.length === 0) {
    return 0
  }

  let longest = 1
  let current = 1

  for (let index = 1; index < completedDays.length; index += 1) {
    const previous = completedDays[index - 1]
    const next = completedDays[index]
    const dayDifference = (toUtcTimestamp(next) - toUtcTimestamp(previous)) / DAY_IN_MS

    if (dayDifference === 1) {
      current += 1
      longest = Math.max(longest, current)
    } else if (dayDifference > 1) {
      current = 1
    }
  }

  return longest
}

export const calculateCurrentStreak = (
  habitId: HabitId,
  checkins: readonly CheckIn[],
): number => {
  if (ACTIVE_PERIOD !== 'daily') {
    return 0
  }

  const completedDays = getDailyCompletionDays(habitId, checkins)
  return getCurrentDailyStreak(completedDays)
}

export const calculateLongestStreak = (
  habitId: HabitId,
  checkins: readonly CheckIn[],
): number => {
  if (ACTIVE_PERIOD !== 'daily') {
    return 0
  }

  const completedDays = getDailyCompletionDays(habitId, checkins)
  return getLongestDailyStreak(completedDays)
}

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
