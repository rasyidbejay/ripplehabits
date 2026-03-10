import type { CheckIn, Habit } from '../types/models'
import { calculateCurrentStreak, getStreakMilestone } from '../utils/streaks'
import { StreakBadge } from './StreakBadge'

export const TodayHabitItem = ({ habit, checkIn, checkIns, onToggle, onSaveNotes }: { habit: Habit; checkIn?: CheckIn; checkIns: CheckIn[]; onToggle: (habitId: Habit['id']) => void; onSaveNotes: (habitId: Habit['id'], notes: string) => void }) => {
  const currentStreak = calculateCurrentStreak(habit, checkIns)
  const milestone = getStreakMilestone(currentStreak)
  const completed = Boolean(checkIn?.completed)

  return (
    <article className={`rounded-2xl border p-4 transition ${completed ? 'border-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30' : 'border-border bg-surface-secondary'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className={`text-base font-semibold ${completed ? 'text-emerald-700 line-through dark:text-emerald-300' : 'text-content-primary'}`}>{habit.name}</h3>
          {habit.description ? <p className="mt-1 text-sm text-content-secondary">{habit.description}</p> : null}
          <div className="mt-2 flex items-center gap-2 text-xs text-content-muted">
            <span>{currentStreak}d streak</span>
            {milestone ? <StreakBadge milestone={milestone} /> : null}
          </div>
        </div>
        <button type="button" onClick={() => onToggle(habit.id)} className={`rounded-xl px-3 py-2 text-sm font-semibold ${completed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'border border-border bg-surface-elevated text-content-primary'}`}>
          {completed ? 'Completed' : 'Mark done'}
        </button>
      </div>
      <textarea key={`${habit.id}-${checkIn?.notes ?? ''}`} defaultValue={checkIn?.notes ?? ''} onBlur={(event) => onSaveNotes(habit.id, event.target.value)} rows={2} placeholder="Optional note" className="mt-3 w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40" />
    </article>
  )
}
