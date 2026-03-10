import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/appShell'
import { OnboardingModal } from './components/OnboardingModal'
import { useLocalUser } from './hooks/useLocalUser'
import { JournalPage } from './pages/JournalPage'
import { ManageHabitsPage } from './pages/ManageHabitsPage'
import { HabitDetailPage } from './pages/HabitDetailPage'
import { NotFound } from './pages/NotFound'
import { ProgressPage } from './pages/ProgressPage'
import { SettingsPage } from './pages/SettingsPage'

const detectTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

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

      <OnboardingModal open={isFirstRun} defaultTimezone={detectTimezone()} onSave={createUser} />
    </>
  )
}

export default App
