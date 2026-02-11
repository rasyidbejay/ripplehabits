import { isSameDay, parseISO, startOfToday } from 'date-fns'
import { HabitCard } from '../components/HabitCard'
import { HabitForm } from '../components/HabitForm'
import { useHabits } from '../hooks/useHabits'

export const DashboardPage = () => {
  const { habits, stats, addHabit, removeHabit, toggleCompleteToday } = useHabits()
  const today = startOfToday()

  return (
    <section>
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total habits</p>
          <p className="mt-2 text-2xl font-semibold">{stats.totalHabits}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Done today</p>
          <p className="mt-2 text-2xl font-semibold">{stats.completedToday}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Completion</p>
          <p className="mt-2 text-2xl font-semibold text-indigo-600">{stats.completionRate}%</p>
        </div>
      </div>

      <HabitForm onAddHabit={addHabit} />

      {habits.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
          No habits yet. Add one above to start building your streak.
        </div>
      ) : (
        <div className="grid gap-3">
          {habits.map((habit) => {
            const isCompletedToday = habit.completedDates.some((date) => isSameDay(parseISO(date), today))

            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                isCompletedToday={isCompletedToday}
                onToggleToday={toggleCompleteToday}
                onDelete={removeHabit}
              />
            )
          })}
        </div>
      )}
    </section>
  )
}
