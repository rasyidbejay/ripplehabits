import { FormEvent, useEffect, useState } from 'react'

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

  useEffect(() => {
    if (open) {
      setTimezone(defaultTimezone)
    }
  }, [defaultTimezone, open])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!name.trim()) {
      return
    }

    onSave({ name, timezone })
  }

  return (
    <div
      className={[
        'fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300',
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
      ].join(' ')}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" />
      <form
        onSubmit={handleSubmit}
        className={[
          'relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl',
          'transition duration-300',
          open ? 'translate-y-0 scale-100' : 'translate-y-2 scale-95',
        ].join(' ')}
      >
        <p className="text-xs uppercase tracking-[0.2em] text-indigo-500">Welcome</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">Set up your profile</h2>
        <p className="mt-1 text-sm text-slate-500">This is a one-time onboarding step.</p>

        <label className="mt-5 block text-sm font-medium text-slate-700" htmlFor="onboarding-name">
          Name
        </label>
        <input
          id="onboarding-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
          required
        />

        <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="onboarding-timezone">
          Timezone
        </label>
        <input
          id="onboarding-timezone"
          value={timezone}
          onChange={(event) => setTimezone(event.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
        />

        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          Save profile
        </button>
      </form>
    </div>
  )
}
