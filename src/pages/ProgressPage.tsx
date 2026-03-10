import { eachDayOfInterval, format, getDay, startOfDay, subDays } from 'date-fns'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CompletionLineChart } from '../components/charts/CompletionLineChart'
import { useHabits } from '../hooks/useHabits'
import { storage } from '../utils/storage'
import { calculateCurrentStreak, calculateLongestStreak } from '../utils/streaks'

const panelClass = 'rounded-2xl border border-border bg-surface-secondary p-4'

type TimeRange = '14d' | '30d' | '90d'

const RANGE_OPTIONS: { value: TimeRange; label: string; days: number }[] = [
  { value: '14d', label: '2 weeks', days: 14 },
  { value: '30d', label: '1 month', days: 30 },
  { value: '90d', label: '3 months', days: 90 },
]

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const CompletionRateSection = ({ data }: { data: { date: string; completionRate: number }[] }) => (
  <section className={panelClass}>
    <h2 className="text-sm font-semibold">Completion rate</h2>
    <p className="mt-1 text-xs text-content-muted">Daily completion trend for the selected scope.</p>
    <div className="mt-3 h-56 sm:h-64">
      <CompletionLineChart data={data} />
    </div>
  </section>
)

const ConsistencyHeatmap = ({ values }: { values: { key: string; value: number }[] }) => (
  <section className={panelClass}>
    <h2 className="text-sm font-semibold">Consistency grid</h2>
    <p className="mt-1 text-xs text-content-muted">Each cell is one day. Darker means better completion.</p>
    <div className="mt-3 grid grid-cols-7 gap-1.5 sm:gap-2">
      {values.map((item) => (
        <div
          key={item.key}
          className="h-6 rounded-sm border border-border/40 bg-accent"
          title={`${item.key}: ${item.value}%`}
          style={{ opacity: item.value === 0 ? 0.12 : Math.max(0.2, item.value / 100) }}
        />
      ))}
    </div>
  </section>
)

const HabitPerformanceSection = ({
  habits,
}: {
  habits: { id: string; name: string; completionRate: number; completions: number; strip: boolean[] }[]
}) => (
  <section className={panelClass}>
    <h2 className="text-sm font-semibold">Habit performance</h2>
    <p className="mt-1 text-xs text-content-muted">Top performers and habits that need attention.</p>
    <ul className="mt-3 space-y-2">
      {habits.map((habit) => (
        <li key={habit.id} className="rounded-xl border border-border/60 px-3 py-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <Link to={`/habits/${habit.id}`} className="truncate text-accent hover:underline">{habit.name}</Link>
            <span className="text-content-muted">{habit.completions} done · {habit.completionRate}%</span>
          </div>
          <div className="mt-2 grid grid-cols-14 gap-1">
            {habit.strip.map((done, index) => (
              <span key={`${habit.id}-${index}`} className={`h-2 rounded-sm ${done ? 'bg-accent' : 'bg-surface-tertiary'}`} />
            ))}
          </div>
        </li>
      ))}
    </ul>
  </section>
)

const WeekdayDistributionSection = ({ values }: { values: { day: string; completionRate: number }[] }) => (
  <section className={panelClass}>
    <h2 className="text-sm font-semibold">Weekday distribution</h2>
    <div className="mt-3 h-56 sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={values} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip formatter={(value: number) => `${value}%`} />
          <Bar dataKey="completionRate" fill="#6366f1" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </section>
)

