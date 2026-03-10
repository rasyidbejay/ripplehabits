import { useMemo, useState } from 'react'
import type { Habit, HabitCategory, HabitFrequencyType } from '../types/models'
import { ensureHabitStarterData, storage } from '../utils/storage'
import { getActiveHabits, getArchivedHabits } from '../utils/habits'

type CreateHabitInput = {
  name: string
  description: string
  category: HabitCategory
  frequencyType: HabitFrequencyType
  targetDays: Habit['targetDays']
  targetValue?: number
  unit?: string
  reminderTime?: string
  notes?: string
  emoji?: string
  icon?: string
  isArchived?: boolean
}

type UpdateHabitInput = Partial<
  Pick<
    Habit,
    | 'name'
    | 'description'
    | 'category'
    | 'frequencyType'
    | 'targetDays'
    | 'isArchived'
    | 'archived'
    | 'active'
    | 'targetValue'
    | 'unit'
    | 'reminderTime'
    | 'notes'
    | 'sortOrder'
    | 'emoji'
    | 'icon'
  >
>

const DEFAULT_COLOR = '#7c5cfc'
const DEFAULT_ICON = 'sparkles'

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const existing = storage.get('habits')
    return existing && existing.length > 0 ? existing : ensureHabitStarterData()
  })

  const createHabit = ({ name, description, category, frequencyType, targetDays, targetValue, unit, reminderTime, notes, emoji, icon, isArchived }: CreateHabitInput) => {
    const trimmedName = name.trim()
    const trimmedDescription = description.trim()

    if (!trimmedName) {
      return null
    }

    const now = new Date().toISOString()

    const habit: Habit = {
      id: crypto.randomUUID(),
      name: trimmedName,
      description: trimmedDescription,
      category,
      color: DEFAULT_COLOR,
      icon: icon?.trim() || DEFAULT_ICON,
      emoji: emoji?.trim() || undefined,
      frequencyType,
      targetDays: frequencyType === 'specific_days' ? targetDays : [],
      targetValue,
      unit: unit?.trim() || undefined,
      reminderTime: reminderTime?.trim() || undefined,
      notes: notes?.trim() || undefined,
      createdDate: now,
      updatedDate: now,
      isArchived: Boolean(isArchived),
      archived: Boolean(isArchived),
      active: !isArchived,
      streak: { current: 0, longest: 0 },
      completionHistory: [],
      sortOrder: habits.length,
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
        targetDays: updates.targetDays !== undefined ? updates.targetDays : habit.targetDays,
        archived: updates.isArchived ?? updates.archived ?? habit.archived,
        active: updates.isArchived !== undefined ? !updates.isArchived : updates.active ?? habit.active,
        updatedDate: new Date().toISOString(),
      }),
    )

    setHabits(nextHabits)
  }

  const archiveHabit = (habitId: Habit['id']) => {
    updateHabit(habitId, { isArchived: true, archived: true, active: false })
  }

  const unarchiveHabit = (habitId: Habit['id']) => {
    updateHabit(habitId, { isArchived: false, archived: false, active: true })
  }

  const deleteHabit = (habitId: Habit['id']) => {
    const nextHabits = storage.delete('habits', (habit) => habit.id === habitId)
    setHabits(nextHabits)
  }

  const derived = useMemo(() => {
    const activeHabits = getActiveHabits(habits)
    const archivedHabits = getArchivedHabits(habits)
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
