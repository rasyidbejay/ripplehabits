import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HabitsPage } from './pages/HabitsPage'
import { InsightsPage } from './pages/InsightsPage'

const App = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HabitsPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
