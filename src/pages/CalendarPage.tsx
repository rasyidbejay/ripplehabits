import { useEffect, useMemo, useState } from 'react'
import { addDays, addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, isToday, isValid, parseISO, startOfMonth, startOfWeek, subMonths } from 'date-fns'
import type { CheckIn, Habit, UserPreferences, Weekday } from '../types/models'
import { isHabitDueOnDate } from '../utils/habits'
import { storage } from '../utils/storage'
import { AppPageHeader, IconButton, SectionCard } from '../components/ui/primitives'

const WEEK_STARTS_ON_BY_DAY: Record<Weekday, 0 | 1 | 2 | 3 | 4 | 5 | 6> = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 }

export const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [habits, setHabits] = useState<Habit[]>(() => storage.get('habits') ?? [])
  const [checkIns, setCheckIns] = useState<CheckIn[]>(() => storage.get('checkIns') ?? [])
  const [preferences, setPreferences] = useState<UserPreferences | null>(() => storage.get('userPreferences'))

  useEffect(() => {
    const refreshData = () => { setHabits(storage.get('habits') ?? []); setCheckIns(storage.get('checkIns') ?? []); setPreferences(storage.get('userPreferences')) }
    window.addEventListener('focus', refreshData); window.addEventListener('storage', refreshData)
    return () => { window.removeEventListener('focus', refreshData); window.removeEventListener('storage', refreshData) }
  }, [])

  const weekStartsOn = WEEK_STARTS_ON_BY_DAY[preferences?.weekStartsOn ?? 'sunday']
  const weekdayLabels = useMemo(() => Array.from({ length: 7 }, (_, index) => format(addDays(startOfWeek(new Date(), { weekStartsOn }), index), 'EEE')), [weekStartsOn])
  const days = useMemo(() => eachDayOfInterval({ start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn }), end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn }) }), [currentMonth, weekStartsOn])

  const selectedDateHabitStatuses = useMemo(() => {
    if (!selectedDate) return []
    return habits.filter((habit) => isHabitDueOnDate(habit, selectedDate)).map((habit) => ({
      habit,
      checkIn: checkIns.find((checkIn) => checkIn.habitId === habit.id && isValid(parseISO(checkIn.date)) && isSameDay(parseISO(checkIn.date), selectedDate)),
    }))
  }, [selectedDate, habits, checkIns])

  return (
    <section className="space-y-6">
      <AppPageHeader eyebrow="Calendar" title="Consistency timeline" description="View completed days and inspect what happened on any date." />
      <SectionCard>
        <div className="mb-4 flex items-center justify-between">
          <IconButton onClick={() => setCurrentMonth((month) => subMonths(month, 1))}>←</IconButton>
          <h2 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
          <IconButton onClick={() => setCurrentMonth((month) => addMonths(month, 1))}>→</IconButton>
        </div>
        <div className="grid grid-cols-7 gap-1.5 text-center text-xs text-content-muted">{weekdayLabels.map((label) => <div key={label}>{label}</div>)}</div>
        <div className="mt-2 grid grid-cols-7 gap-1.5">
          {days.map((day) => {
            const isInMonth = isSameMonth(day, currentMonth)
            const completed = checkIns.some((checkIn) => checkIn.completed && isValid(parseISO(checkIn.date)) && isSameDay(parseISO(checkIn.date), day))
            return (
              <button key={day.toISOString()} type="button" onClick={() => setSelectedDate(day)} className={`min-h-16 rounded-xl border p-2 text-left text-sm ${isInMonth ? 'border-border bg-surface-elevated' : 'border-border/60 bg-surface-tertiary text-content-muted'} ${isToday(day) ? 'ring-2 ring-accent/40' : ''}`}>
                <span className={isToday(day) ? 'font-semibold text-accent' : ''}>{format(day, 'd')}</span>
                {completed ? <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-accent" /> : null}
              </button>
            )
          })}
        </div>
      </SectionCard>

      {selectedDate ? <SectionCard title={format(selectedDate, 'EEEE, MMMM d, yyyy')} action={<IconButton onClick={() => setSelectedDate(null)}>✕</IconButton>}>
        {selectedDateHabitStatuses.length === 0 ? <p className="text-sm text-content-secondary">No habits were scheduled for this date.</p> : <ul className="space-y-2">{selectedDateHabitStatuses.map(({ habit, checkIn }) => <li key={habit.id} className="rounded-2xl border border-border bg-surface-elevated p-3"><p className="font-medium">{habit.name}</p><p className="text-xs text-content-secondary">Status: {checkIn?.completed ? 'Completed' : 'Missed or not logged'}</p>{checkIn?.notes ? <p className="text-xs text-content-muted">Note: {checkIn.notes}</p> : null}</li>)}</ul>}
      </SectionCard> : null}
    </section>
  )
}
