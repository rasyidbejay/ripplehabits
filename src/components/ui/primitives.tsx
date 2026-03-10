import type { ComponentPropsWithoutRef, ReactNode } from 'react'

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')

type AppPageHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}

export const AppPageHeader = ({ eyebrow, title, description, actions }: AppPageHeaderProps) => (
  <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div className="space-y-2">
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">{eyebrow}</p> : null}
      <h1 className="text-2xl font-semibold tracking-tight text-content-primary sm:text-3xl">{title}</h1>
      {description ? <p className="max-w-3xl text-sm text-content-secondary sm:text-base">{description}</p> : null}
    </div>
    {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
  </header>
)

export const SurfaceContainer = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cx('mx-auto w-full max-w-6xl', className)}>{children}</div>
)

export const SectionCard = ({ title, description, action, children, className }: { title?: string; description?: string; action?: ReactNode; children: ReactNode; className?: string }) => (
  <section className={cx('rounded-3xl border border-border bg-surface-secondary p-5 shadow-soft sm:p-6', className)}>
    {(title || description || action) ? (
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          {title ? <h2 className="text-lg font-semibold text-content-primary">{title}</h2> : null}
          {description ? <p className="mt-1 text-sm text-content-secondary">{description}</p> : null}
        </div>
        {action}
      </div>
    ) : null}
    {children}
  </section>
)

export const StatCard = ({ label, value, helper }: { label: string; value: string; helper?: string }) => (
  <article className="rounded-2xl border border-border bg-surface-elevated p-4">
    <p className="text-xs uppercase tracking-[0.14em] text-content-muted">{label}</p>
    <p className="mt-1 text-2xl font-semibold text-content-primary">{value}</p>
    {helper ? <p className="mt-1 text-xs text-content-secondary">{helper}</p> : null}
  </article>
)

export const ProgressCard = ({ title, value, subtitle }: { title: string; value: string; subtitle: string }) => (
  <article className="rounded-2xl border border-accent/25 bg-accent-light/40 p-4">
    <p className="text-xs uppercase tracking-[0.14em] text-content-muted">{title}</p>
    <p className="mt-1 text-2xl font-semibold text-accent">{value}</p>
    <p className="mt-1 text-xs text-content-secondary">{subtitle}</p>
  </article>
)

export const EmptyState = ({
  title,
  description,
  action,
  icon,
}: {
  title: string
  description: string
  action?: ReactNode
  icon?: string
}) => (
  <div className="rounded-2xl border border-dashed border-border-strong bg-surface-elevated p-8 text-center">
    {icon ? <p className="text-lg" aria-hidden>{icon}</p> : null}
    <h3 className="mt-2 text-base font-semibold text-content-primary">{title}</h3>
    <p className="mx-auto mt-2 max-w-md text-sm text-content-secondary">{description}</p>
    {action ? <div className="mt-4">{action}</div> : null}
  </div>
)

export const FilterChips = ({ options, value, onChange }: { options: Array<{ label: string; value: string }>; value: string; onChange: (value: string) => void }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((option) => {
      const active = option.value === value
      return (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cx(
            'rounded-xl border px-3 py-1.5 text-xs font-semibold transition',
            active ? 'border-accent/40 bg-accent-light/60 text-accent' : 'border-border bg-surface-elevated text-content-secondary hover:text-content-primary',
          )}
        >
          {option.label}
        </button>
      )
    })}
  </div>
)

type BtnProps = ComponentPropsWithoutRef<'button'>
export const ActionButton = ({ className, ...props }: BtnProps) => <button className={cx('inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-4 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent', className)} {...props} />
export const SecondaryButton = ({ className, ...props }: BtnProps) => <button className={cx('inline-flex min-h-11 items-center justify-center rounded-xl border border-border-strong bg-surface-elevated px-4 text-sm font-semibold text-content-primary transition hover:border-accent/40 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent', className)} {...props} />
export const IconButton = ({ className, ...props }: BtnProps) => <button className={cx('inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-border bg-surface-elevated text-content-secondary transition hover:text-content-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent', className)} {...props} />

export const FormField = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block space-y-1.5 text-sm font-medium text-content-secondary">
    <span>{label}</span>
    {children}
  </label>
)

export const SettingsRow = ({ label, description, trailing }: { label: string; description?: string; trailing?: ReactNode }) => (
  <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface-elevated px-4 py-3">
    <div>
      <p className="text-sm font-medium text-content-primary">{label}</p>
      {description ? <p className="text-xs text-content-secondary">{description}</p> : null}
    </div>
    {trailing}
  </div>
)

export const HabitRow = ({ title, subtitle, trailing }: { title: string; subtitle?: string; trailing?: ReactNode }) => (
  <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface-elevated p-3">
    <div>
      <p className="text-sm font-semibold text-content-primary">{title}</p>
      {subtitle ? <p className="text-xs text-content-secondary">{subtitle}</p> : null}
    </div>
    {trailing}
  </div>
)

export const HabitCard = ({ children, className }: { children: ReactNode; className?: string }) => (
  <article className={cx('rounded-2xl border border-border bg-surface-secondary p-4 shadow-soft', className)}>{children}</article>
)
