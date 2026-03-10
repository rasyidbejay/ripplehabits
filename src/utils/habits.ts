import { isSameDay, parseISO } from 'date-fns'
import type { CheckIn, Habit, Weekday } from '../types/models'

const WEEKDAY_BY_INDEX: Weekday[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

export const getActiveHabits = (habits: Habit[]): Habit[] =>
  habits.filter((habit) => habit.active && !habit.archived && !habit.isArchived)

export const getArchivedHabits = (habits: Habit[]): Habit[] =>
  habits.filter((habit) => habit.archived || habit.isArchived || !habit.active)

export const isHabitDueOnDate = (habit: Habit, targetDate: Date): boolean => {
  if (habit.archived || habit.isArchived || !habit.active) {
    return false
  }

  if (habit.frequencyType === 'daily') {
    return true
  }

  if (habit.frequencyType === 'weekly') {
    if (habit.targetDays.length > 0) {
      return habit.targetDays.includes(WEEKDAY_BY_INDEX[targetDate.getDay()])
    }

    return targetDate.getDay() === parseISO(habit.createdDate).getDay()
  }

  if (habit.frequencyType === 'specific_days') {
    if (habit.targetDays.length === 0) {
      return true
    }

    return habit.targetDays.includes(WEEKDAY_BY_INDEX[targetDate.getDay()])
  }

  return true
}

export const getDueHabitsForDate = (habits: Habit[], date: Date): Habit[] =>
  habits.filter((habit) => isHabitDueOnDate(habit, date))

export const getCompletionHistoryByDate = (
  checkIns: CheckIn[],
  date: Date,
): CheckIn[] =>
  checkIns.filter((checkIn) => {
    const checkInDate = parseISO(checkIn.date)
    return isSameDay(checkInDate, date)
  })

export const getLastCompletedDate = (habitId: Habit['id'], checkIns: CheckIn[]): string | undefined => {
  const completedDates = checkIns
    .filter((entry) => entry.habitId === habitId && entry.completed)
    .map((entry) => entry.date)
    .sort((left, right) => parseISO(right).getTime() - parseISO(left).getTime())

  return completedDates[0]
}

export const buildCompletionHistory = (habitId: Habit['id'], checkIns: CheckIn[]): string[] =>
  checkIns
    .filter((entry) => entry.habitId === habitId && entry.completed)
    .map((entry) => entry.date)
    .sort((left, right) => parseISO(left).getTime() - parseISO(right).getTime())

export const isHabitCreatedOnDate = (habit: Habit, date: Date): boolean =>
  isSameDay(parseISO(habit.createdDate), date)
