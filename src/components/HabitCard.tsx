import type { CheckIn, Habit } from '../types/models'
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  getStreakMilestone,
} from '../utils/streaks'
import { StreakBadge } from './StreakBadge'

type HabitCardProps = {
  habit: Habit
  checkIns: CheckIn[]
  onEdit: (habit: Habit) => void
  onDelete: (habitId: string) => void
  onArchiveToggle: (habitId: string, shouldArchive: boolean) => void
}

const humanize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

export const HabitCard = ({
  habit,
  checkIns,
  onEdit,
  onDelete,
  onArchiveToggle,
}: HabitCardProps) => {
  const currentStreak = calculateCurrentStreak(habit.id, checkIns)
  const longestStreak = calculateLongestStreak(habit.id, checkIns)
  const milestone = getStreakMilestone(currentStreak)
  const hasPersonalBest = currentStreak > 0 && currentStreak === longestStreak

  return (
    <article className="rounded-xl border border-border bg-surface-secondary p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-content-primary">{habit.name}</h3>
          <p className="mt-1 text-xs text-content-muted">{humanize(habit.category)} · {humanize(habit.frequencyType)}</p>
        </div>
        <span
          className={[
            'rounded-full px-2 py-0.5 text-xs font-medium',
            habit.isArchived
              ? 'bg-surface-tertiary text-content-secondary'
              : 'bg-emerald-100 text-emerald-700',
          ].join(' ')}
        >
          {habit.isArchived ? 'Archived' : 'Active'}
        </span>
      </div>

      {habit.description ? (
        <p className="mt-3 text-sm text-content-secondary">{habit.description}</p>
      ) : null}

      <div className="mt-3 space-y-1 text-sm">
        <p className={currentStreak > 0 ? 'font-medium text-content-secondary' : 'text-content-muted'}>
          {currentStreak > 0
            ? `🔥 ${currentStreak} day${currentStreak === 1 ? '' : 's'}`
            : 'No active streak'}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {milestone ? <StreakBadge milestone={milestone} /> : null}
          {hasPersonalBest ? (
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
              🏆 Personal best!
            </span>
          ) : null}
        </div>
        {longestStreak > 0 ? (
          <p className="text-xs text-content-muted">Best: {longestStreak} days</p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onEdit(habit)}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-content-secondary hover:bg-surface-tertiary"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onArchiveToggle(habit.id, !habit.isArchived)}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-content-secondary hover:bg-surface-tertiary"
        >
          {habit.isArchived ? 'Unarchive' : 'Archive'}
        </button>
        <button
          type="button"
          onClick={() => onDelete(habit.id)}
          className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
        >
          Delete
        </button>
      </div>
    </article>
  )
}
