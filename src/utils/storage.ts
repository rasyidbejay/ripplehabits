import type {
  Achievement,
  CheckIn,
  Habit,
  Routine,
  UserPreferences,
} from '../types/models'
import type { AppDataExport, UserProfile } from '../types/user'
import type { Habit as LegacyHabit } from '../types/habit'

export const STORAGE_KEYS = {
  userPreferences: 'ripplehabits:userPreferences',
  habits: 'ripplehabits:habits',
  checkIns: 'ripplehabits:checkIns',
  achievements: 'ripplehabits:achievements',
  routines: 'ripplehabits:routines',
} as const

export const USER_PROFILE_STORAGE_KEY = 'ripple_user_profile'
export const ANTHROPIC_API_KEY_STORAGE_KEY = 'anthropicApiKey'

export interface StorageSchema {
  userPreferences: UserPreferences
  habits: Habit[]
  checkIns: CheckIn[]
  achievements: Achievement[]
  routines: Routine[]
}

type CollectionKey = {
  [K in keyof StorageSchema]: StorageSchema[K] extends Array<unknown> ? K : never
}[keyof StorageSchema]

const detectTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

const isUserProfile = (value: unknown): value is UserProfile => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<UserProfile>

  return (
    typeof candidate.name === 'string' &&
    typeof candidate.timezone === 'string' &&
    typeof candidate.updatedAt === 'string'
  )
}

const normalizeUserProfile = (value: Pick<UserProfile, 'name' | 'timezone'>): UserProfile => ({
  name: value.name.trim(),
  timezone: value.timezone.trim() || detectTimezone(),
  updatedAt: new Date().toISOString(),
})

const readFromStorage = <K extends keyof StorageSchema>(
  key: K,
): StorageSchema[K] | null => {
  const rawValue = localStorage.getItem(STORAGE_KEYS[key])

  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as StorageSchema[K]
  } catch {
    return null
  }
}

const writeToStorage = <K extends keyof StorageSchema>(
  key: K,
  value: StorageSchema[K],
): void => {
  localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value))
}

export const getUserProfile = (): UserProfile | null => {
  const rawProfile = localStorage.getItem(USER_PROFILE_STORAGE_KEY)

  if (rawProfile) {
    try {
      const parsed = JSON.parse(rawProfile) as unknown

      if (isUserProfile(parsed)) {
        return parsed
      }
    } catch {
      return null
    }

    return null
  }

  const legacyPreferences = readFromStorage('userPreferences')

  if (!legacyPreferences || !legacyPreferences.name.trim()) {
    return null
  }

  const migratedProfile = normalizeUserProfile({
    name: legacyPreferences.name,
    timezone: legacyPreferences.timezone,
  })

  localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(migratedProfile))
  return migratedProfile
}

export const saveUserProfile = (
  profile: Pick<UserProfile, 'name' | 'timezone'>,
): UserProfile => {
  const nextProfile = normalizeUserProfile(profile)
  localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(nextProfile))

  return nextProfile
}

export const exportAppData = (): string => {
  const userProfile = getUserProfile()

  if (!userProfile) {
    throw new Error('Cannot export data without a saved user profile.')
  }

  const payload: AppDataExport = {
    userProfile,
    habits: readFromStorage('habits') ?? [],
    checkIns: readFromStorage('checkIns') ?? [],
    achievements: readFromStorage('achievements') ?? [],
    routines: readFromStorage('routines') ?? [],
  }

  return JSON.stringify(payload, null, 2)
}

const isArrayField = (value: unknown): value is unknown[] => Array.isArray(value)

