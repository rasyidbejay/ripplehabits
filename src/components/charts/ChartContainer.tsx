import type { PropsWithChildren } from 'react'

export const ChartContainer = ({ title, description, children }: PropsWithChildren<{ title: string; description?: string }>) => (
  <section className="rounded-3xl border border-border bg-surface-secondary p-5 shadow-soft sm:p-6">
    <h3 className="text-lg font-semibold text-content-primary">{title}</h3>
    {description ? <p className="mt-1 text-sm text-content-secondary">{description}</p> : null}
    <div className="mt-4 h-72">{children}</div>
  </section>
)
