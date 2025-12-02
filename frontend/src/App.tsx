import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import CitySelection from './pages/CitySelection'
import CityDetail from './pages/CityDetail'
import { AuthProvider } from './contexts/AuthContext'


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/cities" element={<CitySelection />} />
          <Route path="/city/:cityId" element={<CityDetail />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App