import { useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { ThemeSwitcher } from '../components/ThemeSwitcher'
import type { UserProfile } from '../types/user'

export const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-2xl border border-border bg-surface-secondary p-4">
    <h2 className="text-sm font-semibold">{title}</h2>
    <div className="mt-3">{children}</div>
  </section>
)

type Props = {
  user: UserProfile
  onSave: (updates: { name: string; timezone: string }) => void
  onExport: () => string
  onImport: (value: string) => { ok: boolean; message: string }
}

export const SettingsPage = ({ user, onSave, onExport, onImport }: Props) => {
  const [name, setName] = useState(user.name)
  const [timezone, setTimezone] = useState(user.timezone)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSave({ name: name.trim(), timezone: timezone.trim() })
    setNotice('Saved changes.')
  }

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const result = onImport(await file.text())
    if (result.ok) setNotice(result.message)
    else setError(result.message)
    event.target.value = ''
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Settings</h2>
      <SettingsSection title="Appearance"><ThemeSwitcher /></SettingsSection>
      <SettingsSection title="Profile">
        <form onSubmit={submit} className="space-y-2">
          <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-lg border border-border bg-surface-primary px-3 py-2 text-sm" placeholder="Name" />
          <input value={timezone} onChange={(event) => setTimezone(event.target.value)} className="w-full rounded-lg border border-border bg-surface-primary px-3 py-2 text-sm" placeholder="Timezone" />
          <button className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white">Save profile</button>
        </form>
      </SettingsSection>
      <SettingsSection title="Backup">
        <div className="flex gap-2">
          <button onClick={() => {
            const content = onExport()
            const blob = new Blob([content], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `ripple-backup-${new Date().toISOString().slice(0, 10)}.json`
            a.click()
            URL.revokeObjectURL(url)
          }} className="rounded-lg border border-border bg-surface-primary px-3 py-2 text-sm">Export JSON</button>
          <button onClick={() => fileInputRef.current?.click()} className="rounded-lg border border-border bg-surface-primary px-3 py-2 text-sm">Import JSON</button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
        </div>
      </SettingsSection>
      {notice ? <p className="text-sm text-emerald-600">{notice}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  )
}
