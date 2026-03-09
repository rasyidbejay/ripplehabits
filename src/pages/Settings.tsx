import { useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { ThemeSwitcher } from '../components/ThemeSwitcher'
import { ActionButton, AppPageHeader, FormField, SectionCard, SettingsRow, SecondaryButton } from '../components/ui/primitives'
import type { UserProfile } from '../types/user'

type SettingsProps = { user: UserProfile; onSave: (updates: { name: string; timezone: string }) => void; onExport: () => string; onImport: (value: string) => { ok: boolean; message: string } }
const formatDateForFilename = () => new Date().toISOString().slice(0, 10)

export const Settings = ({ user, onSave, onExport, onImport }: SettingsProps) => {
  const [name, setName] = useState(user.name)
  const [timezone, setTimezone] = useState(user.timezone)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!name.trim()) return setError('Name is required.'); onSave({ name: name.trim(), timezone: timezone.trim() }); setError(''); setNotice('Profile updated.') }
  const handleExport = () => { const content = onExport(); const blob = new Blob([content], { type: 'application/json' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `ripple-backup-${formatDateForFilename()}.json`; anchor.click(); URL.revokeObjectURL(url); setError(''); setNotice('Backup downloaded.') }
  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; if (!window.confirm('Import will overwrite your local Ripple data. Continue?')) { event.target.value = ''; return } try { const result = onImport(await file.text());
    if (result.ok) { setNotice(result.message); setError('') } else { setError(result.message); setNotice('') }
  } catch { setError('Import failed: could not read the selected file.'); setNotice('') } finally { event.target.value = '' } }

  return (
    <section className="space-y-6">
      <AppPageHeader eyebrow="Settings" title="Profile & local data" description="Personalization and backups for your local-first Ripple workspace." />
      <SectionCard title="Appearance"><SettingsRow label="Theme" description="Switch between light, dark, or system." trailing={<ThemeSwitcher />} /></SectionCard>
      <SectionCard title="Profile">
        <form onSubmit={handleSubmit} className="space-y-3">
          <FormField label="Name"><input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40" /></FormField>
          <FormField label="Timezone"><input value={timezone} onChange={(event) => setTimezone(event.target.value)} className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40" /></FormField>
          <ActionButton type="submit">Save profile</ActionButton>
        </form>
      </SectionCard>
      <SectionCard title="Backup & restore" description="Export or import your entire local dataset in JSON format.">
        <div className="flex flex-wrap gap-2"><SecondaryButton type="button" onClick={handleExport}>Export JSON backup</SecondaryButton><SecondaryButton type="button" onClick={() => fileInputRef.current?.click()}>Import JSON backup</SecondaryButton><input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} /></div>
      </SectionCard>
      {notice ? <p className="text-sm text-emerald-600">{notice}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </section>
  )
}
