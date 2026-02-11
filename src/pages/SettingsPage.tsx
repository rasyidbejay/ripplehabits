import { ChangeEvent, FormEvent, useMemo, useState } from 'react'
import { useUserPreferences } from '../hooks/useUserPreferences'
import type { ThemePreference } from '../types/models'

const themeOptions: ThemePreference[] = ['system', 'light', 'dark']

const detectTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

export const SettingsPage = () => {
  const { preferences, updatePreferences, exportData, importData } = useUserPreferences()

  const [name, setName] = useState(preferences?.name ?? '')
  const [timezone, setTimezone] = useState(preferences?.timezone ?? detectTimezone())
  const [theme, setTheme] = useState<ThemePreference>(preferences?.theme ?? 'system')
  const [statusMessage, setStatusMessage] = useState('')

  const exportFileName = useMemo(
    () => `ripplehabits-backup-${new Date().toISOString().slice(0, 10)}.json`,
    [],
  )

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    updatePreferences({
      name: name.trim(),
      timezone: timezone.trim(),
      theme,
    })

    setStatusMessage('Preferences saved.')
  }

  const handleExportData = () => {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.href = url
    link.download = exportFileName
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImportData = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const fileText = await file.text()
    const result = importData(fileText)

    setStatusMessage(result.message)

    if (result.ok) {
      const latestPreferences = JSON.parse(fileText).userPreferences as {
        name: string
        timezone: string
        theme: ThemePreference
      }

      setName(latestPreferences.name)
      setTimezone(latestPreferences.timezone)
      setTheme(latestPreferences.theme)
    }

    event.target.value = ''
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Settings</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">User preferences</h2>
        <p className="mt-1 text-sm text-slate-500">Update your local profile and manage data backup.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="settings-name">
            Name
          </label>
          <input
            id="settings-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="settings-timezone">
            Timezone
          </label>
          <input
            id="settings-timezone"
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="settings-theme">
            Theme
          </label>
          <select
            id="settings-theme"
            value={theme}
            onChange={(event) => setTheme(event.target.value as ThemePreference)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
          >
            {themeOptions.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          Save changes
        </button>
      </form>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900">Data management</h3>
        <p className="text-sm text-slate-500">Export all local app data, or import a validated backup JSON file.</p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleExportData}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Export Data
          </button>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            Import Data
            <input type="file" accept="application/json" onChange={handleImportData} className="hidden" />
          </label>
        </div>
      </div>

      {statusMessage ? <p className="text-sm text-slate-600">{statusMessage}</p> : null}
      {preferences?.updatedAt ? (
        <p className="text-xs text-slate-400">Last updated: {new Date(preferences.updatedAt).toLocaleString()}</p>
      ) : null}
    </section>
  )
}
