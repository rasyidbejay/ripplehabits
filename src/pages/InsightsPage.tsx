import { useMemo } from 'react'
import { useHabits } from '../hooks/useHabits'

export const InsightsPage = () => {
  const { habits, totalHabits, activeCount, archivedCount, categories } = useHabits()

  const categoryBreakdown = useMemo(() => {
    return categories
      .map((category) => ({
        category,
        count: habits.filter((habit) => habit.category === category).length,
      }))
      .sort((a, b) => b.count - a.count)
  }, [categories, habits])

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
    </section>
  )
}
