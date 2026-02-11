export interface UserProfile {
  name: string
  timezone: string
  updatedAt: string
}

export interface AppDataExport {
  userProfile: UserProfile
  habits: unknown[]
  checkIns: unknown[]
  achievements: unknown[]
  routines: unknown[]
}
