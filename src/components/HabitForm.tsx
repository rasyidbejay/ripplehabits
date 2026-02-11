import { FormEvent, useState } from 'react'

type HabitFormProps = {
  onAddHabit: (name: string) => void
}

export const HabitForm = ({ onAddHabit }: HabitFormProps) => {
  const [habitName, setHabitName] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onAddHabit(habitName)
    setHabitName('')
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
      <input
        value={habitName}
        onChange={(event) => setHabitName(event.target.value)}
        placeholder="Add a new habit"
        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none ring-indigo-500 transition focus:ring-2"
      />
      <button
        type="submit"
        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
      >
        Add habit
      </button>
    </form>
  )
}
