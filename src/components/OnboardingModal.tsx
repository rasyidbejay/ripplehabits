import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'

type StarterTemplateId = 'drink_water' | 'read_10_pages' | 'walk_20_minutes' | 'sleep_on_time'

type OnboardingModalProps = {
  open: boolean
  defaultTimezone: string
  onSave: (payload: { name: string; timezone: string; starterTemplates: StarterTemplateId[] }) => void
}

const STARTER_TEMPLATES: Array<{ id: StarterTemplateId; title: string; helper: string; emoji: string }> = [
  { id: 'drink_water', title: 'Drink Water', helper: '1 glass each morning', emoji: '💧' },
  { id: 'read_10_pages', title: 'Read 10 Pages', helper: 'Small daily learning', emoji: '📚' },
  { id: 'walk_20_minutes', title: 'Walk 20 Minutes', helper: 'Gentle movement', emoji: '🚶' },
  { id: 'sleep_on_time', title: 'Sleep on Time', helper: 'Consistent evening shutdown', emoji: '🌙' },
]

const FALLBACK_NAME = 'Ripple User'

export const OnboardingModal = ({
  open,
  defaultTimezone,
  onSave,
}: OnboardingModalProps) => {
  const [name, setName] = useState('')
  const [timezone, setTimezone] = useState(defaultTimezone)
  const [selectedTemplates, setSelectedTemplates] = useState<StarterTemplateId[]>(['drink_water'])

  const helperLabel = useMemo(() => {
    if (selectedTemplates.length === 0) {
      return 'You can start from scratch and add habits later.'
    }

    return `${selectedTemplates.length} starter ${selectedTemplates.length === 1 ? 'habit' : 'habits'} will be added.`
  }, [selectedTemplates])

  const save = () => {
    onSave({
      name: name.trim() || FALLBACK_NAME,
      timezone,
      starterTemplates: selectedTemplates,
    })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    save()
  }

  return (
    <div
      className={[
        'fixed inset-0 z-50 flex items-end justify-center p-0 transition-opacity duration-300 md:items-center md:p-4',
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
      ].join(' ')}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <form
        onSubmit={handleSubmit}
        className={[
          'relative w-full max-w-xl rounded-t-2xl border border-border bg-surface-secondary p-6 shadow-xl md:rounded-2xl',
          'transition duration-300',
          open ? 'translate-y-0 scale-100' : 'translate-y-2 scale-95',
        ].join(' ')}
      >
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Welcome to Ripple</p>
        <h2 className="mt-2 text-xl font-semibold text-content-primary">A calm Journal-first routine</h2>
        <p className="mt-1 text-sm text-content-muted">Check in from Journal each day, then watch Progress become meaningful over time.</p>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {STARTER_TEMPLATES.map((template) => {
            const active = selectedTemplates.includes(template.id)
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => {
                  setSelectedTemplates((previous) => (
                    previous.includes(template.id)
                      ? previous.filter((item) => item !== template.id)
                      : [...previous, template.id]
                  ))
                }}
                className={`rounded-xl border px-3 py-2 text-left transition ${active ? 'border-accent/40 bg-accent-light/60' : 'border-border bg-surface-elevated'}`}
              >
                <p className="text-sm font-semibold text-content-primary">{template.emoji} {template.title}</p>
                <p className="mt-1 text-xs text-content-secondary">{template.helper}</p>
              </button>
            )
          })}
        </div>

        <p className="mt-2 text-xs text-content-muted">{helperLabel}</p>

        <label className="mt-5 block text-sm font-medium text-content-secondary" htmlFor="onboarding-name">
          Name (optional)
        </label>
        <input
          id="onboarding-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="How should Ripple address you?"
          className="mt-1 w-full rounded-xl border border-border bg-surface-tertiary px-3 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
        />

        <label className="mt-4 block text-sm font-medium text-content-secondary" htmlFor="onboarding-timezone">
          Timezone
        </label>
        <input
          id="onboarding-timezone"
          value={timezone}
          onChange={(event) => setTimezone(event.target.value)}
          className="mt-1 w-full rounded-xl border border-border bg-surface-tertiary px-3 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
        />

        <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
          <button type="button" onClick={save} className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-content-secondary hover:bg-surface-tertiary">
            Skip for now
          </button>
          <button
            type="submit"
            className="min-h-11 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-surface-secondary transition hover:bg-accent/90"
          >
            Start with Journal
          </button>
        </div>
      </form>
    </div>
  )
}
