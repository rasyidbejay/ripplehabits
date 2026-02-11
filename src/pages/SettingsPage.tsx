import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useUserPreferences } from '../hooks/useUserPreferences'
import { getAnthropicApiKey, setAnthropicApiKey } from '../utils/storage'

const detectTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

export const SettingsPage = () => {
  const { preferences, updatePreferences, exportData, importData } = useUserPreferences()

  const [name, setName] = useState(preferences?.name ?? '')
  const [timezone, setTimezone] = useState(preferences?.timezone ?? detectTimezone())
  const [anthropicApiKey, setAnthropicApiKeyValue] = useState(() => getAnthropicApiKey())
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    setName(preferences?.name ?? '')
    setTimezone(preferences?.timezone ?? detectTimezone())
  }, [preferences])

  const exportFileName = useMemo(
    () => `ripplehabits-backup-${new Date().toISOString().slice(0, 10)}.json`,
    [],
  )

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    updatePreferences({
      name: name.trim(),
      timezone: timezone.trim(),
    })

    setAnthropicApiKey(anthropicApiKey)

    setStatusMessage('Settings saved.')
  }

  const handleExportData = () => {
    try {
      const data = exportData()
      const blob = new Blob([data], { type: 'application/json' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.href = url
      link.download = exportFileName
      link.click()
      URL.revokeObjectURL(url)
      setStatusMessage('Data exported successfully.')
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : 'Unable to export app data.',
      )
    }
  }

  const handleImportData = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const fileText = await file.text()
    const result = importData(fileText)

    setStatusMessage(result.message)

    event.target.value = ''
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Settings</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Local profile</h2>
        <p className="mt-1 text-sm text-slate-500">Manage your local user profile and back up app data.</p>
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
          <label className="text-sm font-medium text-slate-700" htmlFor="settings-anthropic-api-key">
            Anthropic API key
          </label>
          <input
            id="settings-anthropic-api-key"
            type="password"
            value={anthropicApiKey}
            onChange={(event) => setAnthropicApiKeyValue(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
            autoComplete="off"
            spellCheck={false}
          />
          <p className="mt-2 text-xs text-amber-700">
            This key is stored in browser and visible in developer tools.
          </p>
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
