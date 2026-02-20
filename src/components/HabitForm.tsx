import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type {
  Habit,
  HabitCategory,
  HabitFrequencyType,
  Weekday,
} from '../types/models'

type HabitFormValues = Pick<Habit, 'name' | 'description' | 'category' | 'frequencyType' | 'targetDays'>

type HabitFormProps = {
  onSubmit: (values: HabitFormValues) => void
  initialValues?: HabitFormValues
  submitLabel?: string
  onCancel?: () => void
}

const CATEGORY_OPTIONS: HabitCategory[] = [
  'health',
  'fitness',
  'mindfulness',
  'productivity',
  'learning',
  'relationships',
  'finance',
  'custom',
]

const FREQUENCY_OPTIONS: HabitFrequencyType[] = [
  'daily',
  'weekly',
  'monthly',
  'custom',
]

const WEEKDAY_OPTIONS: { label: string; value: Weekday }[] = [
  { label: 'Mon', value: 'monday' },
  { label: 'Tue', value: 'tuesday' },
  { label: 'Wed', value: 'wednesday' },
  { label: 'Thu', value: 'thursday' },
  { label: 'Fri', value: 'friday' },
  { label: 'Sat', value: 'saturday' },
  { label: 'Sun', value: 'sunday' },
]

const defaultValues: HabitFormValues = {
  name: '',
  description: '',
  category: 'health',
  frequencyType: 'daily',
  targetDays: [],
}

const humanize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

export const HabitForm = ({
  onSubmit,
  initialValues,
  submitLabel = 'Save habit',
  onCancel,
}: HabitFormProps) => {
  const valuesFromProps = useMemo(
    () => initialValues ?? defaultValues,
    [initialValues],
  )
  const [values, setValues] = useState<HabitFormValues>(valuesFromProps)
  const [error, setError] = useState('')

  useEffect(() => {
    setValues(valuesFromProps)
  }, [valuesFromProps])

  const toggleTargetDay = (day: Weekday) => {
    setValues((current) => {
      const exists = current.targetDays.includes(day)
      const targetDays = exists
        ? current.targetDays.filter((item) => item !== day)
        : [...current.targetDays, day]

      return { ...current, targetDays }
    })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!values.name.trim()) {
      setError('Habit name is required.')
      return
    }

    if (!values.category || !values.frequencyType) {
      setError('Category and frequency are required.')
      return
    }

    setError('')
    onSubmit({
      ...values,
      name: values.name.trim(),
      description: values.description.trim(),
      targetDays: values.frequencyType === 'weekly' ? values.targetDays : [],
    })

    if (!initialValues) {
      setValues(defaultValues)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border border-border bg-surface-secondary p-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 sm:col-span-2">
          <span className="text-xs font-medium text-content-secondary">Name *</span>
          <input
            value={values.name}
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Read for 20 minutes"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
          />
        </label>

        <label className="space-y-1 sm:col-span-2">
          <span className="text-xs font-medium text-content-secondary">Description</span>
          <textarea
            value={values.description}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            rows={2}
            placeholder="Optional notes about this habit"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-medium text-content-secondary">Category *</span>
          <select
            value={values.category}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                category: event.target.value as HabitCategory,
              }))
            }
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {humanize(option)}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-medium text-content-secondary">Frequency *</span>
          <select
            value={values.frequencyType}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                frequencyType: event.target.value as HabitFrequencyType,
              }))
            }
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
          >
            {FREQUENCY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {humanize(option)}
              </option>
            ))}
          </select>
        </label>

        {values.frequencyType === 'weekly' ? (
          <div className="space-y-2 sm:col-span-2">
            <p className="text-xs font-medium text-content-secondary">Target days</p>
            <div className="flex flex-wrap gap-2">
              {WEEKDAY_OPTIONS.map((day) => {
                const selected = values.targetDays.includes(day.value)

                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleTargetDay(day.value)}
                    className={[
                      'rounded-lg border px-3 py-1.5 text-xs font-medium transition',
                      selected
                        ? 'border-accent bg-accent-light text-accent'
                        : 'border-border text-content-secondary hover:bg-surface-tertiary',
                    ].join(' ')}
                  >
                    {day.label}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>

      {error ? <p className="text-xs text-rose-600">{error}</p> : null}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent/90"
        >
          {submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-3 py-2 text-sm text-content-secondary hover:bg-surface-tertiary"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  )
}
