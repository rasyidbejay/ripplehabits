import { format } from 'date-fns'
import { useMemo, useState } from 'react'
import { useTodayHabits } from '../hooks/useTodayHabits'

export const HabitRow = ({
  name,
  subtext,
  done,
  onToggle,
}: {
  name: string
  subtext: string
  done: boolean
  onToggle: () => void
}) => (
  <div className="flex items-center gap-3 border-b border-border px-3 py-3 last:border-b-0">
    <button onClick={onToggle} className={`h-6 w-6 rounded-full border ${done ? 'border-accent bg-accent' : 'border-border-strong bg-surface-secondary'}`} />
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium">{name}</p>
      <p className="text-xs text-content-muted">{subtext}</p>
    </div>
    <button onClick={onToggle} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${done ? 'bg-emerald-100 text-emerald-700' : 'bg-accent-light text-accent'}`}>
      {done ? 'Done' : 'Log'}
    </button>
  </div>
)

export const HabitSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="overflow-hidden rounded-2xl border border-border bg-surface-secondary">
    <div className="border-b border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-content-muted">{title}</div>
    {children}
  </section>
)

export const JournalHeader = ({ onHideCompleted, hideCompleted }: { onHideCompleted: () => void; hideCompleted: boolean }) => (
  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
    <div>
      <h2 className="text-2xl font-semibold">Today</h2>
      <p className="text-sm text-content-muted">{format(new Date(), 'EEEE, MMM d')}</p>
    </div>
    <div className="flex items-center gap-2">
      <button className="rounded-lg border border-border bg-surface-secondary px-3 py-1.5 text-sm">All Habits</button>
      <button onClick={onHideCompleted} className="rounded-lg border border-border bg-surface-secondary px-3 py-1.5 text-sm">
        {hideCompleted ? 'Show completed' : 'Hide completed'}
      </button>
    </div>
  </div>
)

export const InsightsPanel = ({ total, done }: { total: number; done: number }) => {
  const rate = total ? Math.round((done / total) * 100) : 0
  return (
    <aside className="hidden w-72 shrink-0 space-y-3 border-l border-border pl-4 xl:block">
      <div className="rounded-xl border border-border bg-surface-secondary p-3">
        <p className="text-xs text-content-muted">Current streak</p>
        <p className="text-2xl font-semibold">{done} days</p>
      </div>
      <div className="rounded-xl border border-border bg-surface-secondary p-3">
        <p className="text-xs text-content-muted">Success rate</p>
        <p className="text-2xl font-semibold">{rate}%</p>
      </div>
      <div className="rounded-xl border border-border bg-surface-secondary p-3">
        <p className="text-xs text-content-muted">Monthly average</p>
        <p className="text-2xl font-semibold">{Math.max(1, Math.floor(rate * 0.9))}%</p>
      </div>
    </aside>
  )
}

export const JournalPage = () => {
  const { todayHabits, getCheckInForHabit, toggleCheckIn } = useTodayHabits()
  const [hideCompleted, setHideCompleted] = useState(false)
  const doneCount = useMemo(() => todayHabits.filter((habit) => getCheckInForHabit(habit.id)?.completed).length, [todayHabits, getCheckInForHabit])

  const visibleHabits = todayHabits.filter((habit) => !hideCompleted || !getCheckInForHabit(habit.id)?.completed)

  return (
    <div className="flex gap-4">
      <div className="min-w-0 flex-1 space-y-4">
        <JournalHeader onHideCompleted={() => setHideCompleted((prev) => !prev)} hideCompleted={hideCompleted} />
        <HabitSection title="All Habits">
          {visibleHabits.map((habit) => {
            const done = Boolean(getCheckInForHabit(habit.id)?.completed)
            return (
              <HabitRow
                key={habit.id}
                name={habit.name}
                subtext={habit.unit ? `Target: ${habit.targetValue || 1} ${habit.unit}` : `Streak: ${habit.streak.current} days`}
                done={done}
                onToggle={() => toggleCheckIn(habit.id)}
              />
            )
          })}
          {visibleHabits.length === 0 ? <p className="px-4 py-8 text-sm text-content-muted">No habits in this view.</p> : null}
        </HabitSection>
      </div>
      <InsightsPanel total={todayHabits.length} done={doneCount} />
    </div>
  )
}
