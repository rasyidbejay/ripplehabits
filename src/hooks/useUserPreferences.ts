import { useMemo, useState } from 'react'
import type { UserProfile } from '../types/user'
import {
  exportAppData,
  getUserProfile,
  importAppData,
  saveUserProfile,
} from '../utils/storage'

const detectTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserProfile | null>(() =>
    getUserProfile(),
  )

  const shouldShowOnboarding = useMemo(() => preferences === null, [preferences])

  const savePreferences = (input: { name: string; timezone: string }) => {
    const trimmedName = input.name.trim()

    if (!trimmedName) {
      return
    }

    const nextPreferences = saveUserProfile({
      name: trimmedName,
      timezone: input.timezone.trim() || detectTimezone(),
    })

    setPreferences(nextPreferences)
  }

  const updatePreferences = (updates: Partial<Pick<UserProfile, 'name' | 'timezone'>>) => {
    const source = preferences ?? {
      name: '',
      timezone: detectTimezone(),
      updatedAt: new Date().toISOString(),
    }

    const nextPreferences = saveUserProfile({
      name: updates.name ?? source.name,
      timezone: updates.timezone ?? source.timezone,
    })

    setPreferences(nextPreferences)
  }

  const importData = (jsonValue: string): { ok: boolean; message: string } => {
    const result = importAppData(jsonValue)

    if (result.ok && result.userProfile) {
      setPreferences(result.userProfile)
    }

    return {
      ok: result.ok,
      message: result.message,
    }
  }

  return {
    preferences,
    shouldShowOnboarding,
    savePreferences,
    updatePreferences,
    exportData: exportAppData,
    importData,
  }
}
