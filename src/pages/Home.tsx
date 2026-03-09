import { Link } from 'react-router-dom'
import { AppPageHeader, EmptyState, ProgressCard, SectionCard, StatCard } from '../components/ui/primitives'
import { storage } from '../utils/storage'
import type { UserProfile } from '../types/user'

type HomeProps = { user: UserProfile }

export const Home = ({ user }: HomeProps) => {
  const habits = storage.list('habits').filter((habit) => !habit.isArchived)
  const checkIns = storage.list('checkIns')
  const completedToday = checkIns.filter((entry) => entry.completed && entry.date === new Date().toISOString().slice(0, 10)).length

  return (
    <section className="space-y-6">
      <AppPageHeader eyebrow="Home" title={`Welcome back, ${user.name}`} description="Your habit workspace is built for calm consistency. Track, review, and adjust from one clear overview." actions={<Link to="/today" className="inline-flex min-h-11 items-center rounded-xl bg-accent px-4 text-sm font-semibold text-white">Open today</Link>} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active habits" value={String(habits.length)} helper="Current routines" />
        <StatCard label="Completions today" value={String(completedToday)} helper="Logged check-ins" />
        <ProgressCard title="Storage" value="Local-first" subtitle="Private on this device" />
        <ProgressCard title="Rhythm" value="Small daily wins" subtitle="Consistency over intensity" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Quick actions" description="Jump into your daily flow.">
          <div className="grid gap-2 sm:grid-cols-2">
            <Link className="rounded-2xl border border-border bg-surface-elevated p-4 text-sm font-semibold" to="/today">Today checklist</Link>
            <Link className="rounded-2xl border border-border bg-surface-elevated p-4 text-sm font-semibold" to="/habits">Manage habits</Link>
            <Link className="rounded-2xl border border-border bg-surface-elevated p-4 text-sm font-semibold" to="/calendar">Review calendar</Link>
            <Link className="rounded-2xl border border-border bg-surface-elevated p-4 text-sm font-semibold" to="/dashboard">Open dashboard</Link>
          </div>
        </SectionCard>
        <SectionCard title="Focus note" description="Stay intentional and steady.">
          <EmptyState title="Keep momentum simple" description="Complete what matters today, then use Dashboard and Calendar to see patterns, not pressure." />
        </SectionCard>
      </div>
    </section>
  )
}
