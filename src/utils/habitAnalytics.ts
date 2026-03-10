import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import type { CheckIn, CompletionStatus, Habit, Weekday } from '../types/models'
import { getActiveHabits, isHabitDueOnDate } from './habits'

const WEEKDAY_TO_INDEX: Record<Weekday, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

const getDateKey = (value: Date | string): string =>
  typeof value === 'string' ? format(parseISO(value), 'yyyy-MM-dd') : format(value, 'yyyy-MM-dd')

const getTargetValue = (habit: Habit): number => Math.max(1, habit.targetValue ?? 1)

const getCheckInByHabitDate = (checkIns: CheckIn[]): Map<string, CheckIn> => {
  const map = new Map<string, CheckIn>()

  for (const checkIn of checkIns) {
    map.set(`${checkIn.habitId}:${getDateKey(checkIn.date)}`, checkIn)
  }

  return map
}

export const getCompletionStatus = (
  habit: Habit,
  checkIn?: CheckIn,
): CompletionStatus => {
  if (!checkIn) {
    return 'missed'
  }

  const value = Math.max(0, checkIn.value ?? (checkIn.completed ? getTargetValue(habit) : 0))
  const target = getTargetValue(habit)

  if (value >= target || checkIn.completed) {
    return 'completed'
  }

  if (value > 0) {
    return 'partial'
  }

  return checkIn.status === 'skipped' ? 'skipped' : 'missed'
}

const isCompletedStatus = (status: CompletionStatus): boolean => status === 'completed'

const resolveWeeklyDueDay = (habit: Habit): number => {
  if (habit.targetDays.length > 0) {
    return WEEKDAY_TO_INDEX[habit.targetDays[0]]
  }

  return parseISO(habit.createdDate).getDay()
}

const isHabitCompletedOnDate = (habit: Habit, checkInsByDate: Map<string, CheckIn>, date: Date): boolean => {
  const checkIn = checkInsByDate.get(`${habit.id}:${getDateKey(date)}`)
  return isCompletedStatus(getCompletionStatus(habit, checkIn))
}

const getHabitDueDates = (habit: Habit, from: Date, to: Date): Date[] => {
  const created = startOfDay(parseISO(habit.createdDate))
  const rangeStart = isAfter(from, created) ? startOfDay(from) : created

  if (isAfter(rangeStart, to)) {
    return []
  }

  return eachDayOfInterval({ start: rangeStart, end: startOfDay(to) }).filter((date) => isHabitDueOnDate(habit, date))
}

const getWeeklyRangeKeys = (date: Date, weekStartsOn: 0 | 1): string => {
  const start = startOfWeek(date, { weekStartsOn })
  const end = endOfWeek(date, { weekStartsOn })
  return `${getDateKey(start)}:${getDateKey(end)}`
}

export const calculateHabitStreak = (
  habit: Habit,
  checkIns: CheckIn[],
  today = new Date(),
): { current: number; longest: number; lastCompletedDate?: string } => {
  const checkInsByDate = getCheckInByHabitDate(checkIns)
  const dueDates = getHabitDueDates(habit, parseISO(habit.createdDate), today)

  if (habit.frequencyType === 'weekly') {
    const created = startOfDay(parseISO(habit.createdDate))
    const dueDay = resolveWeeklyDueDay(habit)
    const allDays = eachDayOfInterval({ start: created, end: startOfDay(today) })

    const weeklyWindows = new Map<string, boolean>()

    for (const day of allDays) {
      const key = getWeeklyRangeKeys(day, 1)

      if (!weeklyWindows.has(key)) {
        weeklyWindows.set(key, false)
      }

      if (day.getDay() !== dueDay) {
        continue
      }

      if (isHabitCompletedOnDate(habit, checkInsByDate, day)) {
        weeklyWindows.set(key, true)
      }
    }

    const windows = [...weeklyWindows.entries()].sort(([left], [right]) => left.localeCompare(right))
    let longest = 0
    let running = 0

    for (const [, completed] of windows) {
      if (completed) {
        running += 1
        longest = Math.max(longest, running)
      } else {
        running = 0
      }
    }

    let current = 0
    for (let index = windows.length - 1; index >= 0; index -= 1) {
      if (!windows[index][1]) {
        break
      }
      current += 1
    }

    const lastCompletedDate = [...dueDates]
      .reverse()
      .find((date) => isHabitCompletedOnDate(habit, checkInsByDate, date))

    return {
      current,
      longest,
      lastCompletedDate: lastCompletedDate ? getDateKey(lastCompletedDate) : undefined,
    }
  }

  const completionByDueDate = dueDates.map((date) =>
    isHabitCompletedOnDate(habit, checkInsByDate, date),
  )

  let longest = 0
  let running = 0

  for (const completed of completionByDueDate) {
    if (completed) {
      running += 1
      longest = Math.max(longest, running)
    } else {
      running = 0
    }
  }

  let current = 0
  for (let index = completionByDueDate.length - 1; index >= 0; index -= 1) {
    if (!completionByDueDate[index]) {
      break
    }
    current += 1
  }

  const lastCompletedDate = [...dueDates]
    .reverse()
    .find((date) => isHabitCompletedOnDate(habit, checkInsByDate, date))

  return {
    current,
    longest,
    lastCompletedDate: lastCompletedDate ? getDateKey(lastCompletedDate) : undefined,
  }
}

