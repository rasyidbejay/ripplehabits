import { useMemo, useState } from 'react'
import { formatISO, isSameDay, parseISO } from 'date-fns'
import type { CheckIn, Habit } from '../types/models'
import { buildCompletionHistory, getDueHabitsForDate, getLastCompletedDate } from '../utils/habits'
import { storage } from '../utils/storage'
import { calculateCurrentStreak, calculateLongestStreak } from '../utils/streaks'

export const useTodayHabits = () => {
  const [habits, setHabits] = useState<Habit[]>(() => storage.get('habits') ?? [])
  const [checkIns, setCheckIns] = useState<CheckIn[]>(() => storage.get('checkIns') ?? [])

  const today = useMemo(() => new Date(), [])
  const todayKey = useMemo(
    () => formatISO(today, { representation: 'date' }),
    [today],
  )

  const todayHabits = useMemo(() => getDueHabitsForDate(habits, today), [habits, today])

  const getCheckInForHabit = (habitId: Habit['id']) =>
    checkIns.find(
      (checkIn) =>
        checkIn.habitId === habitId &&
        isSameDay(parseISO(checkIn.date), today),
    )

  const syncHabitMetadata = (nextCheckIns: CheckIn[]) => {
    const nextHabits = storage.update(
      'habits',
      () => true,
      (habit) => {
        const current = calculateCurrentStreak(habit.id, nextCheckIns)
        const longest = calculateLongestStreak(habit.id, nextCheckIns)
        const completionHistory = buildCompletionHistory(habit.id, nextCheckIns)
        const lastCompletedDate = getLastCompletedDate(habit.id, nextCheckIns)

        return {
          ...habit,
          completionHistory,
          lastCompletedDate,
          streak: {
            current,
            longest,
            lastCompletedDate,
          },
          updatedDate: new Date().toISOString(),
        }
      },
    )

    setHabits(nextHabits)
  }

  const saveCheckIn = (
    habitId: Habit['id'],
    updates: Pick<CheckIn, 'completed' | 'notes' | 'value'>,
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
          value: updates.value,
          status: updates.completed ? 'completed' : 'missed',
          notes: updates.notes,
        }),
      )

      setCheckIns(nextCheckIns)
      syncHabitMetadata(nextCheckIns)
      return
    }

    const nextCheckIns = storage.create('checkIns', {
      habitId,
      date: todayKey,
      completed: updates.completed,
      value: updates.value,
      status: updates.completed ? 'completed' : 'missed',
      notes: updates.notes,
    })

    setCheckIns(nextCheckIns)
    syncHabitMetadata(nextCheckIns)
  }

  const toggleCheckIn = (habitId: Habit['id']) => {
    const existingEntry = getCheckInForHabit(habitId)

    if (existingEntry) {
      saveCheckIn(habitId, {
        completed: !existingEntry.completed,
        notes: existingEntry.notes,
        value: existingEntry.value,
      })
      return
    }

    saveCheckIn(habitId, {
      completed: true,
      notes: '',
      value: 1,
    })
  }

  const updateNotes = (habitId: Habit['id'], notes: string) => {
    const existingEntry = getCheckInForHabit(habitId)

    saveCheckIn(habitId, {
      completed: existingEntry?.completed ?? false,
      notes: notes.trim(),
      value: existingEntry?.value,
    })
  }

  return {
    today,
    todayHabits,
    checkIns,
    getCheckInForHabit,
    toggleCheckIn,
    updateNotes,
  }
}
