import { useMemo, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isValid,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import type { CheckIn, Habit } from '../types/models'
import { storage } from '../utils/storage'

interface CalendarCheckIn extends CheckIn {
  habitName: string
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const habits = useMemo<Habit[]>(() => storage.get('habits') ?? [], [])
  const checkIns = useMemo<CheckIn[]>(() => storage.get('checkIns') ?? [], [])

  const checkInsWithHabit = useMemo<CalendarCheckIn[]>(
    () =>
      checkIns
        .map((checkIn) => {
          const habitName = habits.find((habit) => habit.id === checkIn.habitId)?.name

          if (!habitName) {
            return null
          }

          return {
            ...checkIn,
            habitName,
          }
        })
        .filter((checkIn): checkIn is CalendarCheckIn => checkIn !== null),
    [checkIns, habits],
  )

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const gridStart = startOfWeek(monthStart)
    const gridEnd = endOfWeek(monthEnd)

    return eachDayOfInterval({ start: gridStart, end: gridEnd })
  }, [currentMonth])

  const hasCompletedCheckIn = (date: Date) =>
    checkInsWithHabit.some((checkIn) => {
      const checkInDate = parseISO(checkIn.date)

      return (
        checkIn.completed &&
        isValid(checkInDate) &&
        isSameDay(checkInDate, date)
      )
    })

  const selectedDateCheckIns = useMemo(() => {
    if (!selectedDate) {
      return []
    }

    return checkInsWithHabit
      .filter((checkIn) => {
        const checkInDate = parseISO(checkIn.date)
        return isValid(checkInDate) && isSameDay(checkInDate, selectedDate)
      })
      .sort((a, b) => Number(b.completed) - Number(a.completed))
  }, [selectedDate, checkInsWithHabit])

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            className="rounded border border-slate-300 px-3 py-1 text-sm"
            onClick={() => setCurrentMonth((month: Date) => subMonths(month, 1))}
          >
            Prev
          </button>

          <h2 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>

          <button
            type="button"
            className="rounded border border-slate-300 px-3 py-1 text-sm"
            onClick={() => setCurrentMonth((month: Date) => addMonths(month, 1))}
          >
            Next
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500 sm:gap-2">
          {WEEKDAY_LABELS.map((label) => (
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
                ].join(' ')}
                onClick={() => setSelectedDate(day)}
              >
                <div className="flex h-full flex-col">
                  <span>{format(day, 'd')}</span>
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
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold">
                Check-ins for {format(selectedDate, 'MMMM d, yyyy')}
              </h3>
              <button
                type="button"
                className="rounded border border-slate-300 px-2 py-1 text-sm"
                onClick={() => setSelectedDate(null)}
              >
                Close
              </button>
            </div>

            {selectedDateCheckIns.length === 0 ? (
              <p className="text-sm text-slate-500">No check-ins for this day.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {selectedDateCheckIns.map((checkIn) => (
                  <li key={`${checkIn.habitId}-${checkIn.date}`} className="rounded border border-slate-200 p-2">
                    <p className="font-medium">{checkIn.habitName}</p>
                    <p className="text-slate-600">
                      Status: {checkIn.completed ? 'Completed' : 'Not completed'}
                    </p>
                    {checkIn.notes ? <p className="text-slate-500">Notes: {checkIn.notes}</p> : null}
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
