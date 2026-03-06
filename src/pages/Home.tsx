import { Link } from 'react-router-dom'
import {
  EmptyStateBlock,
  ListItemRow,
  PageHeader,
  SectionCard,
  StatChip,
} from '../components/ui/primitives'
import type { UserProfile } from '../types/user'

type HomeProps = {
  user: UserProfile
}

export const Home = ({ user }: HomeProps) => {
  return (
    <section className="space-y-6 md:space-y-8">
      <PageHeader
        eyebrow="Home"
        title={`Welcome back, ${user.name}`}
        description="Build momentum with small, consistent actions. Your profile and habit data stay private on this device."
        actions={
          <Link
            to="/today"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-accent bg-accent px-4 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Start today
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatChip label="Focus" value="Steady consistency" tone="accent" />
        <StatChip label="Storage" value="Local & private" />
        <StatChip label="Approach" value="One day at a time" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <SectionCard
          title="Jump back in"
          description="Quick links to the areas you use most often."
        >
          <div className="space-y-2.5">
            <ListItemRow
              title="Habits"
              subtitle="Manage your routines and targets"
              trailing={<Link to="/habits" className="text-sm font-semibold text-accent">Open</Link>}
            />
            <ListItemRow
              title="Dashboard"
              subtitle="Review trends and completion patterns"
              trailing={<Link to="/dashboard" className="text-sm font-semibold text-accent">Open</Link>}
            />
            <ListItemRow
              title="Settings"
              subtitle="Personalization and data controls"
              trailing={<Link to="/settings" className="text-sm font-semibold text-accent">Open</Link>}
            />
          </div>
        </SectionCard>

        <SectionCard title="Keep your cadence" description="Small daily wins compound over time.">
          <EmptyStateBlock
            title="You're set up for progress"
            description="Use Today to check off habits quickly, then review your momentum in Dashboard at the end of the day."
            action={
              <Link
                to="/today"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border-strong bg-surface-elevated px-4 text-sm font-semibold text-content-primary transition hover:border-accent/45 hover:text-accent"
              >
                Open Today
              </Link>
            }
          />
        </SectionCard>
      </div>
    </section>
  )
}
