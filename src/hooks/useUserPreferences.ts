import { useMemo, useState } from 'react'
import type { StorageSchema } from '../utils/storage'
import { storage } from '../utils/storage'
import type { ThemePreference, UserPreferences } from '../types/models'

const detectTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

const createDefaultPreferences = (
  partial: Partial<UserPreferences> = {},
): UserPreferences => ({
  name: partial.name ?? '',
  timezone: partial.timezone ?? detectTimezone(),
  theme: partial.theme ?? 'system',
  weekStartsOn: partial.weekStartsOn ?? 'monday',
  remindersEnabled: partial.remindersEnabled ?? true,
  defaultHabitColor: partial.defaultHabitColor ?? '#4f46e5',
  compactMode: partial.compactMode ?? false,
  updatedAt: partial.updatedAt ?? new Date().toISOString(),
})

const normalizeUserPreferences = (
  value: UserPreferences | null,
): UserPreferences | null => {
  if (!value) {
    return null
  }

  return createDefaultPreferences(value)
}

const isThemePreference = (value: unknown): value is ThemePreference =>
  value === 'system' || value === 'light' || value === 'dark'

const isUserPreferences = (value: unknown): value is UserPreferences => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<UserPreferences>

  return (
    typeof candidate.name === 'string' &&
    typeof candidate.timezone === 'string' &&
    typeof candidate.weekStartsOn === 'string' &&
    typeof candidate.remindersEnabled === 'boolean' &&
    typeof candidate.defaultHabitColor === 'string' &&
    typeof candidate.compactMode === 'boolean' &&
    typeof candidate.updatedAt === 'string' &&
    isThemePreference(candidate.theme)
  )
}

const isValidStorageSchema = (value: unknown): value is StorageSchema => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<StorageSchema>

  return (
    isUserPreferences(candidate.userPreferences) &&
    Array.isArray(candidate.habits) &&
    Array.isArray(candidate.checkIns) &&
    Array.isArray(candidate.achievements) &&
    Array.isArray(candidate.routines)
  )
}

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(() =>
    normalizeUserPreferences(storage.get('userPreferences')),
  )

  const shouldShowOnboarding = useMemo(() => preferences === null, [preferences])

  const savePreferences = (input: { name: string; timezone: string }) => {
    const nextPreferences = createDefaultPreferences({
      ...preferences,
      name: input.name.trim(),
      timezone: input.timezone.trim() || detectTimezone(),
      updatedAt: new Date().toISOString(),
    })

    storage.set('userPreferences', nextPreferences)
    setPreferences(nextPreferences)
  }

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const nextPreferences = createDefaultPreferences({
      ...(preferences ?? createDefaultPreferences()),
      ...updates,
      updatedAt: new Date().toISOString(),
    })

    storage.set('userPreferences', nextPreferences)
    setPreferences(nextPreferences)
  }

  const exportData = () => {
    const payload: StorageSchema = {
      userPreferences: preferences ?? createDefaultPreferences(),
      habits: storage.get('habits') ?? [],
      checkIns: storage.get('checkIns') ?? [],
      achievements: storage.get('achievements') ?? [],
      routines: storage.get('routines') ?? [],
    }

    return JSON.stringify(payload, null, 2)
  }

  const importData = (jsonValue: string): { ok: boolean; message: string } => {
    try {
      const parsed = JSON.parse(jsonValue) as unknown

      if (!isValidStorageSchema(parsed)) {
        return {
          ok: false,
          message:
            'Invalid JSON schema. Expected userPreferences, habits, checkIns, achievements, and routines.',
        }
      }

      storage.set('userPreferences', createDefaultPreferences(parsed.userPreferences))
      storage.set('habits', parsed.habits)
      storage.set('checkIns', parsed.checkIns)
      storage.set('achievements', parsed.achievements)
      storage.set('routines', parsed.routines)
      setPreferences(createDefaultPreferences(parsed.userPreferences))

      return { ok: true, message: 'Data imported successfully.' }
    } catch {
      return { ok: false, message: 'Import failed: JSON is invalid.' }
    }
  }

  return {
    preferences,
    shouldShowOnboarding,
    savePreferences,
    updatePreferences,
    exportData,
    importData,
  }
}
