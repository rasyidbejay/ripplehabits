import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HabitsPage } from './pages/HabitsPage'
import { TodayPage } from './pages/TodayPage'
import { InsightsPage } from './pages/InsightsPage'
import { SettingsPage } from './pages/SettingsPage'
import { CalendarPage } from './pages/CalendarPage'

const App = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<TodayPage />} />
        <Route path="/habits" element={<HabitsPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
