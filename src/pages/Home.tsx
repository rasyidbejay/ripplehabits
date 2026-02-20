import { Link } from 'react-router-dom'
import type { UserProfile } from '../types/user'

type HomeProps = {
  user: UserProfile
}

export const Home = ({ user }: HomeProps) => {
  return (
    <section className="space-y-4">
      <p className="text-xs uppercase tracking-[0.2em] text-accent">Home</p>
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user.name}</h1>
      <p className="text-sm text-content-secondary">
        Your profile is stored locally on this device. No secrets are collected.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link to="/habits" className="rounded-xl border border-border p-3 text-sm transition hover:border-accent/40 hover:bg-accent-light">
          Go to Habits
        </Link>
        <Link to="/dashboard" className="rounded-xl border border-border p-3 text-sm transition hover:border-accent/40 hover:bg-accent-light">
          Open Dashboard
        </Link>
        <Link to="/settings" className="rounded-xl border border-border p-3 text-sm transition hover:border-accent/40 hover:bg-accent-light">
          Manage Settings
        </Link>
      </div>
    </section>
  )
}
