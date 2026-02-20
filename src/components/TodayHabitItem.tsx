import type { CheckIn, Habit } from '../types/models'
import { calculateCurrentStreak, getStreakMilestone } from '../utils/streaks'
import { StreakBadge } from './StreakBadge'

type TodayHabitItemProps = {
  habit: Habit
  checkIn?: CheckIn
  checkIns: CheckIn[]
  onToggle: (habitId: Habit['id']) => void
  onSaveNotes: (habitId: Habit['id'], notes: string) => void
}

const getStreakLabel = (streakCount: number) => {
  if (streakCount <= 0) {
    return 'No streak yet'
  }

  return `🔥 ${streakCount} day${streakCount === 1 ? '' : 's'}`
}

export const TodayHabitItem = ({
  habit,
  checkIn,
  checkIns,
  onToggle,
  onSaveNotes,
}: TodayHabitItemProps) => {
  const currentStreak = calculateCurrentStreak(habit.id, checkIns)
  const milestone = getStreakMilestone(currentStreak)

  return (
    <article
      className={[
        'space-y-3 rounded-xl border p-4 transition',
        checkIn?.completed
          ? 'border-emerald-200 bg-emerald-50/60'
          : 'border-border bg-surface-secondary',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3
            className={[
              'text-base font-semibold',
              checkIn?.completed ? 'text-emerald-800 line-through' : 'text-content-primary',
            ].join(' ')}
          >
            {habit.name}
          </h3>
          {habit.description ? (
            <p className="mt-1 text-sm text-content-secondary">{habit.description}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <p className="text-xs text-content-muted">{getStreakLabel(currentStreak)}</p>
            {milestone ? <StreakBadge milestone={milestone} /> : null}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggle(habit.id)}
          className={[
            'rounded-lg px-3 py-1.5 text-sm font-medium transition',
            checkIn?.completed
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              : 'bg-surface-tertiary text-content-secondary hover:bg-surface-tertiary/80',
          ].join(' ')}
        >
          {checkIn?.completed ? 'Completed' : 'Mark done'}
        </button>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-content-secondary">Notes (optional)</label>
        <textarea
          key={`${habit.id}-${checkIn?.notes ?? ''}`}
          defaultValue={checkIn?.notes ?? ''}
          onBlur={(event) => onSaveNotes(habit.id, event.target.value)}
          rows={2}
          className="w-full rounded-lg border border-border bg-surface-tertiary px-3 py-2 text-sm text-content-primary outline-none ring-accent focus:ring-2"
          placeholder="Add context for today's check-in"
        />
      </div>
    </article>
  )
}
