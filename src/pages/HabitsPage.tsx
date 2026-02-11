import { useMemo, useState } from 'react'
import { HabitCard } from '../components/HabitCard'
import { HabitForm } from '../components/HabitForm'
import { useHabits } from '../hooks/useHabits'
import type { Habit, HabitCategory } from '../types/models'

type CategoryFilter = HabitCategory | 'all'
type ArchiveFilter = 'active' | 'archived' | 'all'

const CATEGORY_FILTERS: CategoryFilter[] = [
  'all',
  'health',
  'fitness',
  'mindfulness',
  'productivity',
  'learning',
  'relationships',
  'finance',
  'custom',
]

const humanize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

export const HabitsPage = () => {
  const {
    habits,
    activeCount,
    archivedCount,
    createHabit,
    updateHabit,
    archiveHabit,
    unarchiveHabit,
    deleteHabit,
  } = useHabits()

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>('active')
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)

  const filteredHabits = useMemo(() => {
    return habits.filter((habit) => {
      const categoryMatch = categoryFilter === 'all' || habit.category === categoryFilter
      const archiveMatch =
        archiveFilter === 'all' ||
        (archiveFilter === 'active' ? !habit.isArchived : habit.isArchived)

      return categoryMatch && archiveMatch
    })
  }, [habits, categoryFilter, archiveFilter])

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Habit management</h2>
        <p className="mt-1 text-sm text-slate-500">Create habits and keep your list organized with archive controls.</p>
        <div className="mt-3 flex gap-3 text-sm">
          <p>Active: <span className="font-semibold">{activeCount}</span></p>
          <p>Archived: <span className="font-semibold">{archivedCount}</span></p>
        </div>
      </div>

      <HabitForm
        key={editingHabit?.id ?? 'create'}
        initialValues={
          editingHabit
            ? {
                name: editingHabit.name,
                description: editingHabit.description,
                category: editingHabit.category,
                frequencyType: editingHabit.frequencyType,
              }
            : undefined
        }
        submitLabel={editingHabit ? 'Update habit' : 'Add habit'}
        onCancel={editingHabit ? () => setEditingHabit(null) : undefined}
        onSubmit={(values) => {
          if (editingHabit) {
            updateHabit(editingHabit.id, values)
            setEditingHabit(null)
            return
          }

          createHabit(values)
        }}
      />

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Category filter</span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as CategoryFilter)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {CATEGORY_FILTERS.map((option) => (
                <option key={option} value={option}>
                  {humanize(option)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Status filter</span>
            <select
              value={archiveFilter}
              onChange={(event) => setArchiveFilter(event.target.value as ArchiveFilter)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="active">Active only</option>
              <option value="archived">Archived only</option>
              <option value="all">All</option>
            </select>
          </label>
        </div>
      </div>

      {filteredHabits.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
          No habits match the current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onEdit={setEditingHabit}
              onDelete={deleteHabit}
              onArchiveToggle={(habitId, shouldArchive) => {
                if (shouldArchive) {
                  archiveHabit(habitId)
                  return
                }

                unarchiveHabit(habitId)
              }}
            />
          ))}
        </div>
      )}
    </section>
  )
}
