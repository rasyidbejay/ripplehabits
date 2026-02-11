import type {
  Achievement,
  CheckIn,
  Habit,
  Routine,
  UserPreferences,
} from '../types/models'

export const STORAGE_KEYS = {
  userPreferences: 'ripplehabits:userPreferences',
  habits: 'ripplehabits:habits',
  checkIns: 'ripplehabits:checkIns',
  achievements: 'ripplehabits:achievements',
  routines: 'ripplehabits:routines',
} as const

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