export const getTodayOverview = (habits: Habit[], checkIns: CheckIn[], today = new Date()) => {
  const activeHabits = getActiveHabits(habits)
  const dueToday = activeHabits.filter((habit) => isHabitDueOnDate(habit, today))
  const map = getCheckInByHabitDate(checkIns)

  const completedToday = dueToday.filter((habit) =>
    isCompletedStatus(getCompletionStatus(habit, map.get(`${habit.id}:${getDateKey(today)}`))),
  )

  return {
    dueToday,
    completedToday,
    remainingToday: dueToday.length - completedToday.length,
  }
}

export const getCompletionRateByPeriod = (
  habits: Habit[],
  checkIns: CheckIn[],
  period: 'week' | 'month',
  today = new Date(),
): number => {
  const activeHabits = getActiveHabits(habits)
  const start = period === 'week' ? startOfWeek(today, { weekStartsOn: 1 }) : startOfMonth(today)
  const end = period === 'week' ? endOfWeek(today, { weekStartsOn: 1 }) : endOfMonth(today)
  const days = eachDayOfInterval({ start, end })
  const map = getCheckInByHabitDate(checkIns)

  let dueCount = 0
  let doneCount = 0

  for (const day of days) {
    for (const habit of activeHabits) {
      if (!isHabitDueOnDate(habit, day)) {
        continue
      }

      dueCount += 1
      const checkIn = map.get(`${habit.id}:${getDateKey(day)}`)
      if (isCompletedStatus(getCompletionStatus(habit, checkIn))) {
        doneCount += 1
      }
    }
  }

  return dueCount === 0 ? 0 : Math.round((doneCount / dueCount) * 100)
}

export const getWeekdayDistribution = (habits: Habit[], checkIns: CheckIn[]) => {
  const activeHabits = getActiveHabits(habits)
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const totals = labels.map(() => ({ due: 0, done: 0 }))
  const map = getCheckInByHabitDate(checkIns)

  for (const habit of activeHabits) {
    const created = startOfDay(parseISO(habit.createdDate))
    const to = startOfDay(new Date())

    if (isBefore(to, created)) {
      continue
    }

    for (const day of eachDayOfInterval({ start: created, end: to })) {
      if (!isHabitDueOnDate(habit, day)) {
        continue
      }

      const dayIndex = day.getDay()
      totals[dayIndex].due += 1

      const checkIn = map.get(`${habit.id}:${getDateKey(day)}`)
      if (isCompletedStatus(getCompletionStatus(habit, checkIn))) {
        totals[dayIndex].done += 1
      }
    }
  }

  return labels.map((day, index) => ({
    day,
    value: totals[index].due === 0 ? 0 : Math.round((totals[index].done / totals[index].due) * 100),
  }))
}

export const getConsistencyGridData = (habits: Habit[], checkIns: CheckIn[], days = 28) => {
  const end = startOfDay(new Date())
  const start = startOfDay(new Date(end.getTime() - (days - 1) * 24 * 60 * 60 * 1000))
  const activeHabits = getActiveHabits(habits)
  const map = getCheckInByHabitDate(checkIns)

  return eachDayOfInterval({ start, end }).map((date) => {
    let due = 0
    let done = 0

    for (const habit of activeHabits) {
      if (!isHabitDueOnDate(habit, date)) {
        continue
      }

      due += 1
      const checkIn = map.get(`${habit.id}:${getDateKey(date)}`)
      if (isCompletedStatus(getCompletionStatus(habit, checkIn))) {
        done += 1
      }
    }

    return {
      date: getDateKey(date),
      completionRate: due === 0 ? 0 : Math.round((done / due) * 100),
    }
  })
}

export const getPerformanceListData = (habits: Habit[], checkIns: CheckIn[]) =>
  getActiveHabits(habits)
    .map((habit) => {
      const streak = calculateHabitStreak(habit, checkIns)
      return {
        habitId: habit.id,
        name: habit.name,
        currentStreak: streak.current,
        longestStreak: streak.longest,
      }
    })
    .sort((left, right) => right.currentStreak - left.currentStreak)

export const getMonthlySummary = (habits: Habit[], checkIns: CheckIn[]) => ({
  completionRate: getCompletionRateByPeriod(habits, checkIns, 'month'),
  consistency: getConsistencyGridData(habits, checkIns, 30),
})

export const getWeeklySummary = (habits: Habit[], checkIns: CheckIn[]) => ({
  completionRate: getCompletionRateByPeriod(habits, checkIns, 'week'),
  weekdayDistribution: getWeekdayDistribution(habits, checkIns),
})
