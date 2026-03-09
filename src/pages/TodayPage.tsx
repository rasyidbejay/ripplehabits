import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import { TodayHabitItem } from '../components/TodayHabitItem'
import { useTodayHabits } from '../hooks/useTodayHabits'
import { AppPageHeader, EmptyState, ProgressCard, SectionCard, StatCard } from '../components/ui/primitives'

export const TodayPage = () => {
  const { today, todayHabits, checkIns, getCheckInForHabit, toggleCheckIn, updateNotes } = useTodayHabits()
  const doneCount = todayHabits.filter((habit) => getCheckInForHabit(habit.id)?.completed).length

  return (
    <section className="space-y-6">
      <AppPageHeader eyebrow="Today" title="Daily focus" description={format(today, 'EEEE, MMMM d, yyyy')} />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Due today" value={String(todayHabits.length)} />
        <StatCard label="Completed" value={`${doneCount}`} helper={`${todayHabits.length ? Math.round((doneCount / todayHabits.length) * 100) : 0}% done`} />
        <ProgressCard title="Momentum" value={`${doneCount}/${todayHabits.length || 0}`} subtitle="Keep the chain alive" />
      </div>

      <SectionCard title="Check in" description="Fast daily completion with optional notes.">
        {todayHabits.length === 0 ? (
          <EmptyState title="No habits due today" description="Create or reschedule habits to populate your daily list." action={<Link to="/habits" className="inline-flex min-h-11 items-center rounded-xl bg-accent px-4 text-sm font-semibold text-white">Create habit</Link>} />
        ) : (
          <div className="grid gap-3">{todayHabits.map((habit) => <TodayHabitItem key={habit.id} habit={habit} checkIn={getCheckInForHabit(habit.id)} checkIns={checkIns} onToggle={toggleCheckIn} onSaveNotes={updateNotes} />)}</div>
        )}
      </SectionCard>
    </section>
  )
}
