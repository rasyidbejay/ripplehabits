import { formatDistanceToNow, parseISO } from 'date-fns'
import type { Habit } from '../types/habit'

type HabitCardProps = {
  habit: Habit
  isCompletedToday: boolean
  onToggleToday: (habitId: string) => void
  onDelete: (habitId: string) => void
}

export const HabitCard = ({ habit, isCompletedToday, onToggleToday, onDelete }: HabitCardProps) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-slate-900">{habit.name}</h3>
          <p className="text-sm text-slate-500">Started {formatDistanceToNow(parseISO(habit.createdAt), { addSuffix: true })}</p>
        </div>
        <button
          type="button"
          onClick={() => onDelete(habit.id)}
          className="text-xs text-slate-400 transition hover:text-slate-600"
        >
          Remove
        </button>
      </div>
      <button
        type="button"
        onClick={() => onToggleToday(habit.id)}
        className={[
          'mt-4 w-full rounded-xl border px-4 py-2 text-sm font-medium transition',
          isCompletedToday
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-slate-300 bg-slate-50 text-slate-700 hover:border-indigo-300 hover:text-indigo-600',
        ].join(' ')}
      >
        {isCompletedToday ? 'Completed today' : 'Mark as done today'}
      </button>
    </article>
  )
}
