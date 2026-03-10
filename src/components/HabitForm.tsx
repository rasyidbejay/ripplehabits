import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Habit, HabitCategory, HabitFrequencyType, Weekday } from '../types/models'
import { ActionButton, FormField, SecondaryButton } from './ui/primitives'
import { storage } from '../utils/storage'

type HabitFormValues = {
  name: string
  description: string
  category: HabitCategory
  frequencyType: HabitFrequencyType
  targetDays: Habit['targetDays']
  targetValue?: number
  unit?: string
  reminderTime?: string
  notes?: string
  emoji?: string
  icon?: string
  isArchived?: boolean
}


type HabitFormProps = {
  onSubmit: (values: HabitFormValues) => void
  initialValues?: HabitFormValues
  submitLabel?: string
  onCancel?: () => void
}

const CATEGORY_OPTIONS: HabitCategory[] = ['health', 'fitness', 'mindfulness', 'productivity', 'learning', 'relationships', 'finance', 'custom']
const FREQUENCY_OPTIONS: HabitFrequencyType[] = ['daily', 'weekly', 'specific_days', 'custom_target']
const WEEKDAY_OPTIONS: { label: string; value: Weekday }[] = [
  { label: 'Mon', value: 'monday' }, { label: 'Tue', value: 'tuesday' }, { label: 'Wed', value: 'wednesday' },
  { label: 'Thu', value: 'thursday' }, { label: 'Fri', value: 'friday' }, { label: 'Sat', value: 'saturday' }, { label: 'Sun', value: 'sunday' },
]

const getDefaultValues = (): HabitFormValues => ({
  name: '',
  description: '',
  category: 'health',
  frequencyType: storage.get('userPreferences')?.defaultHabitFrequency ?? 'daily',
  targetDays: [],
  targetValue: 1,
  unit: '',
  reminderTime: '',
  notes: '',
  emoji: '✨',
  icon: 'sparkles',
  isArchived: false,
})

const humanize = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase())

export const HabitForm = ({ onSubmit, initialValues, submitLabel = 'Save habit', onCancel }: HabitFormProps) => {
  const valuesFromProps = useMemo(() => initialValues ?? getDefaultValues(), [initialValues])
  const [values, setValues] = useState<HabitFormValues>(valuesFromProps)
  const [error, setError] = useState('')

  useEffect(() => {
    setValues(valuesFromProps)
  }, [valuesFromProps])

  const toggleTargetDay = (day: Weekday) => setValues((current) => ({ ...current, targetDays: current.targetDays.includes(day) ? current.targetDays.filter((item) => item !== day) : [...current.targetDays, day] }))

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!values.name.trim()) return setError('Habit name is required.')
    if (values.frequencyType === 'specific_days' && values.targetDays.length === 0) return setError('Pick at least one day for specific-days habits.')
    if (values.frequencyType === 'custom_target' && (!values.targetValue || values.targetValue <= 0)) return setError('Set a valid target value.')

    setError('')
    onSubmit({
      ...values,
      name: values.name.trim(),
      description: values.description.trim(),
      unit: values.unit?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
      reminderTime: values.reminderTime || undefined,
      emoji: values.emoji?.trim() || undefined,
      targetDays: values.frequencyType === 'specific_days' ? values.targetDays : [],
      targetValue: values.frequencyType === 'custom_target' ? values.targetValue : values.targetValue || undefined,
      isArchived: values.isArchived,
    })

    if (!initialValues) setValues(getDefaultValues())
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2"><FormField label="Name *"><input value={values.name} onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40" /></FormField></div>
        <FormField label="Icon / Emoji"><input value={values.emoji ?? ''} maxLength={4} onChange={(event) => setValues((current) => ({ ...current, emoji: event.target.value }))} placeholder="✨" className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40" /></FormField>
        <FormField label="Area / Category"><select value={values.category} onChange={(event) => setValues((current) => ({ ...current, category: event.target.value as HabitCategory }))} className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40">{CATEGORY_OPTIONS.map((option) => <option key={option} value={option}>{humanize(option)}</option>)}</select></FormField>
        <FormField label="Frequency *"><select value={values.frequencyType} onChange={(event) => setValues((current) => ({ ...current, frequencyType: event.target.value as HabitFrequencyType }))} className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40">{FREQUENCY_OPTIONS.map((option) => <option key={option} value={option}>{humanize(option)}</option>)}</select></FormField>
        <FormField label="Target"><input type="number" min={1} value={values.targetValue ?? ''} onChange={(event) => setValues((current) => ({ ...current, targetValue: Number(event.target.value) }))} className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40" /></FormField>
        <FormField label="Unit"><input value={values.unit ?? ''} onChange={(event) => setValues((current) => ({ ...current, unit: event.target.value }))} placeholder="reps, pages, glasses" className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40" /></FormField>
        <FormField label="Reminder (optional)"><input type="time" value={values.reminderTime ?? ''} onChange={(event) => setValues((current) => ({ ...current, reminderTime: event.target.value }))} className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40" /></FormField>
        <div className="sm:col-span-2"><FormField label="Notes"><textarea rows={2} value={values.notes ?? ''} onChange={(event) => setValues((current) => ({ ...current, notes: event.target.value }))} className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40" /></FormField></div>
        <div className="sm:col-span-2"><FormField label="Description"><textarea rows={2} value={values.description} onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))} className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40" /></FormField></div>
        {initialValues ? <label className="sm:col-span-2 inline-flex items-center gap-2 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-content-secondary"><input type="checkbox" checked={values.isArchived} onChange={(event) => setValues((current) => ({ ...current, isArchived: event.target.checked }))} /> Archived</label> : null}
      </div>
      {values.frequencyType === 'specific_days' ? <div className="flex flex-wrap gap-2">{WEEKDAY_OPTIONS.map((day) => <button key={day.value} type="button" onClick={() => toggleTargetDay(day.value)} className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${values.targetDays.includes(day.value) ? 'border-accent/35 bg-accent-light/70 text-accent' : 'border-border bg-surface-elevated text-content-secondary'}`}>{day.label}</button>)}</div> : null}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
      <div className="flex gap-2"><ActionButton type="submit">{submitLabel}</ActionButton>{onCancel ? <SecondaryButton type="button" onClick={onCancel}>Cancel</SecondaryButton> : null}</div>
    </form>
  )
}
