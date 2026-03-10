import type { CheckIn, Habit } from '../types/models'
import { calculateCurrentStreak, calculateLongestStreak } from '../utils/streaks'
import { ActionButton, SecondaryButton } from './ui/primitives'

const humanize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

export const HabitCard = ({ habit, checkIns, onEdit, onDelete, onArchiveToggle }: { habit: Habit; checkIns: CheckIn[]; onEdit: (habit: Habit) => void; onDelete: (habitId: string) => void; onArchiveToggle: (habitId: string, shouldArchive: boolean) => void }) => {
  const currentStreak = calculateCurrentStreak(habit, checkIns)
  const longestStreak = calculateLongestStreak(habit, checkIns)

  return (
    <article className="rounded-2xl border border-border bg-surface-secondary p-4 shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-content-primary">{habit.name}</h3>
          <p className="text-xs text-content-muted">{humanize(habit.category)} · {habit.frequencyType.replace('_', ' ')}</p>
        </div>
        <span className="rounded-full border border-border px-2 py-1 text-xs text-content-secondary">{habit.isArchived ? 'Archived' : 'Active'}</span>
      </div>
      {habit.description ? <p className="mt-2 text-sm text-content-secondary">{habit.description}</p> : null}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl border border-border bg-surface-elevated p-2"><p className="text-content-muted">Current streak</p><p className="font-semibold text-content-primary">{currentStreak} days</p></div>
        <div className="rounded-xl border border-border bg-surface-elevated p-2"><p className="text-content-muted">Best streak</p><p className="font-semibold text-content-primary">{longestStreak} days</p></div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <SecondaryButton onClick={() => onEdit(habit)}>Edit</SecondaryButton>
        <SecondaryButton onClick={() => onArchiveToggle(habit.id, !habit.isArchived)}>{habit.isArchived ? 'Unarchive' : 'Archive'}</SecondaryButton>
        <ActionButton className="bg-rose-600 hover:brightness-100" onClick={() => onDelete(habit.id)}>Delete</ActionButton>
      </div>
    </article>
  )
}
