import { useMemo, useState } from 'react'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { HabitCard } from '../components/HabitCard'
import { HabitForm } from '../components/HabitForm'
import { useHabits } from '../hooks/useHabits'
import type { Habit, HabitCategory } from '../types/models'
import { storage } from '../utils/storage'
import { ActionButton, AppPageHeader, EmptyState, FilterChips, SectionCard, StatCard } from '../components/ui/primitives'

type CategoryFilter = HabitCategory | 'all'
type ArchiveFilter = 'active' | 'archived' | 'all'
const CATEGORY_FILTERS: CategoryFilter[] = ['all', 'health', 'fitness', 'mindfulness', 'productivity', 'learning', 'relationships', 'finance', 'custom']
const humanize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

export const HabitsPage = () => {
  const { habits, activeCount, archivedCount, createHabit, updateHabit, archiveHabit, unarchiveHabit, deleteHabit } = useHabits()
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>('active')
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null)

  const filteredHabits = useMemo(() => habits.filter((habit) => (categoryFilter === 'all' || habit.category === categoryFilter) && (archiveFilter === 'all' || (archiveFilter === 'active' ? !habit.isArchived : habit.isArchived))), [habits, categoryFilter, archiveFilter])
  const checkIns = storage.list('checkIns')

  return (
    <section className="space-y-6">
      <AppPageHeader eyebrow="Habits" title="Habit management" description="Create, filter, and maintain routines with a cleaner workflow." actions={!showCreateForm ? <ActionButton onClick={() => { setEditingHabit(null); setShowCreateForm(true) }}>Add habit</ActionButton> : null} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value={String(habits.length)} />
        <StatCard label="Active" value={String(activeCount)} />
        <StatCard label="Archived" value={String(archivedCount)} />
      </div>
      {showCreateForm ? <SectionCard title="Create habit"><HabitForm submitLabel="Create habit" onCancel={() => setShowCreateForm(false)} onSubmit={(values) => { createHabit(values); setShowCreateForm(false) }} /></SectionCard> : null}
      <SectionCard title="Filters" description="Refine the list quickly.">
        <div className="space-y-3">
          <FilterChips options={CATEGORY_FILTERS.map((value) => ({ value, label: humanize(value) }))} value={categoryFilter} onChange={(value) => setCategoryFilter(value as CategoryFilter)} />
          <FilterChips options={[{ value: 'active', label: 'Active' }, { value: 'archived', label: 'Archived' }, { value: 'all', label: 'All' }]} value={archiveFilter} onChange={(value) => setArchiveFilter(value as ArchiveFilter)} />
        </div>
      </SectionCard>
      {filteredHabits.length === 0 ? <EmptyState title="No habits found" description="Adjust filters or create a new habit." /> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{filteredHabits.map((habit) => editingHabit?.id === habit.id ? <HabitForm key={habit.id} initialValues={{ name: habit.name, description: habit.description, category: habit.category, frequencyType: habit.frequencyType, targetDays: habit.targetDays }} submitLabel="Save changes" onCancel={() => setEditingHabit(null)} onSubmit={(values) => { updateHabit(habit.id, values); setEditingHabit(null) }} /> : <HabitCard key={habit.id} habit={habit} checkIns={checkIns} onEdit={(nextHabit) => { setShowCreateForm(false); setEditingHabit(nextHabit) }} onDelete={() => setHabitToDelete(habit)} onArchiveToggle={(habitId, shouldArchive) => shouldArchive ? archiveHabit(habitId) : unarchiveHabit(habitId)} />)}</div>}

      <ConfirmDialog open={Boolean(habitToDelete)} title="Delete habit?" confirmLabel="Delete" onCancel={() => setHabitToDelete(null)} onConfirm={() => { if (!habitToDelete) return; deleteHabit(habitToDelete.id); if (editingHabit?.id === habitToDelete.id) setEditingHabit(null); setHabitToDelete(null) }}>
        This will remove {habitToDelete?.name ?? 'this habit'} from local data.
      </ConfirmDialog>
    </section>
  )
}
