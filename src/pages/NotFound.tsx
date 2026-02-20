import { Link } from 'react-router-dom'

export const NotFound = () => {
  return (
    <section className="space-y-3 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-accent">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-sm text-content-secondary">The page you requested does not exist.</p>
      <Link
        to="/"
        className="inline-flex rounded-xl bg-accent px-4 py-2 text-sm font-medium text-surface-secondary transition hover:bg-accent/90"
      >
        Go Home
      </Link>
    </section>
  )
}
