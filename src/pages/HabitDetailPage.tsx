import { eachDayOfInterval, endOfDay, format, getDay, isSameDay, parseISO, startOfDay, subDays } from 'date-fns'
import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CompletionLineChart } from '../components/charts/CompletionLineChart'
import { useHabits } from '../hooks/useHabits'
import type { CheckIn } from '../types/models'
import { calculateCurrentStreak, calculateLongestStreak } from '../utils/streaks'
import { storage } from '../utils/storage'

type TimeRange = '7d' | '30d' | '90d'

const RANGE_OPTIONS: { value: TimeRange; label: string; days: number }[] = [
  { value: '7d', label: 'Weekly', days: 7 },
  { value: '30d', label: 'Monthly', days: 30 },
  { value: '90d', label: '3 months', days: 90 },
]

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const panelClass = 'rounded-2xl border border-border bg-surface-secondary p-4'

const calculateWeeklyTarget = (habit: { frequencyType: string; targetDays: string[]; targetValue?: number }) => {
  if (habit.frequencyType === 'daily') return 7
  if (habit.frequencyType === 'specific_days') return Math.max(1, habit.targetDays.length)
  if (habit.frequencyType === 'custom_target') return Math.max(1, habit.targetValue ?? 1)
  return 1
}

const buildStreakRuns = (checkIns: CheckIn[], habitId: string) => {
  const completedDays = Array.from(
    new Set(
      checkIns
        .filter((checkIn) => checkIn.habitId === habitId && checkIn.completed)
        .map((checkIn) => checkIn.date),
    ),
  )
    .map((date) => parseISO(date))
    .sort((a, b) => a.getTime() - b.getTime())

  if (completedDays.length === 0) {
    return []
  }

  const runs: Array<{ start: Date; end: Date; length: number }> = []
  let start = completedDays[0]
  let previous = completedDays[0]

  for (let index = 1; index < completedDays.length; index += 1) {
    const current = completedDays[index]
    const dayDelta = Math.round((startOfDay(current).getTime() - startOfDay(previous).getTime()) / 86400000)

    if (dayDelta === 1) {
      previous = current
      continue
    }

    const length = Math.round((startOfDay(previous).getTime() - startOfDay(start).getTime()) / 86400000) + 1
    runs.push({ start, end: previous, length })
    start = current
    previous = current
  }

  const finalLength = Math.round((startOfDay(previous).getTime() - startOfDay(start).getTime()) / 86400000) + 1
  runs.push({ start, end: previous, length: finalLength })

  return runs.sort((a, b) => b.end.getTime() - a.end.getTime()).slice(0, 6)
}