export const importAppData = (
  jsonValue: string,
): { ok: boolean; message: string; userProfile?: UserProfile } => {
  try {
    const parsed = JSON.parse(jsonValue) as Partial<AppDataExport>

    if (!parsed || typeof parsed !== 'object') {
      return { ok: false, message: 'Import failed: JSON payload is not an object.' }
    }

    if (!isUserProfile(parsed.userProfile)) {
      return {
        ok: false,
        message:
          'Import failed: missing or invalid userProfile. Expected name, timezone, and updatedAt.',
      }
    }

    if (
      !isArrayField(parsed.habits) ||
      !isArrayField(parsed.checkIns) ||
      !isArrayField(parsed.achievements) ||
      !isArrayField(parsed.routines)
    ) {
      return {
        ok: false,
        message:
          'Import failed: habits, checkIns, achievements, and routines must all be arrays.',
      }
    }

    localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(parsed.userProfile))
    writeToStorage('habits', parsed.habits as Habit[])
    writeToStorage('checkIns', parsed.checkIns as CheckIn[])
    writeToStorage('achievements', parsed.achievements as Achievement[])
    writeToStorage('routines', parsed.routines as Routine[])

    return {
      ok: true,
      message: 'Data imported successfully.',
      userProfile: parsed.userProfile,
    }
  } catch {
    return { ok: false, message: 'Import failed: JSON is invalid.' }
  }
}

export const storage = {
  get<K extends keyof StorageSchema>(key: K): StorageSchema[K] | null {
    return readFromStorage(key)
  },

  set<K extends keyof StorageSchema>(key: K, value: StorageSchema[K]): void {
    writeToStorage(key, value)
  },

  remove<K extends keyof StorageSchema>(key: K): void {
    localStorage.removeItem(STORAGE_KEYS[key])
  },

  clear(): void {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
    localStorage.removeItem(USER_PROFILE_STORAGE_KEY)
  },

  create<K extends CollectionKey>(
    key: K,
    item: StorageSchema[K][number],
  ): StorageSchema[K] {
    const collection = (readFromStorage(key) ?? []) as StorageSchema[K]
    const nextCollection = [...collection, item] as StorageSchema[K]

    writeToStorage(key, nextCollection)
    return nextCollection
  },

  update<K extends CollectionKey>(
    key: K,
    predicate: (item: StorageSchema[K][number]) => boolean,
    updater: (item: StorageSchema[K][number]) => StorageSchema[K][number],
  ): StorageSchema[K] {
    const collection = (readFromStorage(key) ?? []) as StorageSchema[K]
    const nextCollection = collection.map((item) =>
      predicate(item) ? updater(item) : item,
    ) as StorageSchema[K]

    writeToStorage(key, nextCollection)
    return nextCollection
  },

  delete<K extends CollectionKey>(
    key: K,
    predicate: (item: StorageSchema[K][number]) => boolean,
  ): StorageSchema[K] {
    const collection = (readFromStorage(key) ?? []) as StorageSchema[K]
    const nextCollection = collection.filter(
      (item) => !predicate(item),
    ) as StorageSchema[K]

    writeToStorage(key, nextCollection)
    return nextCollection
  },
}

const LEGACY_HABITS_KEY = 'ripplehabits:legacy-habits'

export const loadHabits = (): LegacyHabit[] => {
  const rawValue = localStorage.getItem(LEGACY_HABITS_KEY)

  if (!rawValue) {
    return []
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown
    return Array.isArray(parsed) ? (parsed as LegacyHabit[]) : []
  } catch {
    return []
  }
}

export const saveHabits = (habits: LegacyHabit[]): void => {
  localStorage.setItem(LEGACY_HABITS_KEY, JSON.stringify(habits))
}

export const getAnthropicApiKey = (): string =>
  localStorage.getItem(ANTHROPIC_API_KEY_STORAGE_KEY) ?? ''

export const setAnthropicApiKey = (apiKey: string): void => {
  const trimmedApiKey = apiKey.trim()

  if (!trimmedApiKey) {
    localStorage.removeItem(ANTHROPIC_API_KEY_STORAGE_KEY)
    return
  }

  localStorage.setItem(ANTHROPIC_API_KEY_STORAGE_KEY, trimmedApiKey)
}
