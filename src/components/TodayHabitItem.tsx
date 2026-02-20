import type { CheckIn, Habit } from '../types/models'

type TodayHabitItemProps = {
  habit: Habit
  checkIn?: CheckIn
  onToggle: (habitId: Habit['id']) => void
  onSaveNotes: (habitId: Habit['id'], notes: string) => void
}

export const TodayHabitItem = ({
  habit,
  checkIn,
  onToggle,
  onSaveNotes,
}: TodayHabitItemProps) => {
  return (
    <article
      className={[
        'space-y-3 rounded-xl border p-4 transition',
        checkIn?.completed
          ? 'border-emerald-200 bg-emerald-50/60'
          : 'border-slate-200 bg-white',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3
            className={[
              'text-base font-semibold',
              checkIn?.completed ? 'text-emerald-800 line-through' : 'text-slate-900',
            ].join(' ')}
          >
            {habit.name}
          </h3>
          {habit.description ? (
            <p className="mt-1 text-sm text-slate-600">{habit.description}</p>
          ) : null}
          <p className="mt-2 text-xs text-slate-500">Streak: 0 days (coming soon)</p>
        </div>

        <button
          type="button"
          onClick={() => onToggle(habit.id)}
          className={[
            'rounded-lg px-3 py-1.5 text-sm font-medium transition',
            checkIn?.completed
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
          ].join(' ')}
        >
          {checkIn?.completed ? 'Completed' : 'Mark done'}
        </button>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">Notes (optional)</label>
        <textarea
          key={`${habit.id}-${checkIn?.notes ?? ''}`}
          defaultValue={checkIn?.notes ?? ''}
          onBlur={(event) => onSaveNotes(habit.id, event.target.value)}
          rows={2}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
          placeholder="Add context for today's check-in"
        />
      </div>
    </article>
  )
}
