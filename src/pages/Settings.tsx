import { useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { ThemeSwitcher } from '../components/ThemeSwitcher'
import type { UserProfile } from '../types/user'

type SettingsProps = {
  user: UserProfile
  onSave: (updates: { name: string; timezone: string }) => void
  onExport: () => string
  onImport: (value: string) => { ok: boolean; message: string }
}

const formatDateForFilename = () => new Date().toISOString().slice(0, 10)

export const Settings = ({ user, onSave, onExport, onImport }: SettingsProps) => {
  const [name, setName] = useState(user.name)
  const [timezone, setTimezone] = useState(user.timezone)
  const [notice, setNotice] = useState<string>('')
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!name.trim()) {
      setError('Name is required.')
      setNotice('')
      return
    }

    onSave({ name: name.trim(), timezone: timezone.trim() })
    setError('')
    setNotice('Profile updated.')
  }

  const handleExport = () => {
    const content = onExport()
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')

    anchor.href = url
    anchor.download = `ripple-backup-${formatDateForFilename()}.json`
    anchor.click()
    URL.revokeObjectURL(url)

    setError('')
    setNotice('Backup downloaded.')
  }

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const shouldContinue = window.confirm(
      'Import will overwrite your local Ripple data. Continue?',
    )

    if (!shouldContinue) {
      event.target.value = ''
      return
    }

    try {
      const raw = await file.text()
      const result = onImport(raw)

      if (result.ok) {
        setNotice(result.message)
        setError('')
      } else {
        setNotice('')
        setError(result.message)
      }
    } catch {
      setNotice('')
      setError('Import failed: could not read the selected file.')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Settings</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-2xl">Profile & Local Data</h1>
      </div>

      <div className="rounded-2xl border border-border bg-surface-secondary p-4">
        <p className="mb-3 text-sm font-medium text-content-secondary">Theme</p>
        <ThemeSwitcher className="w-full justify-center md:w-auto" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-surface-secondary p-4">
        <label className="block text-sm font-medium text-content-secondary" htmlFor="name">
          Name
          <input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-surface-tertiary px-3 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </label>

        <label className="block text-sm font-medium text-content-secondary" htmlFor="timezone">
          Timezone
          <input
            id="timezone"
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-surface-tertiary px-3 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </label>

        <button
          type="submit"
          className="min-h-11 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/90"
        >
          Save profile
        </button>
      </form>

      <div className="space-y-3 rounded-2xl border border-border bg-surface-tertiary p-4">
        <p className="text-sm text-content-secondary">Export or import all local Ripple data as JSON.</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="min-h-11 rounded-xl border border-border bg-surface-secondary px-3 py-2 text-sm transition hover:border-accent/40 hover:text-accent"
          >
            Export JSON backup
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-11 rounded-xl border border-border bg-surface-secondary px-3 py-2 text-sm transition hover:border-accent/40 hover:text-accent"
          >
            Import JSON backup
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImportFile}
          />
        </div>
      </div>

      {notice ? <p className="text-sm text-emerald-600">{notice}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </section>
  )
}
