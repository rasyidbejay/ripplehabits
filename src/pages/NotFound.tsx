import { Link } from 'react-router-dom'

export const NotFound = () => {
  return (
    <section className="space-y-3 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-indigo-500">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-sm text-slate-600">The page you requested does not exist.</p>
      <Link
        to="/"
        className="inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
      >
        Go Home
      </Link>
    </section>
  )
}
