import { useMemo, useState } from 'react'
import {
  formatISO,
  getDate,
  isSameDay,
  parseISO,
} from 'date-fns'
import type { CheckIn, Habit, Weekday } from '../types/models'
import { storage } from '../utils/storage'

const WEEKDAY_BY_INDEX: Weekday[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

const isHabitScheduledForToday = (habit: Habit, today: Date) => {
  if (habit.isArchived) {
    return false
  }

  if (habit.frequencyType === 'daily') {
    return true
  }

  if (habit.frequencyType === 'monthly') {
    return getDate(parseISO(habit.createdDate)) === getDate(today)
  }

  if (habit.targetDays.length === 0) {
    return true
  }

  const todayWeekday = WEEKDAY_BY_INDEX[today.getDay()]
  return habit.targetDays.includes(todayWeekday)
}

export const useTodayHabits = () => {
  const [habits] = useState<Habit[]>(() => storage.get('habits') ?? [])
  const [checkIns, setCheckIns] = useState<CheckIn[]>(() => storage.get('checkIns') ?? [])

  const today = useMemo(() => new Date(), [])
  const todayKey = useMemo(
    () => formatISO(today, { representation: 'date' }),
    [today],
  )

  const todayHabits = useMemo(
    () => habits.filter((habit) => isHabitScheduledForToday(habit, today)),
    [habits, today],
  )

  const getCheckInForHabit = (habitId: Habit['id']) =>
    checkIns.find(
      (checkIn) =>
        checkIn.habitId === habitId &&
        isSameDay(parseISO(checkIn.date), today),
    )

  const saveCheckIn = (
    habitId: Habit['id'],
    updates: Pick<CheckIn, 'completed' | 'notes'>,
  ) => {
    const existingEntry = getCheckInForHabit(habitId)

    if (existingEntry) {
      const nextCheckIns = storage.update(
        'checkIns',
        (checkIn) =>
          checkIn.habitId === habitId &&
          isSameDay(parseISO(checkIn.date), today),
        (checkIn) => ({
          ...checkIn,
          completed: updates.completed,
          notes: updates.notes,
        }),
      )

      setCheckIns(nextCheckIns)
      return
    }

    const nextCheckIns = storage.create('checkIns', {
      habitId,
      date: todayKey,
      completed: updates.completed,
      notes: updates.notes,
    })

    setCheckIns(nextCheckIns)
  }

  const toggleCheckIn = (habitId: Habit['id']) => {
    const existingEntry = getCheckInForHabit(habitId)

    if (existingEntry) {
      saveCheckIn(habitId, {
        completed: !existingEntry.completed,
        notes: existingEntry.notes,
      })
      return
    }

    saveCheckIn(habitId, {
      completed: true,
      notes: '',
    })
  }

  const updateNotes = (habitId: Habit['id'], notes: string) => {
    const existingEntry = getCheckInForHabit(habitId)

    saveCheckIn(habitId, {
      completed: existingEntry?.completed ?? false,
      notes: notes.trim(),
    })
  }

  return {
    today,
    todayHabits,
    getCheckInForHabit,
    toggleCheckIn,
    updateNotes,
  }
}
