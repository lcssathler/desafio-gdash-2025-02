import { createContext, useContext, useState, type ReactNode } from 'react'
import axios from 'axios'

interface AuthContextType {
  user: any
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await axios.post('http://localhost:3000/auth/login', { email, password })
      localStorage.setItem('token', res.data.access_token)
      setUser({ email })
      window.location.href = '/dashboard'
    } catch (err) {
      alert('Login inválido')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) as AuthContextType