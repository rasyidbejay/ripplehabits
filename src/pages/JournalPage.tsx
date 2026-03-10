import { format, startOfWeek } from 'date-fns'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTodayHabits } from '../hooks/useTodayHabits'
import type { Habit } from '../types/models'

type SortMode = 'manual' | 'name' | 'streak'

type HabitSectionData = {
  title: string
  habits: Habit[]
}

const categoryLabel: Record<Habit['category'], string> = {
  health: 'Health',
  fitness: 'Fitness',
  mindfulness: 'Mindfulness',
  productivity: 'Productivity',
  learning: 'Learning',
  relationships: 'Relationships',
  finance: 'Finance',
  custom: 'Custom',
}

const formatSubtext = (habit: Habit, currentValue: number, done: boolean) => {
  if (habit.targetValue || habit.unit) {
    const target = habit.targetValue ?? 1
    const unit = habit.unit ?? 'times'
    return `${currentValue}/${target} ${unit} • Streak ${habit.streak.current}d`
  }

  return done ? `Completed today • Streak ${habit.streak.current}d` : `Due today • Streak ${habit.streak.current}d`
}

const getDayPart = (habit: Habit, fallbackIndex: number) => {
  if (habit.reminderTime) {
    const hour = Number.parseInt(habit.reminderTime.split(':')[0] ?? '12', 10)
    if (hour < 12) return 'Morning'
    return 'Afternoon'
  }

  return fallbackIndex % 2 === 0 ? 'Morning' : 'Afternoon'
}

const sortHabits = (habits: Habit[], sortMode: SortMode) => {
  const list = [...habits]

  if (sortMode === 'name') {
    return list.sort((left, right) => left.name.localeCompare(right.name))
  }

  if (sortMode === 'streak') {
    return list.sort((left, right) => right.streak.current - left.streak.current)
  }

  return list.sort((left, right) => left.sortOrder - right.sortOrder)
}

const HabitSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="overflow-hidden rounded-xl border border-border bg-surface-secondary">
    <div className="border-b border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-content-muted">{title}</div>
    {children}
  </section>
)

const HabitRow = ({
  habit,
  done,
  value,
  onDone,
  onIncrement,
}: {
  habit: Habit
  done: boolean
  value: number
  onDone: () => void
  onIncrement: () => void
}) => {
  const isCountHabit = Boolean(habit.targetValue || habit.unit)
  const icon = habit.emoji || '•'

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3.5 last:border-b-0 sm:flex-nowrap sm:py-3">
      <button
        onClick={onDone}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm ${done ? 'border-accent bg-accent text-white' : 'border-border-strong bg-surface-primary text-content-muted'}`}
        aria-label={done ? `Mark ${habit.name} as incomplete` : `Mark ${habit.name} done`}
      >
        {done ? '✓' : icon}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium ${done ? 'text-content-muted line-through' : ''}`}>{habit.name}</p>
        <p className="truncate text-xs text-content-muted">{formatSubtext(habit, value, done)}</p>
      </div>
      <div className="flex w-full items-center gap-1.5 sm:w-auto">
        {isCountHabit ? (
          <button onClick={onIncrement} className="min-h-9 rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-content-secondary hover:bg-surface-tertiary">
            +1
          </button>
        ) : null}
        <button
          onClick={onDone}
          className={`min-h-9 rounded-md px-3 py-1.5 text-xs font-semibold ${done ? 'bg-emerald-100 text-emerald-700' : 'bg-accent-light text-accent'}`}
        >
          {isCountHabit ? 'Log' : 'Done'}
        </button>
        <Link to={`/habits/${habit.id}`} className="ml-auto min-h-9 rounded-md border border-border px-3 py-1.5 text-xs text-content-muted sm:ml-0" aria-label={`Open details for ${habit.name}`}>
          Details
        </Link>
      </div>
    </div>
  )
}

