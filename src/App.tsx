import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/appShell'
import { OnboardingModal } from './components/OnboardingModal'
import { useLocalUser } from './hooks/useLocalUser'
import { HabitDetailPage } from './pages/HabitDetailPage'
import { JournalPage } from './pages/JournalPage'
import { ManageHabitsPage } from './pages/ManageHabitsPage'
import { NotFound } from './pages/NotFound'
import { ProgressPage } from './pages/ProgressPage'
import { SettingsPage } from './pages/SettingsPage'
import { seedStarterHabits } from './utils/storage'

const detectTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

const STARTER_TEMPLATE_MAP = {
  drink_water: {
    name: 'Drink Water',
    description: 'Kickstart your day with one glass of water.',
    category: 'health',
    icon: 'droplets',
    emoji: '💧',
    targetValue: 1,
    unit: 'glass',
    reminderTime: '08:00',
  },
  read_10_pages: {
    name: 'Read 10 Pages',
    description: 'Read ten pages to keep learning in motion.',
    category: 'learning',
    icon: 'book-open',
    emoji: '📚',
    targetValue: 10,
    unit: 'pages',
    reminderTime: '20:00',
  },
  walk_20_minutes: {
    name: 'Walk 20 Minutes',
    description: 'Take a short walk to reset body and mind.',
    category: 'fitness',
    icon: 'footprints',
    emoji: '🚶',
    targetValue: 20,
    unit: 'minutes',
    reminderTime: '18:00',
  },
  sleep_on_time: {
    name: 'Sleep on Time',
    description: 'Protect your evening by starting wind-down on time.',
    category: 'health',
    icon: 'moon',
    emoji: '🌙',
    targetValue: 1,
    unit: 'night',
    reminderTime: '22:30',
  },
} as const

const App = () => {
  const { user, isFirstRun, createUser, updateUser, exportAll, importAll, resetAll } = useLocalUser()

  return (
    <>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/journal" replace />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/habits" element={<ManageHabitsPage />} />
          <Route path="/habits/:habitId" element={<HabitDetailPage />} />
          <Route
            path="/settings"
            element={
              user ? (
                <SettingsPage user={user} onSave={updateUser} onExport={exportAll} onImport={importAll} onReset={resetAll} />
              ) : (
                <section className="space-y-2">
                  <h1 className="text-xl font-semibold">Complete onboarding to access settings.</h1>
                </section>
              )
            }
          />
          <Route path="/today" element={<Navigate to="/journal" replace />} />
          <Route path="/calendar" element={<Navigate to="/progress" replace />} />
          <Route path="/dashboard" element={<Navigate to="/progress" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>

      <OnboardingModal
        open={isFirstRun}
        defaultTimezone={detectTimezone()}
        onSave={({ name, timezone, starterTemplates }) => {
          createUser({ name, timezone })
          const mapped = starterTemplates.map((templateId) => STARTER_TEMPLATE_MAP[templateId])
          seedStarterHabits(mapped)
        }}
      />
    </>
  )
}

export default App
