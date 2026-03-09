import { useState } from 'react'
import { HabitForm } from '../components/HabitForm'
import { useHabits } from '../hooks/useHabits'
import type { Habit } from '../types/models'

export const FilterBar = ({ showArchived, onToggle }: { showArchived: boolean; onToggle: () => void }) => (
  <div className="mb-3 flex items-center justify-between gap-2">
    <h2 className="text-2xl font-semibold">Manage Habits</h2>
    <button onClick={onToggle} className="rounded-lg border border-border bg-surface-secondary px-3 py-1.5 text-sm">
      {showArchived ? 'Show active' : 'Show archived'}
    </button>
  </div>
)

export const ManageHabitsList = ({ habits, onEdit }: { habits: Habit[]; onEdit: (habit: Habit) => void }) => (
  <section className="overflow-hidden rounded-2xl border border-border bg-surface-secondary">
    {habits.map((habit) => (
      <button key={habit.id} onClick={() => onEdit(habit)} className="flex w-full items-center justify-between border-b border-border px-4 py-3 text-left last:border-b-0">
        <span>
          <span className="block text-sm font-medium">{habit.name}</span>
          <span className="block text-xs text-content-muted">{habit.category}</span>
        </span>
        <span className="text-xs text-content-muted">{habit.isArchived ? 'Archived' : 'Active'}</span>
      </button>
    ))}
  </section>
)

export const ManageHabitsPage = () => {
  const { habits, createHabit, updateHabit } = useHabits()
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [adding, setAdding] = useState(false)

  const visible = habits.filter((habit) => (showArchived ? habit.isArchived : !habit.isArchived))

  return (
    <div className="space-y-4">
      <FilterBar showArchived={showArchived} onToggle={() => setShowArchived((prev) => !prev)} />
      <button onClick={() => { setAdding(true); setEditingHabit(null) }} className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white">Add habit</button>
      {adding ? (
        <div className="rounded-2xl border border-border bg-surface-secondary p-4">
          <HabitForm submitLabel="Create habit" onCancel={() => setAdding(false)} onSubmit={(values) => { createHabit(values); setAdding(false) }} />
        </div>
      ) : null}
      {editingHabit ? (
        <div className="rounded-2xl border border-border bg-surface-secondary p-4">
          <HabitForm
            initialValues={{
              name: editingHabit.name,
              description: editingHabit.description,
              category: editingHabit.category,
              frequencyType: editingHabit.frequencyType,
              targetDays: editingHabit.targetDays,
            }}
            submitLabel="Save habit"
            onCancel={() => setEditingHabit(null)}
            onSubmit={(values) => { updateHabit(editingHabit.id, values); setEditingHabit(null) }}
          />
        </div>
      ) : null}
      <ManageHabitsList habits={visible} onEdit={setEditingHabit} />
    </div>
  )
}
