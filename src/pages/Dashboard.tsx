import { format, formatISO, isSameDay, parseISO, subDays } from 'date-fns'
import { Link } from 'react-router-dom'
import { ChartContainer } from '../components/charts/ChartContainer'
import { CompletionLineChart } from '../components/charts/CompletionLineChart'
import { calculateCurrentStreak } from '../utils/streaks'
import { storage } from '../utils/storage'

const toPercent = (value: number) => `${Math.round(value)}%`

export const Dashboard = () => {
  const habits = storage.list('habits').filter((habit) => !habit.isArchived)
  const checkIns = storage.list('checkIns')

  const today = new Date()

  const completedToday = habits.filter((habit) =>
    checkIns.some(
      (checkIn) =>
        checkIn.habitId === habit.id && checkIn.completed && isSameDay(parseISO(checkIn.date), today),
    ),
  ).length

  const completionRateToday = habits.length === 0 ? 0 : (completedToday / habits.length) * 100

  const bestStreak = habits.reduce((best, habit) => {
    return Math.max(best, calculateCurrentStreak(habit.id, checkIns))
  }, 0)

  const totalCompletions = checkIns.filter((checkIn) => checkIn.completed).length

  const completionTrend = Array.from({ length: 7 }).map((_, index) => {
    const date = subDays(today, 6 - index)
    const dateKey = formatISO(date, { representation: 'date' })

    const completedCount = habits.filter((habit) =>
      checkIns.some((checkIn) => checkIn.habitId === habit.id && checkIn.completed && checkIn.date === dateKey),
    ).length

    const completionRate = habits.length === 0 ? 0 : (completedCount / habits.length) * 100

    return {
      date: format(date, 'EEE'),
      completionRate: Math.round(completionRate),
    }
  })

  const habitsByMomentum = habits
    .map((habit) => ({
      ...habit,
      streak: calculateCurrentStreak(habit.id, checkIns),
      completedCount: checkIns.filter((checkIn) => checkIn.habitId === habit.id && checkIn.completed).length,
    }))
    .sort((left, right) => right.streak - left.streak)

  return (
    <section className="space-y-6 md:space-y-8">
      <header className="rounded-2xl border border-border bg-surface-secondary p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Dashboard</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-content-primary md:text-3xl">
          Progress overview
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-content-secondary">
          Stay focused with a quick view of daily completion, momentum, and weekly consistency.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <article className="rounded-2xl border border-border bg-surface-secondary p-4">
          <p className="text-xs text-content-muted">Active habits</p>
          <p className="mt-1 text-2xl font-semibold text-content-primary">{habits.length}</p>
        </article>
        <article className="rounded-2xl border border-border bg-surface-secondary p-4">
          <p className="text-xs text-content-muted">Completed today</p>
          <p className="mt-1 text-2xl font-semibold text-content-primary">
            {completedToday}
            <span className="ml-1 text-sm font-medium text-content-secondary">/ {habits.length}</span>
          </p>
        </article>
        <article className="rounded-2xl border border-border bg-surface-secondary p-4">
          <p className="text-xs text-content-muted">Today's score</p>
          <p className="mt-1 text-2xl font-semibold text-content-primary">{toPercent(completionRateToday)}</p>
        </article>
        <article className="rounded-2xl border border-border bg-surface-secondary p-4">
          <p className="text-xs text-content-muted">Best active streak</p>
          <p className="mt-1 text-2xl font-semibold text-content-primary">{bestStreak}d</p>
        </article>
      </div>

      {habits.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface-tertiary p-8 text-center">
          <h2 className="text-lg font-semibold text-content-primary">No habits yet</h2>
          <p className="mt-2 text-sm text-content-secondary">
            Build your first habit to unlock progress charts and streak insights.
          </p>
          <Link
            to="/habits"
            className="mt-4 inline-flex rounded-xl bg-accent px-4 py-2 text-sm font-medium text-surface-secondary"
          >
            Create a habit
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
          <ChartContainer
            title="7-day completion trend"
            description="How consistently your active habits were completed this week."
          >
            <CompletionLineChart data={completionTrend} />
          </ChartContainer>

          <section className="rounded-xl border border-border bg-surface-secondary p-5">
            <header className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold text-content-primary">Habit momentum</h2>
              <p className="text-xs text-content-muted">Total completions: {totalCompletions}</p>
            </header>

            <ul className="mt-4 space-y-3">
              {habitsByMomentum.slice(0, 6).map((habit) => (
                <li key={habit.id} className="rounded-xl border border-border bg-surface-tertiary p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-content-primary">{habit.name}</p>
                      <p className="text-xs text-content-muted">{habit.category}</p>
                    </div>
                    <p className="text-sm font-semibold text-content-primary">{habit.streak}d streak</p>
                  </div>
                  <p className="mt-2 text-xs text-content-secondary">
                    {habit.completedCount} completed check-ins logged
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </section>
  )
}
