import { useEffect, useMemo, useState } from 'react'
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDate,
  isSameDay,
  isSameMonth,
  isToday,
  isValid,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import type { CheckIn, Habit, UserPreferences, Weekday } from '../types/models'
import { storage } from '../utils/storage'

interface ScheduledHabitStatus {
  habit: Habit
  checkIn: CheckIn | undefined
}

const WEEKDAY_BY_INDEX: Weekday[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

const WEEK_STARTS_ON_BY_DAY: Record<Weekday, 0 | 1 | 2 | 3 | 4 | 5 | 6> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

const isHabitScheduledForDate = (habit: Habit, targetDate: Date) => {
  if (habit.isArchived) {
    return false
  }

  if (habit.frequencyType === 'daily') {
    return true
  }

  if (habit.frequencyType === 'monthly') {
    return getDate(parseISO(habit.createdDate)) === getDate(targetDate)
  }

  if (habit.targetDays.length === 0) {
    return true
  }

  const weekday = WEEKDAY_BY_INDEX[targetDate.getDay()]
  return habit.targetDays.includes(weekday)
}

export const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [habits, setHabits] = useState<Habit[]>(() => storage.get('habits') ?? [])
  const [checkIns, setCheckIns] = useState<CheckIn[]>(() => storage.get('checkIns') ?? [])
  const [preferences, setPreferences] = useState<UserPreferences | null>(() => storage.get('userPreferences'))

  useEffect(() => {
    const refreshData = () => {
      setHabits(storage.get('habits') ?? [])
      setCheckIns(storage.get('checkIns') ?? [])
      setPreferences(storage.get('userPreferences'))
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshData()
      }
    }

    window.addEventListener('focus', refreshData)
    window.addEventListener('storage', refreshData)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.removeEventListener('focus', refreshData)
      window.removeEventListener('storage', refreshData)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  const weekStartsOn = WEEK_STARTS_ON_BY_DAY[preferences?.weekStartsOn ?? 'sunday']

  const weekdayLabels = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const day = addDays(startOfWeek(new Date(), { weekStartsOn }), index)
        return format(day, 'EEE')
      }),
    [weekStartsOn],
  )

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const gridStart = startOfWeek(monthStart, { weekStartsOn })
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn })

    return eachDayOfInterval({ start: gridStart, end: gridEnd })
  }, [currentMonth, weekStartsOn])

  const hasCompletedCheckIn = (date: Date) =>
    checkIns.some((checkIn) => {
      const checkInDate = parseISO(checkIn.date)
      return checkIn.completed && isValid(checkInDate) && isSameDay(checkInDate, date)
    })

  const selectedDateHabitStatuses = useMemo<ScheduledHabitStatus[]>(() => {
    if (!selectedDate) {
      return []
    }

    const scheduledHabits = habits.filter((habit) => isHabitScheduledForDate(habit, selectedDate))

    return scheduledHabits.map((habit) => ({
      habit,
      checkIn: checkIns.find((checkIn) => {
        const checkInDate = parseISO(checkIn.date)
        return checkIn.habitId === habit.id && isValid(checkInDate) && isSameDay(checkInDate, selectedDate)
      }),
    }))
  }, [selectedDate, habits, checkIns])

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            className="rounded border border-slate-300 px-3 py-1 text-sm"
            onClick={() => setCurrentMonth((month: Date) => subMonths(month, 1))}
          >
            ← Prev
          </button>

          <h2 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>

          <button
            type="button"
            className="rounded border border-slate-300 px-3 py-1 text-sm"
            onClick={() => setCurrentMonth((month: Date) => addMonths(month, 1))}
          >
            Next →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500 sm:gap-2">
          {weekdayLabels.map((label) => (
            <div key={label} className="py-1">
              {label}
            </div>
          ))}

          {days.map((day: Date) => {
            const isInMonth = isSameMonth(day, currentMonth)
            const hasDot = hasCompletedCheckIn(day)

            return (
              <button
                key={day.toISOString()}
                type="button"
                className={[
                  'min-h-16 rounded border p-1 text-left text-sm transition sm:min-h-20 sm:p-2',
                  isInMonth
                    ? 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
                    : 'border-slate-100 bg-slate-50 text-slate-400',
                  isToday(day) ? 'ring-2 ring-indigo-400 ring-offset-1' : '',
                ].join(' ')}
                onClick={() => setSelectedDate(day)}
              >
                <div className="flex h-full flex-col">
                  <span className={isToday(day) ? 'font-semibold text-indigo-700' : ''}>{format(day, 'd')}</span>
                  {hasDot ? (
                    <span className="mt-auto inline-block h-1.5 w-1.5 rounded-full bg-indigo-600" />
                  ) : null}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {selectedDate ? (
        <div
          className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedDate(null)
            }
          }}
        >
          <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              <button
                type="button"
                className="rounded border border-slate-300 px-2 py-1 text-sm"
                onClick={() => setSelectedDate(null)}
              >
                ✕
              </button>
            </div>

            {selectedDateHabitStatuses.length === 0 ? (
              <p className="text-sm text-slate-500">No habits scheduled for this day.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {selectedDateHabitStatuses.map(({ habit, checkIn }) => (
                  <li key={habit.id} className="rounded border border-slate-200 p-2">
                    <p className="font-medium">{habit.name}</p>
                    <p className="text-slate-600">
                      Status: {checkIn?.completed ? '✅ done' : '❌ missed'}
                    </p>
                    {checkIn?.notes ? <p className="text-slate-500">Notes: {checkIn.notes}</p> : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </section>
  )
}
