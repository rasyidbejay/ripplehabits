import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { HabitForm } from '../components/HabitForm'
import { ActionButton, AppPageHeader, EmptyState, SecondaryButton } from '../components/ui/primitives'
import { useHabits } from '../hooks/useHabits'
import type { Habit, HabitCategory, HabitFrequencyType } from '../types/models'

type StatusFilter = 'all' | 'active' | 'archived'
type SortKey = 'name' | 'newest' | 'streak' | 'manual'
type EditingMode = 'create' | 'edit'

const FREQUENCY_FILTER_OPTIONS: Array<HabitFrequencyType | 'all'> = ['all', 'daily', 'weekly', 'specific_days', 'custom_target']
const STATUS_OPTIONS: StatusFilter[] = ['all', 'active', 'archived']
const SORT_OPTIONS: SortKey[] = ['manual', 'name', 'newest', 'streak']

const humanize = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase())

const frequencyLabel = (habit: Habit) => {
  if (habit.frequencyType === 'specific_days') {
    return `Specific days (${habit.targetDays.length || 0})`
  }

  if (habit.frequencyType === 'custom_target') {
    return 'Custom target'
  }

  return humanize(habit.frequencyType)
}

export const ManageHabitsPage = () => {
  const { habits, categories, createHabit, updateHabit, archiveHabit, unarchiveHabit, deleteHabit } = useHabits()

  const [status, setStatus] = useState<StatusFilter>('active')
  const [frequencyFilter, setFrequencyFilter] = useState<HabitFrequencyType | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<HabitCategory | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortKey>('manual')
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingMode, setEditingMode] = useState<EditingMode>('create')
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null)

  const filteredHabits = useMemo(() => {
    const items = habits.filter((habit) => {
      const matchesStatus = status === 'all' || (status === 'active' ? !habit.isArchived : habit.isArchived)
      const matchesFrequency = frequencyFilter === 'all' || habit.frequencyType === frequencyFilter
      const matchesCategory = categoryFilter === 'all' || habit.category === categoryFilter

      return matchesStatus && matchesFrequency && matchesCategory
    })

    return [...items].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'newest') return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
      if (sortBy === 'streak') return b.streak.current - a.streak.current
      return a.sortOrder - b.sortOrder
    })
  }, [habits, status, frequencyFilter, categoryFilter, sortBy])

  const openCreate = () => {
    setEditingMode('create')
    setEditingHabit(null)
    setIsEditorOpen(true)
  }

  const openEdit = (habit: Habit) => {
    setEditingMode('edit')
    setEditingHabit(habit)
    setIsEditorOpen(true)
  }

  return (
    <section className="space-y-4">
      <AppPageHeader
        eyebrow="Habits"
        title="Manage habits"
        description="Structure your habit system with focused list management, quick filters, and compact editing flows."
        actions={<ActionButton onClick={openCreate}>Create habit</ActionButton>}
      />

      <section className="rounded-2xl border border-border bg-surface-secondary p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.14em] text-content-muted">
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)} className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm font-medium normal-case tracking-normal text-content-primary">
              {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{humanize(option)}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.14em] text-content-muted">
            Frequency
            <select value={frequencyFilter} onChange={(event) => setFrequencyFilter(event.target.value as HabitFrequencyType | 'all')} className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm font-medium normal-case tracking-normal text-content-primary">
              {FREQUENCY_FILTER_OPTIONS.map((option) => <option key={option} value={option}>{humanize(option)}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.14em] text-content-muted">
            Area
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as HabitCategory | 'all')} className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm font-medium normal-case tracking-normal text-content-primary">
              <option value="all">All</option>
              {categories.map((category) => <option key={category} value={category}>{humanize(category)}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.14em] text-content-muted">
            Sort by
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortKey)} className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm font-medium normal-case tracking-normal text-content-primary">
              {SORT_OPTIONS.map((option) => <option key={option} value={option}>{humanize(option)}</option>)}
            </select>
          </label>
        </div>
      </section>

      {filteredHabits.length === 0 ? (
        <EmptyState title="No habits match these filters" description="Try another filter combination or create a new habit." action={<ActionButton onClick={openCreate}>Create habit</ActionButton>} />
      ) : (
        <section className="overflow-hidden rounded-2xl border border-border bg-surface-secondary">
          <div className="hidden grid-cols-[2fr,1fr,1fr,1fr,0.8fr,1.1fr] gap-3 border-b border-border bg-surface-elevated px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-content-muted md:grid">
            <span>Name</span><span>Area</span><span>Frequency</span><span>Target</span><span>State</span><span>Actions</span>
          </div>
          <div className="divide-y divide-border">
            {filteredHabits.map((habit) => (
              <article key={habit.id} className="grid gap-3 px-4 py-3 md:grid-cols-[2fr,1fr,1fr,1fr,0.8fr,1.1fr] md:items-center">
                <div>
                  <p className="text-sm font-semibold text-content-primary">{habit.emoji ?? '✨'} {habit.name}</p>
                  <p className="text-xs text-content-secondary">Streak {habit.streak.current} · {habit.description || 'No description'}</p>
                </div>
                <p className="text-xs text-content-secondary md:text-sm">{humanize(habit.category)}</p>
                <p className="text-xs text-content-secondary md:text-sm">{frequencyLabel(habit)}</p>
                <p className="text-xs text-content-secondary md:text-sm">{habit.targetValue ? `${habit.targetValue} ${habit.unit ?? ''}`.trim() : '—'}</p>
                <p className="text-xs font-semibold md:text-sm">{habit.isArchived ? 'Archived' : 'Active'}</p>
                <div className="flex flex-wrap gap-2">
                  <Link to={`/habits/${habit.id}`} className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-content-primary">Details</Link>
                  <button type="button" onClick={() => openEdit(habit)} className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-content-primary">Edit</button>
                  <button type="button" onClick={() => (habit.isArchived ? unarchiveHabit(habit.id) : archiveHabit(habit.id))} className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-content-primary">{habit.isArchived ? 'Restore' : 'Archive'}</button>
                  <button type="button" onClick={() => setHabitToDelete(habit)} className="rounded-lg border border-rose-300 px-2.5 py-1 text-xs font-semibold text-rose-600">Delete</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {isEditorOpen ? (
        <div className="fixed inset-0 z-40 bg-black/40 p-0 md:p-6">
          <section className="ml-auto h-full w-full overflow-y-auto border-l border-border bg-surface-primary p-4 md:h-auto md:max-h-[92vh] md:max-w-xl md:rounded-2xl md:border md:shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-content-primary">{editingMode === 'create' ? 'Create habit' : 'Edit habit'}</h2>
              <SecondaryButton onClick={() => setIsEditorOpen(false)}>Close</SecondaryButton>
            </div>
            <HabitForm
              submitLabel={editingMode === 'create' ? 'Create habit' : 'Save changes'}
              initialValues={editingHabit ? {
                name: editingHabit.name,
                description: editingHabit.description,
                category: editingHabit.category,
                frequencyType: editingHabit.frequencyType,
                targetDays: editingHabit.targetDays,
                targetValue: editingHabit.targetValue,
                unit: editingHabit.unit,
                reminderTime: editingHabit.reminderTime,
                notes: editingHabit.notes,
                emoji: editingHabit.emoji,
                icon: editingHabit.icon,
                isArchived: editingHabit.isArchived,
              } : undefined}
              onCancel={() => setIsEditorOpen(false)}
              onSubmit={(values) => {
                if (editingHabit) {
                  updateHabit(editingHabit.id, values)
                } else {
                  createHabit(values)
                }

                setIsEditorOpen(false)
              }}
            />
          </section>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(habitToDelete)}
        title="Delete habit?"
        confirmLabel="Delete"
        onCancel={() => setHabitToDelete(null)}
        onConfirm={() => {
          if (!habitToDelete) return
          deleteHabit(habitToDelete.id)
          if (editingHabit?.id === habitToDelete.id) {
            setEditingHabit(null)
            setIsEditorOpen(false)
          }
          setHabitToDelete(null)
        }}
      >
        This permanently removes {habitToDelete?.name ?? 'this habit'} from local data.
      </ConfirmDialog>
    </section>
  )
}
