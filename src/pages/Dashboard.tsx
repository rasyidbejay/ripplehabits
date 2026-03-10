import { format, formatISO, isSameDay, parseISO, subDays } from 'date-fns'
import { Link } from 'react-router-dom'
import { ChartContainer } from '../components/charts/ChartContainer'
import { CompletionLineChart } from '../components/charts/CompletionLineChart'
import { AppPageHeader, EmptyState, SectionCard, StatCard } from '../components/ui/primitives'
import { calculateCurrentStreak } from '../utils/streaks'
import { storage } from '../utils/storage'

const toPercent = (value: number) => `${Math.round(value)}%`

export const Dashboard = () => {
  const habits = storage.list('habits').filter((habit) => !habit.isArchived)
  const checkIns = storage.list('checkIns')
  const today = new Date()
  const completedToday = habits.filter((habit) => checkIns.some((checkIn) => checkIn.habitId === habit.id && checkIn.completed && isSameDay(parseISO(checkIn.date), today))).length
  const completionRateToday = habits.length === 0 ? 0 : (completedToday / habits.length) * 100
  const bestStreak = habits.reduce((best, habit) => Math.max(best, calculateCurrentStreak(habit, checkIns)), 0)

  const completionTrend = Array.from({ length: 7 }).map((_, index) => {
    const date = subDays(today, 6 - index)
    const dateKey = formatISO(date, { representation: 'date' })
    const completedCount = habits.filter((habit) => checkIns.some((checkIn) => checkIn.habitId === habit.id && checkIn.completed && checkIn.date === dateKey)).length
    return { date: format(date, 'EEE'), completionRate: habits.length === 0 ? 0 : Math.round((completedCount / habits.length) * 100) }
  })

  const habitsByMomentum = habits.map((habit) => ({ ...habit, streak: calculateCurrentStreak(habit, checkIns), completedCount: checkIns.filter((checkIn) => checkIn.habitId === habit.id && checkIn.completed).length })).sort((l, r) => r.streak - l.streak)

  return (
    <section className="space-y-6">
      <AppPageHeader eyebrow="Dashboard" title="Progress overview" description="Data-rich, calm insights into completion and momentum." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active habits" value={String(habits.length)} />
        <StatCard label="Completed today" value={`${completedToday}/${habits.length}`} />
        <StatCard label="Today's score" value={toPercent(completionRateToday)} />
        <StatCard label="Best streak" value={`${bestStreak}d`} />
      </div>
      {habits.length === 0 ? <EmptyState title="No habits yet" description="Create your first habit to unlock trend charts." action={<Link to="/habits" className="inline-flex min-h-11 items-center rounded-xl bg-accent px-4 text-sm font-semibold text-white">Create habit</Link>} /> : <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]"><ChartContainer title="7-day completion trend" description="How consistently your active habits were completed this week."><CompletionLineChart data={completionTrend} /></ChartContainer><SectionCard title="Habit momentum"> <ul className="space-y-2">{habitsByMomentum.slice(0, 6).map((habit) => <li key={habit.id} className="rounded-2xl border border-border bg-surface-elevated p-3"><div className="flex items-center justify-between"><p className="text-sm font-semibold">{habit.name}</p><span className="text-xs font-semibold text-accent">{habit.streak}d</span></div><p className="text-xs text-content-secondary">{habit.completedCount} completions</p></li>)}</ul></SectionCard></div>}
    </section>
  )
}
