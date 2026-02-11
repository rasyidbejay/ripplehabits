import { format } from 'date-fns'
import { TodayHabitItem } from '../components/TodayHabitItem'
import { useTodayHabits } from '../hooks/useTodayHabits'

export const TodayPage = () => {
  const { today, todayHabits, getCheckInForHabit, toggleCheckIn, updateNotes } =
    useTodayHabits()

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Today</h2>
        <p className="mt-1 text-sm text-slate-500">
          {format(today, 'EEEE, MMMM d')} · {todayHabits.length} active habits
        </p>
      </div>

      {todayHabits.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
          No habits scheduled for today.
        </div>
      ) : (
        <div className="grid gap-3">
          {todayHabits.map((habit) => (
            <TodayHabitItem
              key={habit.id}
              habit={habit}
              checkIn={getCheckInForHabit(habit.id)}
              onToggle={toggleCheckIn}
              onSaveNotes={updateNotes}
            />
          ))}
        </div>
      )}
    </section>
  )
}
