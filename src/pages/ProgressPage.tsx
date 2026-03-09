import { eachDayOfInterval, format, startOfDay, subDays } from 'date-fns'
import { useMemo } from 'react'
import { CompletionLineChart } from '../components/charts/CompletionLineChart'
import { useHabits } from '../hooks/useHabits'
import { storage } from '../utils/storage'
import { calculateCurrentStreak } from '../utils/streaks'

const cardClass = 'rounded-2xl border border-border bg-surface-secondary p-4'

export const ProgressChartCard = ({ data }: { data: { date: string; completionRate: number }[] }) => (
  <section className={cardClass}>
    <h2 className="text-sm font-semibold">Completion rate</h2>
    <div className="mt-3 h-56">
      <CompletionLineChart data={data} />
    </div>
  </section>
)

export const HeatmapCard = ({ values }: { values: number[] }) => (
  <section className={cardClass}>
    <h2 className="text-sm font-semibold">Consistency</h2>
    <div className="mt-3 grid grid-cols-7 gap-1.5">
      {values.map((value, i) => <div key={i} className="h-6 rounded" style={{ backgroundColor: value > 75 ? '#4f46e5' : value > 30 ? '#a5b4fc' : '#e5e7eb' }} />)}
    </div>
  </section>
)

export const WeekdayStatsCard = ({ values }: { values: { day: string; value: number }[] }) => (
  <section className={cardClass}>
    <h2 className="text-sm font-semibold">Weekday distribution</h2>
    <ul className="mt-3 space-y-2">
      {values.map((item) => (
        <li key={item.day} className="flex items-center gap-2 text-xs">
          <span className="w-16 text-content-muted">{item.day}</span>
          <div className="h-2 flex-1 rounded-full bg-surface-tertiary">
            <div className="h-2 rounded-full bg-accent" style={{ width: `${item.value}%` }} />
          </div>
          <span className="w-10 text-right">{item.value}%</span>
        </li>
      ))}
    </ul>
  </section>
)

export const StreakSummaryCard = ({ rows }: { rows: { name: string; streak: number }[] }) => (
  <section className={cardClass}>
    <h2 className="text-sm font-semibold">Habit streaks</h2>
    <ul className="mt-3 space-y-2">
      {rows.map((row) => (
        <li key={row.name} className="flex items-center justify-between border-b border-border pb-2 text-sm last:border-b-0">
          <span>{row.name}</span>
          <strong>{row.streak}d</strong>
        </li>
      ))}
    </ul>
  </section>
)

export const ProgressPage = () => {
  const { habits } = useHabits()
  const checkIns = storage.list('checkIns')

  const trend = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(startOfDay(new Date()), 13), end: startOfDay(new Date()) })
    return days.map((day) => {
      const dayKey = format(day, 'yyyy-MM-dd')
      const done = habits.filter((habit) => checkIns.some((checkIn) => checkIn.habitId === habit.id && checkIn.completed && checkIn.date === dayKey)).length
      return { date: format(day, 'MMM d'), completionRate: habits.length ? Math.round((done / habits.length) * 100) : 0 }
    })
  }, [habits, checkIns])

  const weekdayStats = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
    const matching = trend.filter((_, trendIndex) => trendIndex % 7 === index)
    const avg = matching.length ? Math.round(matching.reduce((acc, item) => acc + item.completionRate, 0) / matching.length) : 0
    return { day, value: avg }
  })

  const streakRows = habits
    .map((habit) => ({ name: habit.name, streak: calculateCurrentStreak(habit.id, checkIns) }))
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 5)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Progress</h2>
        <p className="text-sm text-content-muted">Weekly and monthly habit analytics.</p>
      </div>
      <ProgressChartCard data={trend} />
      <div className="grid gap-4 lg:grid-cols-2">
        <HeatmapCard values={trend.map((item) => item.completionRate)} />
        <WeekdayStatsCard values={weekdayStats} />
      </div>
      <StreakSummaryCard rows={streakRows} />
    </div>
  )
}
