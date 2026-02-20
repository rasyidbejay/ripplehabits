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
        <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Settings</p>
        <h2 className="mt-2 text-2xl font-semibold text-content-primary">Local profile</h2>
        <p className="mt-1 text-sm text-content-muted">Manage your local user profile and back up app data.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-border bg-surface-secondary p-5">
        <div>
          <label className="text-sm font-medium text-content-secondary" htmlFor="settings-name">
            Name
          </label>
          <input
            id="settings-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-content-secondary" htmlFor="settings-timezone">
            Timezone
          </label>
          <input
            id="settings-timezone"
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
            className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-content-secondary" htmlFor="settings-anthropic-api-key">
            Anthropic API key
          </label>
          <input
            id="settings-anthropic-api-key"
            type="password"
            value={anthropicApiKey}
            onChange={(event) => setAnthropicApiKeyValue(event.target.value)}
            className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
            autoComplete="off"
            spellCheck={false}
          />
          <p className="mt-2 text-xs text-amber-700">
            This key is stored in browser and visible in developer tools.
          </p>
        </div>

        <button
          type="submit"
          className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/90"
        >
          Save changes
        </button>
      </form>

      <div className="space-y-3 rounded-2xl border border-border bg-surface-secondary p-5">
        <h3 className="text-sm font-semibold text-content-primary">Data management</h3>
        <p className="text-sm text-content-muted">Export all local app data, or import a validated backup JSON file.</p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleExportData}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-content-secondary transition hover:bg-surface-tertiary"
          >
            Export Data
          </button>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-content-secondary transition hover:bg-surface-tertiary">
            Import Data
            <input type="file" accept="application/json" onChange={handleImportData} className="hidden" />
          </label>
        </div>
      </div>

      {statusMessage ? <p className="text-sm text-content-secondary">{statusMessage}</p> : null}
      {preferences?.updatedAt ? (
        <p className="text-xs text-content-muted">Last updated: {new Date(preferences.updatedAt).toLocaleString()}</p>
      ) : null}
    </section>
  )
}
