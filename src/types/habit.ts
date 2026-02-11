export type Habit = {
  id: string
  name: string
  createdAt: string
  completedDates: string[]
}

export type HabitStats = {
  totalHabits: number
  completedToday: number
  completionRate: number
}
