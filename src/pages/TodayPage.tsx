import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import { TodayHabitItem } from '../components/TodayHabitItem'
import { useTodayHabits } from '../hooks/useTodayHabits'

export const TodayPage = () => {
  const { today, todayHabits, checkIns, getCheckInForHabit, toggleCheckIn, updateNotes } =
    useTodayHabits()

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-border bg-surface-secondary p-4">
        <h2 className="text-lg font-semibold text-content-primary">Today</h2>
        <p className="mt-1 text-sm text-content-muted">
          {format(today, 'EEEE, MMMM d, yyyy')} · {todayHabits.length} active habits
        </p>
      </div>

      {todayHabits.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface-tertiary p-6 text-center text-sm text-content-muted">
          <p>No habits scheduled for today.</p>
          <Link
            to="/habits"
            className="mt-3 inline-flex text-sm font-medium text-accent hover:text-accent"
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
