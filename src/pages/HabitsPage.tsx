import { useMemo, useState } from 'react'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { HabitCard } from '../components/HabitCard'
import { HabitForm } from '../components/HabitForm'
import { useHabits } from '../hooks/useHabits'
import type { Habit, HabitCategory } from '../types/models'
import { storage } from '../utils/storage'

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
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null)

  const filteredHabits = useMemo(() => {
    return habits.filter((habit) => {
      const categoryMatch = categoryFilter === 'all' || habit.category === categoryFilter
      const archiveMatch =
        archiveFilter === 'all' ||
        (archiveFilter === 'active' ? !habit.isArchived : habit.isArchived)

      return categoryMatch && archiveMatch
    })
  }, [habits, categoryFilter, archiveFilter])

  const checkIns = storage.list('checkIns')

  const handleCreateSubmit = (values: Parameters<typeof createHabit>[0]) => {
    createHabit(values)
    setShowCreateForm(false)
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-border bg-surface-secondary p-4">
        <h2 className="text-lg font-semibold text-content-primary">Habit management</h2>
        <p className="mt-1 text-sm text-content-muted">Create habits and keep your list organized with archive controls.</p>
        <div className="mt-3 flex gap-3 text-sm">
          <p>Active: <span className="font-semibold">{activeCount}</span></p>
          <p>Archived: <span className="font-semibold">{archivedCount}</span></p>
        </div>
        <div className="mt-4">
          {showCreateForm ? (
            <HabitForm
              submitLabel="Create habit"
              onCancel={() => setShowCreateForm(false)}
              onSubmit={handleCreateSubmit}
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditingHabit(null)
                setShowCreateForm(true)
              }}
              className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-surface-secondary hover:bg-accent/90"
            >
              Add Habit
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface-secondary p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-medium text-content-secondary">Category filter</span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as CategoryFilter)}
              className="w-full rounded-lg border border-border bg-surface-tertiary px-3 py-2 text-sm text-content-primary"
            >
              {CATEGORY_FILTERS.map((option) => (
                <option key={option} value={option}>
                  {humanize(option)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium text-content-secondary">Status filter</span>
            <select
              value={archiveFilter}
              onChange={(event) => setArchiveFilter(event.target.value as ArchiveFilter)}
              className="w-full rounded-lg border border-border bg-surface-tertiary px-3 py-2 text-sm text-content-primary"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="all">All</option>
            </select>
          </label>
        </div>
      </div>

      {filteredHabits.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface-tertiary p-6 text-center text-sm text-content-muted">
          No habits match the current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredHabits.map((habit) =>
            editingHabit?.id === habit.id ? (
              <HabitForm
                key={habit.id}
                initialValues={{
                  name: habit.name,
                  description: habit.description,
                  category: habit.category,
                  frequencyType: habit.frequencyType,
                  targetDays: habit.targetDays,
                }}
                submitLabel="Save changes"
                onCancel={() => setEditingHabit(null)}
                onSubmit={(values) => {
                  updateHabit(habit.id, values)
                  setEditingHabit(null)
                }}
              />
            ) : (
              <HabitCard
                key={habit.id}
                habit={habit}
                checkIns={checkIns}
                onEdit={(nextHabit) => {
                  setShowCreateForm(false)
                  setEditingHabit(nextHabit)
                }}
                onDelete={(habitId) => {
                  const foundHabit = habits.find((candidate) => candidate.id === habitId) ?? null
                  setHabitToDelete(foundHabit)
                }}
                onArchiveToggle={(habitId, shouldArchive) => {
                  if (shouldArchive) {
                    archiveHabit(habitId)
                    return
                  }

                  unarchiveHabit(habitId)
                }}
              />
            ),
          )}
        </div>
      )}

      <ConfirmDialog
        open={habitToDelete !== null}
        title="Delete Habit"
        confirmLabel="Delete"
        onCancel={() => setHabitToDelete(null)}
        onConfirm={() => {
          if (!habitToDelete) {
            return
          }

          deleteHabit(habitToDelete.id)
          if (editingHabit?.id === habitToDelete.id) {
            setEditingHabit(null)
          }
          setHabitToDelete(null)
        }}
      >
        {habitToDelete ? (
          <>
            Are you sure you want to delete <span className="font-semibold">{habitToDelete.name}</span>? This action
            cannot be undone.
          </>
        ) : null}
      </ConfirmDialog>
    </section>
  )
}
