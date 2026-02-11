import type {
  Achievement,
  CheckIn,
  Habit,
  Routine,
  UserPreferences,
} from '../types/models'
import type { UserProfile } from '../types/user'

const ROOT_STORAGE_KEY = 'ripple:v1'
const STORAGE_VERSION = 1 as const
const ANTHROPIC_API_KEY_STORAGE_KEY = 'anthropicApiKey'

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

interface RootStorage {
  version: typeof STORAGE_VERSION
  userProfile: UserProfile | null
  data: Partial<StorageSchema>
}

export interface AppDataExport {
  version: typeof STORAGE_VERSION
  exportedAt: string
  payload: RootStorage
}

const detectTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

const createDefaultRoot = (): RootStorage => ({
  version: STORAGE_VERSION,
  userProfile: null,
  data: {
    habits: [],
    checkIns: [],
    achievements: [],
    routines: [],
  },
})

const isUserProfile = (value: unknown): value is UserProfile => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<UserProfile>

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.timezone === 'string' &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string'
  )
}

const readRoot = (): RootStorage => {
  const raw = localStorage.getItem(ROOT_STORAGE_KEY)

  if (!raw) {
    return createDefaultRoot()
  }

  try {
    const parsed = JSON.parse(raw) as Partial<RootStorage>

    if (parsed.version !== STORAGE_VERSION || typeof parsed !== 'object') {
      return createDefaultRoot()
    }

    return {
      version: STORAGE_VERSION,
      userProfile: isUserProfile(parsed.userProfile) ? parsed.userProfile : null,
      data: typeof parsed.data === 'object' && parsed.data ? parsed.data : {},
    }
  } catch {
    return createDefaultRoot()
  }
}

const writeRoot = (value: RootStorage): void => {
  localStorage.setItem(ROOT_STORAGE_KEY, JSON.stringify(value))
}

const createProfile = (input: { name: string; timezone?: string }): UserProfile => {
  const now = new Date().toISOString()

  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
    name: input.name.trim(),
    timezone: input.timezone?.trim() || detectTimezone(),
    createdAt: now,
    updatedAt: now,
  }
}

export const getUserProfile = (): UserProfile | null => readRoot().userProfile

export const saveUserProfile = (
  profile: Pick<UserProfile, 'name' | 'timezone'>,
): UserProfile => {
  const root = readRoot()

  const existing = root.userProfile
  const now = new Date().toISOString()

  const nextProfile = existing
    ? {
        ...existing,
        name: profile.name.trim(),
        timezone: profile.timezone.trim() || detectTimezone(),
        updatedAt: now,
      }
    : createProfile(profile)

  writeRoot({ ...root, userProfile: nextProfile })

  return nextProfile
}

export const exportAppData = (): string => {
  const payload: AppDataExport = {
    version: STORAGE_VERSION,
    exportedAt: new Date().toISOString(),
    payload: readRoot(),
  }

  return JSON.stringify(payload, null, 2)
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const importAppData = (
  jsonValue: string,
): { ok: boolean; message: string; userProfile?: UserProfile } => {
  try {
    const parsed = JSON.parse(jsonValue) as Partial<AppDataExport>

    if (!isRecord(parsed) || parsed.version !== STORAGE_VERSION || !isRecord(parsed.payload)) {
      return {
        ok: false,
        message: `Import failed: expected backup version ${STORAGE_VERSION}.`,
      }
    }

    const candidate = parsed.payload as Partial<RootStorage>

    if (!isUserProfile(candidate.userProfile)) {
      return {
        ok: false,
        message: 'Import failed: userProfile is missing or invalid.',
      }
    }

    const importedProfile = candidate.userProfile
    const nextRoot: RootStorage = {
      version: STORAGE_VERSION,
      userProfile: importedProfile,
      data: isRecord(candidate.data) ? (candidate.data as Partial<StorageSchema>) : {},
    }

    writeRoot(nextRoot)

    return {
      ok: true,
      message: 'Import complete. Local data was replaced successfully.',
      userProfile: importedProfile,
    }
  } catch {
    return { ok: false, message: 'Import failed: invalid JSON payload.' }
  }
}

export const storage = {
  get<K extends keyof StorageSchema>(key: K): StorageSchema[K] | null {
    const root = readRoot()
    return (root.data[key] as StorageSchema[K] | undefined) ?? null
  },

  set<K extends keyof StorageSchema>(key: K, value: StorageSchema[K]): void {
    const root = readRoot()
    writeRoot({ ...root, data: { ...root.data, [key]: value } })
  },

  remove<K extends keyof StorageSchema>(key: K): void {
    const root = readRoot()
    const next = { ...root.data }
    delete next[key]
    writeRoot({ ...root, data: next })
  },

  clear(): void {
    localStorage.removeItem(ROOT_STORAGE_KEY)
  },

  create<K extends CollectionKey>(
    key: K,
    item: StorageSchema[K][number],
  ): StorageSchema[K] {
    const collection = (this.get(key) ?? []) as StorageSchema[K]
    const next = [...collection, item] as StorageSchema[K]
    this.set(key, next)
    return next
  },

  update<K extends CollectionKey>(
    key: K,
    predicate: (item: StorageSchema[K][number]) => boolean,
    updater: (item: StorageSchema[K][number]) => StorageSchema[K][number],
  ): StorageSchema[K] {
    const collection = (this.get(key) ?? []) as StorageSchema[K]
    const next = collection.map((item) =>
      predicate(item) ? updater(item) : item,
    ) as StorageSchema[K]

    this.set(key, next)
    return next
  },

  delete<K extends CollectionKey>(
    key: K,
    predicate: (item: StorageSchema[K][number]) => boolean,
  ): StorageSchema[K] {
    const collection = (this.get(key) ?? []) as StorageSchema[K]
    const next = collection.filter((item) => !predicate(item)) as StorageSchema[K]
    this.set(key, next)
    return next
  },

  list<K extends CollectionKey>(key: K): StorageSchema[K] {
    return ((this.get(key) ?? []) as StorageSchema[K])
  },
}

export const getAnthropicApiKey = (): string =>
  localStorage.getItem(ANTHROPIC_API_KEY_STORAGE_KEY) ?? ''

export const setAnthropicApiKey = (value: string): void => {
  if (!value.trim()) {
    localStorage.removeItem(ANTHROPIC_API_KEY_STORAGE_KEY)
    return
  }

  localStorage.setItem(ANTHROPIC_API_KEY_STORAGE_KEY, value.trim())
}

export const getRootStorageKey = (): string => ROOT_STORAGE_KEY
