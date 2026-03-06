import type { ComponentPropsWithoutRef, ReactNode } from 'react'

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')

type PageHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export const PageHeader = ({ eyebrow, title, description, actions, className }: PageHeaderProps) => (
  <header className={cx('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
    <div className="space-y-2">
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">{eyebrow}</p> : null}
      <h1 className="text-3xl font-semibold tracking-tight text-content-primary md:text-4xl">{title}</h1>
      {description ? <p className="max-w-2xl text-sm leading-relaxed text-content-secondary md:text-base">{description}</p> : null}
    </div>
    {actions ? <div className="flex items-center gap-2.5">{actions}</div> : null}
  </header>
)

type SectionCardProps = {
  title?: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export const SectionCard = ({ title, description, action, children, className }: SectionCardProps) => (
  <section className={cx('rounded-3xl border border-border/85 bg-surface-secondary/90 p-4 shadow-[0_10px_30px_rgba(12,18,35,0.07)] md:p-6', className)}>
    {(title || description || action) ? (
      <div className="mb-4 flex items-start justify-between gap-4 border-b border-border/70 pb-4">
        <div className="space-y-1">
          {title ? <h2 className="text-lg font-semibold text-content-primary md:text-xl">{title}</h2> : null}
          {description ? <p className="text-sm text-content-secondary">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    ) : null}
    {children}
  </section>
)

type StatChipProps = {
  label: string
  value: string
  tone?: 'neutral' | 'accent'
}

export const StatChip = ({ label, value, tone = 'neutral' }: StatChipProps) => (
  <div className={cx('rounded-2xl border px-3.5 py-2.5', tone === 'accent' ? 'border-accent/30 bg-accent-light/50' : 'border-border bg-surface-elevated')}>
    <p className="text-xs font-medium uppercase tracking-[0.15em] text-content-muted">{label}</p>
    <p className={cx('mt-1 text-base font-semibold', tone === 'accent' ? 'text-accent' : 'text-content-primary')}>{value}</p>
  </div>
)

type ButtonProps = ComponentPropsWithoutRef<'button'>

export const PrimaryButton = ({ className, ...props }: ButtonProps) => (
  <button
    className={cx(
      'inline-flex min-h-11 items-center justify-center rounded-xl border border-accent bg-accent px-4 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
      className,
    )}
    {...props}
  />
)

export const SecondaryButton = ({ className, ...props }: ButtonProps) => (
  <button
    className={cx(
      'inline-flex min-h-11 items-center justify-center rounded-xl border border-border-strong bg-surface-elevated px-4 text-sm font-semibold text-content-primary transition hover:border-accent/45 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
      className,
    )}
    {...props}
  />
)

type EmptyStateBlockProps = {
  title: string
  description: string
  action?: ReactNode
}

export const EmptyStateBlock = ({ title, description, action }: EmptyStateBlockProps) => (
  <div className="rounded-2xl border border-dashed border-border-strong bg-surface-elevated/80 p-6 text-center">
    <h3 className="text-base font-semibold text-content-primary">{title}</h3>
    <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-content-secondary">{description}</p>
    {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
  </div>
)

type ListItemRowProps = {
  title: string
  subtitle?: string
  trailing?: ReactNode
  leading?: ReactNode
}

export const ListItemRow = ({ title, subtitle, trailing, leading }: ListItemRowProps) => (
  <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-elevated/70 px-4 py-3">
    {leading ? <div className="shrink-0">{leading}</div> : null}
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-content-primary">{title}</p>
      {subtitle ? <p className="truncate text-xs text-content-secondary">{subtitle}</p> : null}
    </div>
    {trailing ? <div className="shrink-0">{trailing}</div> : null}
  </div>
)
