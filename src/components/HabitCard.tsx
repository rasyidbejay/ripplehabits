import type { Habit } from '../types/models'

type HabitCardProps = {
  habit: Habit
  onEdit: (habit: Habit) => void
  onDelete: (habitId: string) => void
  onArchiveToggle: (habitId: string, shouldArchive: boolean) => void
}

const humanize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

export const HabitCard = ({
  habit,
  onEdit,
  onDelete,
  onArchiveToggle,
}: HabitCardProps) => {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{habit.name}</h3>
          <p className="mt-1 text-xs text-slate-500">{humanize(habit.category)} · {humanize(habit.frequencyType)}</p>
        </div>
        <span
          className={[
            'rounded-full px-2 py-0.5 text-xs font-medium',
            habit.isArchived
              ? 'bg-slate-100 text-slate-600'
              : 'bg-emerald-100 text-emerald-700',
          ].join(' ')}
        >
          {habit.isArchived ? 'Archived' : 'Active'}
        </span>
      </div>

      {habit.description ? (
        <p className="mt-3 text-sm text-slate-600">{habit.description}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onEdit(habit)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onArchiveToggle(habit.id, !habit.isArchived)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
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
