import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { OnboardingModal } from './components/OnboardingModal'
import { useLocalUser } from './hooks/useLocalUser'
import { Dashboard } from './pages/Dashboard'
import { HabitsPage } from './pages/HabitsPage'
import { CalendarPage } from './pages/CalendarPage'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { Settings } from './pages/Settings'
import { TodayPage } from './pages/TodayPage'

const detectTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

const App = () => {
  const { user, isFirstRun, createUser, updateUser, exportAll, importAll } = useLocalUser()

  return (
    <>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={user ? <Home user={user} /> : <Navigate to="/settings" replace />} />
          <Route path="/habits" element={<HabitsPage />} />
          <Route path="/today" element={<TodayPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/settings"
            element={
              user ? (
                <Settings
                  user={user}
                  onSave={updateUser}
                  onExport={exportAll}
                  onImport={importAll}
                />
              ) : (
                <section className="space-y-2">
                  <h1 className="text-xl font-semibold">Complete onboarding to access settings.</h1>
                </section>
              )
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>

      <OnboardingModal
        open={isFirstRun}
        defaultTimezone={detectTimezone()}
        onSave={createUser}
      />
    </>
  )
}

export default App
