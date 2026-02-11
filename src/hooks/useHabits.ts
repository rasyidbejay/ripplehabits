import { useMemo, useState } from 'react'
import type { Habit, HabitCategory, HabitFrequencyType } from '../types/models'
import { storage } from '../utils/storage'

type CreateHabitInput = {
  name: string
  description: string
  category: HabitCategory
  frequencyType: HabitFrequencyType
}

type UpdateHabitInput = Partial<
  Pick<Habit, 'name' | 'description' | 'category' | 'frequencyType' | 'isArchived'>
>

const DEFAULT_COLOR = '#6366f1'
const DEFAULT_ICON = 'sparkles'

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>(() => storage.get('habits') ?? [])

  const createHabit = ({ name, description, category, frequencyType }: CreateHabitInput) => {
    const trimmedName = name.trim()
    const trimmedDescription = description.trim()

    if (!trimmedName) {
      return null
    }

    const habit: Habit = {
      id: crypto.randomUUID(),
      name: trimmedName,
      description: trimmedDescription,
      category,
      color: DEFAULT_COLOR,
      icon: DEFAULT_ICON,
      frequencyType,
      targetDays: [],
      createdDate: new Date().toISOString(),
      isArchived: false,
    }

    const nextHabits = storage.create('habits', habit)
    setHabits(nextHabits)

    return habit
  }

  const updateHabit = (habitId: Habit['id'], updates: UpdateHabitInput) => {
    const nextHabits = storage.update(
      'habits',
      (habit) => habit.id === habitId,
      (habit) => ({
        ...habit,
        ...updates,
        name: updates.name !== undefined ? updates.name.trim() : habit.name,
        description:
          updates.description !== undefined
            ? updates.description.trim()
            : habit.description,
      }),
    )

    setHabits(nextHabits)
  }

  const archiveHabit = (habitId: Habit['id']) => {
    updateHabit(habitId, { isArchived: true })
  }

  const unarchiveHabit = (habitId: Habit['id']) => {
    updateHabit(habitId, { isArchived: false })
  }

  const deleteHabit = (habitId: Habit['id']) => {
    const nextHabits = storage.delete('habits', (habit) => habit.id === habitId)
    setHabits(nextHabits)
  }

  const derived = useMemo(() => {
    const activeHabits = habits.filter((habit) => !habit.isArchived)
    const archivedHabits = habits.filter((habit) => habit.isArchived)
    const categories = Array.from(new Set(habits.map((habit) => habit.category)))

    return {
      activeHabits,
      archivedHabits,
      categories,
      totalHabits: habits.length,
      activeCount: activeHabits.length,
      archivedCount: archivedHabits.length,
    }
  }, [habits])

  return {
    habits,
    ...derived,
    createHabit,
    updateHabit,
    archiveHabit,
    unarchiveHabit,
    deleteHabit,
  }
}
