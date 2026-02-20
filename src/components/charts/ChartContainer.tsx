import type { PropsWithChildren } from 'react'

type ChartContainerProps = PropsWithChildren<{
  title: string
  description?: string
}>

export const ChartContainer = ({
  title,
  description,
  children,
}: ChartContainerProps) => {
  return (
    <section className="rounded-xl border border-border bg-surface-secondary p-6">
      <header>
        <h3 className="text-lg font-semibold text-content-primary">{title}</h3>
        {description ? <p className="mt-1 text-sm text-content-muted">{description}</p> : null}
      </header>
      <div className="mt-4 h-72">{children}</div>
    </section>
  )
}
