import { useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ThemeSwitcher } from '../components/ThemeSwitcher'
import { ActionButton, AppPageHeader, FormField, SectionCard, SecondaryButton, SettingsRow } from '../components/ui/primitives'
import type { HabitFrequencyType, UserPreferences, Weekday } from '../types/models'
import type { UserProfile } from '../types/user'
import { getRootStorageKey, storage } from '../utils/storage'

type Props = {
  user: UserProfile
  onSave: (updates: { name: string; timezone: string }) => void
  onExport: () => string
  onImport: (value: string) => { ok: boolean; message: string }
  onReset: () => void
}

const weekOptions: Array<{ label: string; value: Weekday }> = [
  { label: 'Sunday', value: 'sunday' },
  { label: 'Monday', value: 'monday' },
  { label: 'Tuesday', value: 'tuesday' },
  { label: 'Wednesday', value: 'wednesday' },
  { label: 'Thursday', value: 'thursday' },
  { label: 'Friday', value: 'friday' },
  { label: 'Saturday', value: 'saturday' },
]

const habitBehaviorOptions: Array<{ label: string; value: HabitFrequencyType }> = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Specific days', value: 'specific_days' },
  { label: 'Custom target', value: 'custom_target' },
]

const detectTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
const formatDateForFilename = () => new Date().toISOString().slice(0, 10)

const getPreferenceDefaults = (): UserPreferences => ({
  name: '',
  timezone: detectTimezone(),
  theme: 'system',
  weekStartsOn: 'monday',
  remindersEnabled: false,
  defaultHabitColor: '#7c5cfc',
  compactMode: false,
  defaultHabitFrequency: 'daily',
  updatedAt: new Date().toISOString(),
})

const readStoredPreferences = (): UserPreferences => {
  const defaults = getPreferenceDefaults()
  const current = storage.get('userPreferences')
  if (!current) {
    return defaults
  }

  return {
    ...defaults,
    ...current,
    weekStartsOn: weekOptions.some((item) => item.value === current.weekStartsOn) ? current.weekStartsOn : defaults.weekStartsOn,
    defaultHabitFrequency: habitBehaviorOptions.some((item) => item.value === current.defaultHabitFrequency)
      ? current.defaultHabitFrequency
      : defaults.defaultHabitFrequency,
  }
}

export const SettingsPage = ({ user, onSave, onExport, onImport, onReset }: Props) => {
  const [name, setName] = useState(user.name)
  const [timezone, setTimezone] = useState(user.timezone)
  const [weekStartsOn, setWeekStartsOn] = useState<Weekday>(() => readStoredPreferences().weekStartsOn)
  const [defaultHabitFrequency, setDefaultHabitFrequency] = useState<HabitFrequencyType>(() => readStoredPreferences().defaultHabitFrequency)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const storageSummary = `${storage.list('habits').length + storage.list('checkIns').length + storage.list('achievements').length + storage.list('routines').length} local records`

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) {
      setError('Display name is required.')
      setNotice('')
      return
    }

    onSave({ name: name.trim(), timezone: timezone.trim() || detectTimezone() })
    setError('')
    setNotice('Profile saved.')
  }

  const savePreferences = () => {
    const source = readStoredPreferences()
    storage.set('userPreferences', {
      ...source,
      name: name.trim(),
      timezone: timezone.trim() || detectTimezone(),
      weekStartsOn,
      defaultHabitFrequency,
      updatedAt: new Date().toISOString(),
    })
    setError('')
    setNotice('Preferences updated.')
  }

  const exportData = () => {
    const content = onExport()
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `ripple-backup-${formatDateForFilename()}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setError('')
    setNotice('Backup exported.')
  }

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const raw = await file.text()
      const result = onImport(raw)
      if (result.ok) {
        setNotice(result.message)
        setError('')
      } else {
        setError(result.message)
        setNotice('')
      }
    } catch {
      setError('Import failed: unable to read selected file.')
      setNotice('')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <section className="space-y-6">
      <AppPageHeader eyebrow="Settings" title="Workspace settings" description="Manage profile, appearance, preferences, and local-first data controls." />

      <SectionCard title="Profile" description="Personal details stored on this device.">
        <form onSubmit={saveProfile} className="space-y-3">
          <FormField label="Display name">
            <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/35" />
          </FormField>
          <FormField label="Timezone">
            <input value={timezone} onChange={(event) => setTimezone(event.target.value)} className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/35" />
          </FormField>
          <ActionButton type="submit">Save profile</ActionButton>
        </form>
      </SectionCard>

      <SectionCard title="Appearance" description="Choose how Ripple looks across desktop and mobile.">
        <SettingsRow label="Theme" description="Light, dark, or follow your system setting." trailing={<ThemeSwitcher />} />
      </SectionCard>

      <SectionCard title="Preferences" description="Defaults used when planning your week and creating habits.">
        <div className="space-y-3">
          <FormField label="Week starts on">
            <select value={weekStartsOn} onChange={(event) => setWeekStartsOn(event.target.value as Weekday)} className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/35">
              {weekOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </FormField>
          <FormField label="Default habit behavior">
            <select value={defaultHabitFrequency} onChange={(event) => setDefaultHabitFrequency(event.target.value as HabitFrequencyType)} className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/35">
              {habitBehaviorOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </FormField>
          <SecondaryButton type="button" onClick={savePreferences}>Save preferences</SecondaryButton>
        </div>
      </SectionCard>

      <SectionCard title="Data" description="All Ripple data is local-first and stays in your browser unless you export it.">
        <div className="space-y-3">
          <SettingsRow label="Storage" description={`Stored under ${getRootStorageKey()} (${storageSummary}).`} />
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <SecondaryButton type="button" onClick={exportData}>Export data (JSON)</SecondaryButton>
            <SecondaryButton type="button" onClick={() => fileInputRef.current?.click()}>Import data (JSON)</SecondaryButton>
            <SecondaryButton type="button" className="border-danger/45 text-danger hover:border-danger hover:text-danger" onClick={() => setShowResetConfirm(true)}>Reset local data</SecondaryButton>
            <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
          </div>
          <p className="text-xs text-content-secondary">Import replaces current local data after file validation. Export includes profile and habit history.</p>
        </div>
      </SectionCard>

      <SectionCard title="About" description="App and build information.">
        <SettingsRow label="Ripple version" description={import.meta.env.VITE_APP_VERSION ?? 'dev build'} />
        <p className="mt-3 text-xs text-content-secondary">Ripple is local-first. No account or backend is required for settings, habits, or progress.</p>
      </SectionCard>

      {notice ? <p className="text-sm text-success">{notice}</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <ConfirmDialog
        open={showResetConfirm}
        title="Reset all local Ripple data?"
        confirmLabel="Reset data"
        onCancel={() => setShowResetConfirm(false)}
        onConfirm={() => {
          onReset()
          setShowResetConfirm(false)
          setNotice('Local data reset. Complete onboarding to start fresh.')
          setError('')
        }}
      >
        This permanently removes your profile, habits, check-ins, and settings from this browser.
      </ConfirmDialog>
    </section>
  )
}
