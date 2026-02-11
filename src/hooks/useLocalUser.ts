import { useMemo, useState } from 'react'
import type { UserProfile } from '../types/user'
import {
  exportAppData,
  getUserProfile,
  importAppData,
  saveUserProfile,
} from '../utils/storage'

const detectTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

export const useLocalUser = () => {
  const [user, setUser] = useState<UserProfile | null>(() => getUserProfile())

  const isFirstRun = useMemo(() => user === null, [user])

  const createUser = (input: { name: string; timezone: string }) => {
    const next = saveUserProfile({
      name: input.name.trim(),
      timezone: input.timezone.trim() || detectTimezone(),
    })

    setUser(next)
  }

  const updateUser = (updates: Partial<Pick<UserProfile, 'name' | 'timezone'>>) => {
    const source = user ?? {
      name: '',
      timezone: detectTimezone(),
    }

    const next = saveUserProfile({
      name: updates.name ?? source.name,
      timezone: updates.timezone ?? source.timezone,
    })

    setUser(next)
  }

  const importAll = (value: string) => {
    const result = importAppData(value)

    if (result.ok && result.userProfile) {
      setUser(result.userProfile)
    }

    return result
  }

  return {
    user,
    isFirstRun,
    createUser,
    updateUser,
    exportAll: exportAppData,
    importAll,
  }
}
