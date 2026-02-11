import { Link } from 'react-router-dom'
import type { UserProfile } from '../types/user'

type HomeProps = {
  user: UserProfile
}

export const Home = ({ user }: HomeProps) => {
  return (
    <section className="space-y-4">
      <p className="text-xs uppercase tracking-[0.2em] text-indigo-500">Home</p>
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user.name}</h1>
      <p className="text-sm text-slate-600">
        Your profile is stored locally on this device. No secrets are collected.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link to="/habits" className="rounded-xl border border-slate-200 p-3 text-sm transition hover:border-indigo-300 hover:bg-indigo-50">
          Go to Habits
        </Link>
        <Link to="/dashboard" className="rounded-xl border border-slate-200 p-3 text-sm transition hover:border-indigo-300 hover:bg-indigo-50">
          Open Dashboard
        </Link>
        <Link to="/settings" className="rounded-xl border border-slate-200 p-3 text-sm transition hover:border-indigo-300 hover:bg-indigo-50">
          Manage Settings
        </Link>
      </div>
    </section>
  )
}
