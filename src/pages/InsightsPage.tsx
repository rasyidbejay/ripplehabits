import { lazy, Suspense, useMemo } from 'react'
import { format, subDays } from 'date-fns'
import { StreakBadge } from '../components/StreakBadge'
import { useHabits } from '../hooks/useHabits'
import { storage } from '../utils/storage'
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  getStreakMilestone,
} from '../utils/streaks'

const ChartContainer = lazy(() =>
  import('../components/charts/ChartContainer').then((module) => ({
    default: module.ChartContainer,
  })),
)

const CompletionLineChart = lazy(() =>
  import('../components/charts/CompletionLineChart').then((module) => ({
    default: module.CompletionLineChart,
  })),
)

const CHART_DAYS = 7

export const InsightsPage = () => {
  const { habits, totalHabits, activeCount, archivedCount, categories } = useHabits()
  const checkIns = storage.list('checkIns')

  const categoryBreakdown = useMemo(() => {
    return categories
      .map((category) => ({
        category,
        count: habits.filter((habit) => habit.category === category).length,
      }))
      .sort((a, b) => b.count - a.count)
  }, [categories, habits])

  const completionTrend = useMemo(() => {
    const activeHabits = habits.filter((habit) => !habit.isArchived)
    const activeHabitIds = new Set(activeHabits.map((habit) => habit.id))
    const checkIns = storage.get('checkIns') ?? []

    return Array.from({ length: CHART_DAYS }, (_, index) => {
      const targetDate = subDays(new Date(), CHART_DAYS - index - 1)
      const dateKey = format(targetDate, 'yyyy-MM-dd')

      const completedForDay = new Set(
        checkIns
          .filter(
            (checkIn) =>
              checkIn.completed &&
              format(new Date(checkIn.date), 'yyyy-MM-dd') === dateKey &&
              activeHabitIds.has(checkIn.habitId),
          )
          .map((checkIn) => checkIn.habitId),
      )

      const completionRate =
        activeHabits.length === 0
          ? 0
          : Math.round((completedForDay.size / activeHabits.length) * 100)

      return {
        date: format(targetDate, 'MMM d'),
        completionRate,
      }
    })
  }, [habits])

  const topCurrentStreaks = useMemo(() => {
    return habits
      .filter((habit) => !habit.isArchived)
      .map((habit) => {
        const currentStreak = calculateCurrentStreak(habit.id, checkIns)

        return {
          habitId: habit.id,
          name: habit.name,
          currentStreak,
          milestone: getStreakMilestone(currentStreak),
        }
      })
      .sort((left, right) => right.currentStreak - left.currentStreak)
      .slice(0, 5)
  }, [checkIns, habits])

  const topLongestStreaks = useMemo(() => {
    return habits
      .filter((habit) => !habit.isArchived)
      .map((habit) => ({
        habitId: habit.id,
        name: habit.name,
        longestStreak: calculateLongestStreak(habit.id, checkIns),
      }))
      .sort((left, right) => right.longestStreak - left.longestStreak)
      .slice(0, 5)
  }, [checkIns, habits])

  const hasAnyStreaks = useMemo(() => {
    return topCurrentStreaks.some((item) => item.currentStreak > 0)
      || topLongestStreaks.some((item) => item.longestStreak > 0)
  }, [topCurrentStreaks, topLongestStreaks])

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold">Overview</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>Total habits: {totalHabits}</li>
          <li>Active habits: {activeCount}</li>
          <li>Archived habits: {archivedCount}</li>
        </ul>
      </div>

      <Suspense
        fallback={
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Loading chart...
          </div>
        }
      >
        <ChartContainer
          title="7-day completion trend"
          description="Percent of active habits completed each day"
        >
          <CompletionLineChart data={completionTrend} />
        </ChartContainer>
      </Suspense>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold">Category breakdown</h3>
        {categoryBreakdown.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No habits yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {categoryBreakdown.map((item) => (
              <li key={item.category} className="flex items-center justify-between">
                <span className="capitalize">{item.category}</span>
                <span className="font-medium">{item.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold">Top streaks</h3>
        {!hasAnyStreaks ? (
          <p className="mt-3 text-sm text-slate-500">
            Complete habits on the Today page to start building streaks!
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {topCurrentStreaks.map((item, index) => (
              <li key={item.habitId} className="rounded-lg border border-slate-100 px-3 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-slate-700">
                    {index + 1}. {item.name}
                  </p>
                  <p className="font-semibold text-slate-700">
                    🔥 {item.currentStreak} day{item.currentStreak === 1 ? '' : 's'}
                  </p>
                </div>
                {item.milestone ? (
                  <div className="mt-1">
                    <StreakBadge milestone={item.milestone} />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold">Longest streaks</h3>
        {!hasAnyStreaks ? (
          <p className="mt-3 text-sm text-slate-500">
            Complete habits on the Today page to start building streaks!
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {topLongestStreaks.map((item, index) => (
              <li key={item.habitId} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                <p className="font-medium text-slate-700">
                  {index + 1}. {item.name}
                </p>
                <p className="text-slate-600">Best: {item.longestStreak} days</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