export const HabitDetailPage = () => {
  const { habitId } = useParams<{ habitId: string }>()
  const navigate = useNavigate()
  const { habits } = useHabits()
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [noteDraft, setNoteDraft] = useState('')
  const [checkIns, setCheckIns] = useState<CheckIn[]>(() => storage.list('checkIns'))

  const habit = habits.find((item) => item.id === habitId)

  const selectedDays = RANGE_OPTIONS.find((range) => range.value === timeRange)?.days ?? 30
  const dayRange = useMemo(
    () => eachDayOfInterval({ start: subDays(startOfDay(new Date()), selectedDays - 1), end: endOfDay(new Date()) }),
    [selectedDays],
  )

  const weeklyWindow = useMemo(
    () => eachDayOfInterval({ start: subDays(startOfDay(new Date()), 6), end: endOfDay(new Date()) }),
    [],
  )

  const analytics = useMemo(() => {
    if (!habit) {
      return null
    }

    const habitCheckIns = checkIns.filter((checkIn) => checkIn.habitId === habit.id)

    const trend = dayRange.map((day) => {
      const key = format(day, 'yyyy-MM-dd')
      const done = habitCheckIns.some((checkIn) => checkIn.completed && checkIn.date === key)
      return {
        key,
        date: format(day, selectedDays > 40 ? 'MMM d' : 'EEE d'),
        completionRate: done ? 100 : 0,
      }
    })

    const weeklyGoalTarget = calculateWeeklyTarget(habit)
    const weeklyCompletions = weeklyWindow.reduce((count, day) => {
      const key = format(day, 'yyyy-MM-dd')
      return count + (habitCheckIns.some((checkIn) => checkIn.completed && checkIn.date === key) ? 1 : 0)
    }, 0)

    const weekdayPattern = WEEKDAY_LABELS.map((label, weekdayIndex) => {
      const matchingDays = dayRange.filter((day) => getDay(day) === weekdayIndex)
      const completed = matchingDays.filter((day) => {
        const key = format(day, 'yyyy-MM-dd')
        return habitCheckIns.some((checkIn) => checkIn.completed && checkIn.date === key)
      }).length

      const completionRate = matchingDays.length ? Math.round((completed / matchingDays.length) * 100) : 0
      return { day: label, completionRate }
    })

    const notes = habitCheckIns
      .filter((checkIn) => checkIn.notes?.trim())
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())

    const consistencyDays = eachDayOfInterval({ start: subDays(startOfDay(new Date()), 83), end: endOfDay(new Date()) })
    const consistency = consistencyDays.map((day) => {
      const key = format(day, 'yyyy-MM-dd')
      const done = habitCheckIns.some((checkIn) => checkIn.completed && checkIn.date === key)
      return { key, value: done ? 100 : 0 }
    })

    return {
      currentStreak: calculateCurrentStreak(habit.id, checkIns),
      longestStreak: calculateLongestStreak(habit.id, checkIns),
      completionRate: trend.length ? Math.round(trend.reduce((sum, item) => sum + item.completionRate, 0) / trend.length) : 0,
      trend,
      weekdayPattern,
      weeklyGoalTarget,
      weeklyCompletions,
      streakHistory: buildStreakRuns(checkIns, habit.id),
      notes,
      consistency,
    }
  }, [checkIns, dayRange, habit, selectedDays, weeklyWindow])

  if (!habit) {
    return (
      <section className="space-y-3">
        <Link to="/progress" className="text-sm text-accent">← Back to progress</Link>
        <h1 className="text-2xl font-semibold">Habit not found</h1>
      </section>
    )
  }

  const addNote = () => {
    const trimmed = noteDraft.trim()
    if (!trimmed) return

    const todayKey = format(new Date(), 'yyyy-MM-dd')
    const existing = checkIns.find((checkIn) => checkIn.habitId === habit.id && isSameDay(parseISO(checkIn.date), new Date()))

    const nextCheckIns = existing
      ? storage.update(
          'checkIns',
          (checkIn) => checkIn.habitId === habit.id && checkIn.date === todayKey,
          (checkIn) => ({ ...checkIn, notes: checkIn.notes ? `${checkIn.notes}\n${trimmed}` : trimmed }),
        )
      : storage.create('checkIns', {
          habitId: habit.id,
          date: todayKey,
          completed: false,
          status: 'skipped',
          notes: trimmed,
        })

    setCheckIns(nextCheckIns)
    setNoteDraft('')
  }

  return (
    <div className="space-y-4">
      <header className="space-y-3">
        <button onClick={() => navigate(-1)} className="text-sm font-medium text-accent">← Back</button>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-content-muted">Habit detail</p>
            <h1 className="text-2xl font-semibold">{habit.emoji ? `${habit.emoji} ` : ''}{habit.name}</h1>
            <p className="text-sm text-content-muted">{habit.description || 'No description yet.'}</p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-content-muted">Range</span>
            <select value={timeRange} onChange={(event) => setTimeRange(event.target.value as TimeRange)} className="rounded-lg border border-border bg-surface-primary px-3 py-1.5">
              {RANGE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <section className="grid gap-3 sm:grid-cols-3">
            <article className={panelClass}><p className="text-xs text-content-muted">Current streak</p><p className="mt-1 text-2xl font-semibold">{analytics?.currentStreak ?? 0}d</p></article>
            <article className={panelClass}><p className="text-xs text-content-muted">Longest streak</p><p className="mt-1 text-2xl font-semibold">{analytics?.longestStreak ?? 0}d</p></article>
            <article className={panelClass}><p className="text-xs text-content-muted">Completion rate</p><p className="mt-1 text-2xl font-semibold">{analytics?.completionRate ?? 0}%</p></article>
          </section>

          <section className={panelClass}>
            <h2 className="text-sm font-semibold">Weekly goal progress</h2>
            <p className="mt-1 text-xs text-content-muted">{analytics?.weeklyCompletions ?? 0} of {analytics?.weeklyGoalTarget ?? 0} target completions this week.</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-tertiary">
              <div className="h-full bg-accent" style={{ width: `${Math.min(100, Math.round((((analytics?.weeklyCompletions ?? 0) / Math.max(1, analytics?.weeklyGoalTarget ?? 1)) * 100)))}%` }} />
            </div>
          </section>

          <section className={panelClass}>
            <h2 className="text-sm font-semibold">Completion rate trend</h2>
            <div className="mt-3 h-56 sm:h-64"><CompletionLineChart data={analytics?.trend ?? []} /></div>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className={panelClass}>
              <h2 className="text-sm font-semibold">Consistency grid</h2>
              <p className="mt-1 text-xs text-content-muted">Last 12 weeks of completion consistency.</p>
              <div className="mt-3 grid grid-cols-7 gap-1.5 sm:gap-2">
                {(analytics?.consistency ?? []).map((item) => (
                  <div key={item.key} className="h-5 rounded-sm border border-border/40 bg-accent" title={item.key} style={{ opacity: item.value ? 0.9 : 0.12 }} />
                ))}
              </div>
            </section>

            <section className={panelClass}>
              <h2 className="text-sm font-semibold">Weekday pattern</h2>
              <div className="mt-3 h-56 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.weekdayPattern ?? []} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip formatter={(value: number) => `${value}%`} />
                    <Bar dataKey="completionRate" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        </div>

        <aside className="space-y-4">
          <section className={panelClass}>
            <h2 className="text-sm font-semibold">Streak history</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {(analytics?.streakHistory.length ?? 0) === 0 ? (
                <li className="text-content-muted">No streak runs yet.</li>
              ) : (
                analytics?.streakHistory.map((run, index) => (
                  <li key={`${run.start.toISOString()}-${index}`} className="rounded-lg border border-border/60 px-3 py-2">
                    <p className="font-medium">{run.length} day run</p>
                    <p className="text-xs text-content-muted">{format(run.start, 'MMM d')} → {format(run.end, 'MMM d, yyyy')}</p>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className={panelClass}>
            <h2 className="text-sm font-semibold">Notes & history</h2>
            <div className="mt-3 space-y-2">
              <textarea value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} rows={3} className="w-full rounded-lg border border-border bg-surface-primary px-3 py-2 text-sm" placeholder="Add a note for today" />
              <button onClick={addNote} className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-white">Save note</button>
            </div>
            <ul className="mt-3 space-y-2">
              {(analytics?.notes.length ?? 0) === 0 ? (
                <li className="text-sm text-content-muted">No notes yet.</li>
              ) : (
                analytics?.notes.map((note) => (
                  <li key={`${note.date}-${note.notes}`} className="rounded-lg border border-border/60 px-3 py-2">
                    <p className="text-xs text-content-muted">{format(parseISO(note.date), 'MMM d, yyyy')}</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm">{note.notes}</p>
                  </li>
                ))
              )}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  )
}
