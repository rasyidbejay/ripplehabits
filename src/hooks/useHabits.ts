import { formatISO, isSameDay, parseISO, startOfToday } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import type { Habit, HabitStats } from '../types/habit'
import { loadHabits, saveHabits } from '../utils/storage'

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits())

  useEffect(() => {
    saveHabits(habits)
  }, [habits])

  const addHabit = (name: string) => {
    const trimmed = name.trim()

    if (!trimmed) {
      return
    }

    const habit: Habit = {
      id: crypto.randomUUID(),
      name: trimmed,
      createdAt: new Date().toISOString(),
      completedDates: [],
    }

    setHabits((current) => [habit, ...current])
  }

  const toggleCompleteToday = (habitId: string) => {
    const today = startOfToday()

    setHabits((current) =>
      current.map((habit) => {
        if (habit.id !== habitId) {
          return habit
        }

        const completedToday = habit.completedDates.some((date) => isSameDay(parseISO(date), today))

        if (completedToday) {
          return {
            ...habit,
            completedDates: habit.completedDates.filter((date) => !isSameDay(parseISO(date), today)),
          }
        }

        return {
          ...habit,
          completedDates: [...habit.completedDates, formatISO(today, { representation: 'date' })],
        }
      }),
    )
  }

  const removeHabit = (habitId: string) => {
    setHabits((current) => current.filter((habit) => habit.id !== habitId))
  }

  const stats = useMemo<HabitStats>(() => {
    const today = startOfToday()
    const completedToday = habits.filter((habit) =>
      habit.completedDates.some((date) => isSameDay(parseISO(date), today)),
    ).length

    const totalHabits = habits.length
    const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0

    return {
      totalHabits,
      completedToday,
      completionRate,
    }
  }, [habits])

  return {
    habits,
    stats,
    addHabit,
    removeHabit,
    toggleCompleteToday,
  }
}
