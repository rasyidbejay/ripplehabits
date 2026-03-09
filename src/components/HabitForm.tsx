import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Habit, HabitCategory, HabitFrequencyType, Weekday } from '../types/models'
import { ActionButton, FormField, SecondaryButton } from './ui/primitives'

type HabitFormValues = Pick<Habit, 'name' | 'description' | 'category' | 'frequencyType' | 'targetDays'>

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
const defaultValues: HabitFormValues = { name: '', description: '', category: 'health', frequencyType: 'daily', targetDays: [] }
const humanize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

export const HabitForm = ({ onSubmit, initialValues, submitLabel = 'Save habit', onCancel }: HabitFormProps) => {
  const valuesFromProps = useMemo(() => initialValues ?? defaultValues, [initialValues])
  const [values, setValues] = useState<HabitFormValues>(valuesFromProps)
  const [error, setError] = useState('')
  const toggleTargetDay = (day: Weekday) => setValues((current) => ({ ...current, targetDays: current.targetDays.includes(day) ? current.targetDays.filter((item) => item !== day) : [...current.targetDays, day] }))

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!values.name.trim()) return setError('Habit name is required.')
    setError('')
    onSubmit({ ...values, name: values.name.trim(), description: values.description.trim(), targetDays: values.frequencyType === 'specific_days' ? values.targetDays : [] })
    if (!initialValues) setValues(defaultValues)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-border bg-surface-secondary p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2"><FormField label="Name *"><input value={values.name} onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40" /></FormField></div>
        <div className="sm:col-span-2"><FormField label="Description"><textarea rows={2} value={values.description} onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))} className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40" /></FormField></div>
        <FormField label="Category *"><select value={values.category} onChange={(event) => setValues((current) => ({ ...current, category: event.target.value as HabitCategory }))} className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40">{CATEGORY_OPTIONS.map((option) => <option key={option} value={option}>{humanize(option)}</option>)}</select></FormField>
        <FormField label="Frequency *"><select value={values.frequencyType} onChange={(event) => setValues((current) => ({ ...current, frequencyType: event.target.value as HabitFrequencyType }))} className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40">{FREQUENCY_OPTIONS.map((option) => <option key={option} value={option}>{humanize(option)}</option>)}</select></FormField>
      </div>
      {values.frequencyType === 'specific_days' ? <div className="flex flex-wrap gap-2">{WEEKDAY_OPTIONS.map((day) => <button key={day.value} type="button" onClick={() => toggleTargetDay(day.value)} className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${values.targetDays.includes(day.value) ? 'border-accent/35 bg-accent-light/70 text-accent' : 'border-border bg-surface-elevated text-content-secondary'}`}>{day.label}</button>)}</div> : null}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
      <div className="flex gap-2"><ActionButton type="submit">{submitLabel}</ActionButton>{onCancel ? <SecondaryButton type="button" onClick={onCancel}>Cancel</SecondaryButton> : null}</div>
    </form>
  )
}
