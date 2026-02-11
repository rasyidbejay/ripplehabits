import { ChangeEvent, FormEvent, useRef, useState } from 'react'
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
        <p className="text-xs uppercase tracking-[0.2em] text-indigo-500">Settings</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Profile & Local Data</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-slate-700" htmlFor="name">
          Name
          <input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700" htmlFor="timezone">
          Timezone
          <input
            id="timezone"
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
          />
        </label>

        <button
          type="submit"
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          Save profile
        </button>
      </form>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-700">Export or import all local Ripple data as JSON.</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm transition hover:border-indigo-300 hover:text-indigo-600"
          >
            Export JSON backup
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm transition hover:border-indigo-300 hover:text-indigo-600"
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
