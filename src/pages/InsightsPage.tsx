import { format, isSameDay, parseISO, startOfToday, subDays } from 'date-fns'
import { useHabits } from '../hooks/useHabits'

export const InsightsPage = () => {
  const { habits, stats } = useHabits()
  const today = startOfToday()

  const last7Days = Array.from({ length: 7 }).map((_, index) => {
    const day = subDays(today, 6 - index)
    const doneCount = habits.filter((habit) => habit.completedDates.some((date) => isSameDay(parseISO(date), day))).length

    return {
      label: format(day, 'EEE'),
      doneCount,
    }
  })

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold">Weekly pulse</h2>
        <p className="mt-1 text-sm text-slate-500">A quick look at your momentum over the last seven days.</p>

        <div className="mt-6 grid grid-cols-7 gap-2">
          {last7Days.map((day) => (
            <div key={day.label} className="text-center">
              <div className="mb-2 text-xs text-slate-500">{day.label}</div>
              <div className="flex h-24 items-end justify-center rounded-xl bg-slate-100 p-1">
                <div
                  className="w-full rounded-lg bg-indigo-500"
                  style={{ height: `${Math.max((day.doneCount / Math.max(stats.totalHabits, 1)) * 100, 6)}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-slate-600">{day.doneCount}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold">Snapshot</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>Total active habits: {stats.totalHabits}</li>
          <li>Completed today: {stats.completedToday}</li>
          <li>Current completion rate: {stats.completionRate}%</li>
        </ul>
      </div>
    </section>
  )
}