const StreakSummarySection = ({
  currentStreak,
  bestStreak,
  trend,
}: {
  currentStreak: number
  bestStreak: number
  trend: number
}) => (
  <aside className={`${panelClass} h-fit`}>
    <h2 className="text-sm font-semibold">Streak summary</h2>
    <dl className="mt-3 space-y-3 text-sm">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <dt className="text-content-muted">Current streak</dt>
        <dd className="font-semibold">{currentStreak}d</dd>
      </div>
      <div className="flex items-center justify-between border-b border-border pb-2">
        <dt className="text-content-muted">Best streak</dt>
        <dd className="font-semibold">{bestStreak}d</dd>
      </div>
      <div className="flex items-center justify-between">
        <dt className="text-content-muted">Recent trend</dt>
        <dd className={`font-semibold ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </dd>
      </div>
    </dl>
  </aside>
)

export const ProgressPage = () => {
  const { habits } = useHabits()
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [habitFilter, setHabitFilter] = useState<'all' | string>('all')
  const checkIns = storage.list('checkIns')

  const activeHabits = habits.filter((habit) => !habit.isArchived)
  const scopedHabits = habitFilter === 'all'
    ? activeHabits
    : activeHabits.filter((habit) => habit.id === habitFilter)

  const selectedDays = RANGE_OPTIONS.find((range) => range.value === timeRange)?.days ?? 30
  const dayRange = eachDayOfInterval({
    start: subDays(startOfDay(new Date()), selectedDays - 1),
    end: startOfDay(new Date()),
  })


  const scopedCheckIns = checkIns.filter((checkIn) => scopedHabits.some((habit) => habit.id === checkIn.habitId && checkIn.completed))
  const uniqueCompletionDays = new Set(scopedCheckIns.map((checkIn) => checkIn.date)).size
  const lowData = activeHabits.length > 0 && uniqueCompletionDays < 5

  const analytics = useMemo(() => {
    const scopedHabitIds = new Set(scopedHabits.map((habit) => habit.id))

    const trend = dayRange.map((day) => {
      const key = format(day, 'yyyy-MM-dd')
      const completedHabits = new Set(
        checkIns
          .filter((checkIn) => checkIn.completed && checkIn.date === key && scopedHabitIds.has(checkIn.habitId))
          .map((checkIn) => checkIn.habitId),
      )

      return {
        key,
        date: format(day, selectedDays > 40 ? 'MMM d' : 'EEE d'),
        completionRate: scopedHabits.length
          ? Math.round((completedHabits.size / scopedHabits.length) * 100)
          : 0,
      }
    })

    const weekday = WEEKDAY_LABELS.map((label, weekdayIndex) => {
      const matching = trend.filter((item) => getDay(new Date(item.key)) === weekdayIndex)
      const completionRate = matching.length
        ? Math.round(matching.reduce((sum, item) => sum + item.completionRate, 0) / matching.length)
        : 0

      return { day: label, completionRate }
    })

    const performance = scopedHabits
      .map((habit) => {
        const habitCheckIns = checkIns.filter((checkIn) => checkIn.habitId === habit.id)
        const completions = dayRange.reduce((count, day) => {
          const key = format(day, 'yyyy-MM-dd')
          const done = habitCheckIns.some((checkIn) => checkIn.completed && checkIn.date === key)
          return count + (done ? 1 : 0)
        }, 0)

        const stripDays = dayRange.slice(-14)
        const strip = stripDays.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          return habitCheckIns.some((checkIn) => checkIn.completed && checkIn.date === key)
        })

        return {
          id: habit.id,
          name: habit.name,
          completions,
          completionRate: dayRange.length ? Math.round((completions / dayRange.length) * 100) : 0,
          strip,
          currentStreak: calculateCurrentStreak(habit.id, checkIns),
          bestStreak: calculateLongestStreak(habit.id, checkIns),
        }
      })
      .sort((a, b) => b.completionRate - a.completionRate)

    const top = performance.slice(0, 3)
    const needsAttention = performance.slice(-2).reverse()
    const performanceList = [...top, ...needsAttention.filter((item) => !top.some((topItem) => topItem.id === item.id))]

    const currentStreak = performance.length ? Math.max(...performance.map((habit) => habit.currentStreak)) : 0
    const bestStreak = performance.length ? Math.max(...performance.map((habit) => habit.bestStreak)) : 0

    const recent = trend.slice(-14)
    const prior = trend.slice(-28, -14)
    const recentAverage = recent.length ? recent.reduce((sum, item) => sum + item.completionRate, 0) / recent.length : 0
    const priorAverage = prior.length ? prior.reduce((sum, item) => sum + item.completionRate, 0) / prior.length : 0
    const trendDelta = Math.round(recentAverage - priorAverage)

    return {
      trend,
      weekday,
      heatmap: trend.map((item) => ({ key: item.key, value: item.completionRate })),
      performanceList,
      currentStreak,
      bestStreak,
      trendDelta,
    }
  }, [checkIns, dayRange, scopedHabits, selectedDays])

  if (activeHabits.length === 0) {
    return (
      <section className={panelClass}>
        <p className="text-xs uppercase tracking-[0.16em] text-content-muted">Progress</p>
        <h2 className="mt-2 text-xl font-semibold">No progress yet</h2>
        <p className="mt-1 text-sm text-content-muted">Create your first habit, then check in from Journal to start your analytics timeline.</p>
        <Link to="/habits" className="mt-4 inline-flex rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-white">Create your first habit</Link>
      </section>
    )
  }

  return (
    <div className="space-y-4">
      <header className="space-y-3">
        <div>
          <h2 className="text-2xl font-semibold">Progress</h2>
          <p className="text-sm text-content-muted">Your single analytics space for completion, consistency, and streaks.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-content-muted">Scope</span>
            <select
              value={habitFilter}
              onChange={(event) => setHabitFilter(event.target.value)}
              className="rounded-lg border border-border bg-surface-primary px-3 py-1.5"
            >
              <option value="all">All habits</option>
              {activeHabits.map((habit) => (
                <option key={habit.id} value={habit.id}>{habit.name}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-content-muted">Range</span>
            <select
              value={timeRange}
              onChange={(event) => setTimeRange(event.target.value as TimeRange)}
              className="rounded-lg border border-border bg-surface-primary px-3 py-1.5"
            >
              {RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>
      </header>

      {lowData ? (
        <section className="rounded-2xl border border-dashed border-border bg-surface-secondary p-4">
          <p className="text-sm font-semibold">Not enough data yet</p>
          <p className="mt-1 text-sm text-content-muted">Keep checking in from Journal for a few more days. Ripple will unlock clearer trends once there are at least 5 active check-in days.</p>
          <Link to="/journal" className="mt-3 inline-flex rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-content-secondary">Open Journal</Link>
        </section>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          <CompletionRateSection data={analytics.trend} />
          <div className="grid gap-4 lg:grid-cols-2">
            <ConsistencyHeatmap values={analytics.heatmap} />
            <WeekdayDistributionSection values={analytics.weekday} />
          </div>
          <HabitPerformanceSection habits={analytics.performanceList} />
        </div>
        <StreakSummarySection
          currentStreak={analytics.currentStreak}
          bestStreak={analytics.bestStreak}
          trend={analytics.trendDelta}
        />
      </div>
    </div>
  )
}
