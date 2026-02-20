import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

type OnboardingModalProps = {
  open: boolean
  defaultTimezone: string
  onSave: (payload: { name: string; timezone: string }) => void
}

export const OnboardingModal = ({
  open,
  defaultTimezone,
  onSave,
}: OnboardingModalProps) => {
  const [name, setName] = useState('')
  const [timezone, setTimezone] = useState(defaultTimezone)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (open) {
      setName('')
      setTimezone(defaultTimezone)
      setErrorMessage('')
    }
  }, [defaultTimezone, open])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedName = name.trim()

    if (!trimmedName) {
      setErrorMessage('Please enter your name to continue.')
      return
    }

    onSave({ name: trimmedName, timezone })
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
          'relative w-full max-w-md rounded-t-2xl border border-border bg-surface-secondary p-6 shadow-xl md:rounded-2xl',
          'transition duration-300',
          open ? 'translate-y-0 scale-100' : 'translate-y-2 scale-95',
        ].join(' ')}
      >
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Welcome</p>
        <h2 className="mt-2 text-xl font-semibold text-content-primary">Set up your profile</h2>
        <p className="mt-1 text-sm text-content-muted">This is a one-time onboarding step.</p>

        <label className="mt-5 block text-sm font-medium text-content-secondary" htmlFor="onboarding-name">
          Name
        </label>
        <input
          id="onboarding-name"
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            if (errorMessage) {
              setErrorMessage('')
            }
          }}
          placeholder="Your name"
          className="mt-1 w-full rounded-xl border border-border bg-surface-tertiary px-3 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
          required
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

        {errorMessage ? <p className="mt-3 text-xs text-rose-600">{errorMessage}</p> : null}

        <button
          type="submit"
          className="mt-6 min-h-11 w-full rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/90"
        >
          Save profile
        </button>
      </form>
    </div>
  )
}
