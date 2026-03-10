import { format } from 'date-fns'
import { useMemo } from 'react'
import { CompletionLineChart } from '../components/charts/CompletionLineChart'
import { useHabits } from '../hooks/useHabits'
import {
  getConsistencyGridData,
  getMonthlySummary,
  getPerformanceListData,
  getWeekdayDistribution,
} from '../utils/habitAnalytics'
import { storage } from '../utils/storage'

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

  const consistency = useMemo(() => getConsistencyGridData(habits, checkIns, 14), [habits, checkIns])
  const monthly = useMemo(() => getMonthlySummary(habits, checkIns), [habits, checkIns])
  const weekdayStats = useMemo(() => getWeekdayDistribution(habits, checkIns), [habits, checkIns])
  const streakRows = useMemo(
    () => getPerformanceListData(habits, checkIns)
      .slice(0, 5)
      .map((row) => ({ name: row.name, streak: row.currentStreak })),
    [habits, checkIns],
  )

  const trend = consistency.map((item) => ({
    date: format(new Date(`${item.date}T00:00:00`), 'MMM d'),
    completionRate: item.completionRate,
  }))

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Progress</h2>
        <p className="text-sm text-content-muted">Weekly and monthly habit analytics.</p>
      </div>
      <ProgressChartCard data={trend} />
      <div className="grid gap-4 lg:grid-cols-2">
        <HeatmapCard values={monthly.consistency.map((item) => item.completionRate)} />
        <WeekdayStatsCard values={weekdayStats} />
      </div>
      <StreakSummaryCard rows={streakRows} />
      <p className="text-xs text-content-muted">Monthly completion: {monthly.completionRate}%</p>
    </div>
  )
}
