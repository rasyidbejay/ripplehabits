import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import { TodayHabitItem } from '../components/TodayHabitItem'
import { useTodayHabits } from '../hooks/useTodayHabits'

export const TodayPage = () => {
  const { today, todayHabits, checkIns, getCheckInForHabit, toggleCheckIn, updateNotes } =
    useTodayHabits()

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Today</h2>
        <p className="mt-1 text-sm text-slate-500">
          {format(today, 'EEEE, MMMM d, yyyy')} · {todayHabits.length} active habits
        </p>
      </div>

      {todayHabits.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
          <p>No habits scheduled for today.</p>
          <Link
            to="/habits"
            className="mt-3 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Create your first habit →
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {todayHabits.map((habit) => (
            <TodayHabitItem
              key={habit.id}
              habit={habit}
              checkIn={getCheckInForHabit(habit.id)}
              checkIns={checkIns}
              onToggle={toggleCheckIn}
              onSaveNotes={updateNotes}
            />
          ))}
        </div>
      )}
    </section>
  )
}