export const JournalPage = () => {
  const { today, todayHabits, checkIns, getCheckInForHabit, toggleCheckIn, incrementCheckIn } = useTodayHabits()
  const [hideCompleted, setHideCompleted] = useState(false)
  const [sortMode, setSortMode] = useState<SortMode>('manual')
  const [selectedCategory, setSelectedCategory] = useState<'all' | Habit['category']>('all')

  const completedCount = useMemo(
    () => todayHabits.filter((habit) => getCheckInForHabit(habit.id)?.completed).length,
    [todayHabits, getCheckInForHabit],
  )

  const completionRate = todayHabits.length > 0 ? Math.round((completedCount / todayHabits.length) * 100) : 0

  const categories = useMemo(
    () => Array.from(new Set(todayHabits.map((habit) => habit.category))),
    [todayHabits],
  )

  const filteredHabits = useMemo(() => {
    return todayHabits.filter((habit) => {
      const isSelected = selectedCategory === 'all' || habit.category === selectedCategory
      const isVisible = !hideCompleted || !getCheckInForHabit(habit.id)?.completed
      return isSelected && isVisible
    })
  }, [todayHabits, selectedCategory, hideCompleted, getCheckInForHabit])

  const sections = useMemo<HabitSectionData[]>(() => {
    const sorted = sortHabits(filteredHabits, sortMode)

    if (selectedCategory !== 'all') {
      return [{ title: categoryLabel[selectedCategory], habits: sorted }]
    }

    const thisWeek = sorted.filter((habit) => habit.frequencyType !== 'daily')
    const daily = sorted.filter((habit) => habit.frequencyType === 'daily')

    const morning = daily.filter((habit, index) => getDayPart(habit, index) === 'Morning')
    const afternoon = daily.filter((habit, index) => getDayPart(habit, index) === 'Afternoon')

    return [
      { title: 'All Habits', habits: sorted },
      ...(morning.length > 0 ? [{ title: 'Morning', habits: morning }] : []),
      ...(afternoon.length > 0 ? [{ title: 'Afternoon', habits: afternoon }] : []),
      ...(thisWeek.length > 0 ? [{ title: 'This Week', habits: thisWeek }] : []),
    ]
  }, [filteredHabits, selectedCategory, sortMode])

  if (checkIns.length === 0 && todayHabits.length === 0) {
    return (
      <section className="mx-auto max-w-2xl rounded-2xl border border-border bg-surface-secondary p-8 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-content-muted">Journal</p>
        <h2 className="text-2xl font-semibold">Build your first habit</h2>
        <p className="mt-2 text-sm text-content-muted">Start with one habit and Ripple will turn this Journal into your daily command center.</p>
        <Link to="/habits" className="mt-5 inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">
          Create your first habit
        </Link>
      </section>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="min-w-0 space-y-4">
        <header className="space-y-3">
          <div className="flex items-end justify-between gap-2">
            <div>
              <h1 className="text-2xl font-semibold">Today</h1>
              <p className="text-sm text-content-muted">{format(today, 'EEEE, MMM d')}</p>
            </div>
            <p className="text-xs text-content-muted">{completedCount}/{todayHabits.length} completed</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value as 'all' | Habit['category'])}
              className="min-h-10 rounded-lg border border-border bg-surface-secondary px-3 py-1.5 text-sm"
            >
              <option value="all">All folders</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {categoryLabel[category]}
                </option>
              ))}
            </select>
            <button onClick={() => setHideCompleted((previous) => !previous)} className="min-h-10 rounded-lg border border-border bg-surface-secondary px-3 py-1.5 text-sm">
              {hideCompleted ? 'Show completed' : 'Hide completed'}
            </button>
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              className="min-h-10 rounded-lg border border-border bg-surface-secondary px-3 py-1.5 text-sm"
            >
              <option value="manual">Sort: Manual</option>
              <option value="name">Sort: Name</option>
              <option value="streak">Sort: Streak</option>
            </select>
            <Link to="/habits" className="inline-flex min-h-10 items-center rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-white">Add habit</Link>
          </div>
        </header>

        {filteredHabits.length === 0 ? (
          <section className="rounded-xl border border-dashed border-border bg-surface-secondary p-8 text-center">
            <h2 className="text-lg font-semibold">No habits due right now</h2>
            <p className="mt-1 text-sm text-content-muted">You are clear for this moment. Enjoy the quiet streak and check back later.</p>
          </section>
        ) : (
          <div className="space-y-3">
            {sections.map((section) => (
              <HabitSection key={section.title} title={section.title}>
                {section.habits.map((habit) => {
                  const checkIn = getCheckInForHabit(habit.id)
                  return (
                    <HabitRow
                      key={habit.id}
                      habit={habit}
                      done={Boolean(checkIn?.completed)}
                      value={checkIn?.value ?? 0}
                      onDone={() => toggleCheckIn(habit.id)}
                      onIncrement={() => incrementCheckIn(habit.id, 1)}
                    />
                  )
                })}
              </HabitSection>
            ))}
          </div>
        )}
      </div>

      <aside className="grid gap-3 sm:grid-cols-3 xl:sticky xl:top-6 xl:block xl:h-fit xl:space-y-3 xl:border-l xl:border-border xl:pl-5">
        <div className="rounded-xl border border-border bg-surface-secondary p-3.5">
          <p className="text-xs text-content-muted">Completion</p>
          <p className="text-2xl font-semibold">{completionRate}%</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-secondary p-3.5">
          <p className="text-xs text-content-muted">Current streaks</p>
          <p className="text-2xl font-semibold">{todayHabits.filter((habit) => habit.streak.current > 0).length}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-secondary p-3.5">
          <p className="text-xs text-content-muted">Week starts</p>
          <p className="text-sm font-medium">{format(startOfWeek(today), 'MMM d')}</p>
        </div>
      </aside>
    </div>
  )
}
