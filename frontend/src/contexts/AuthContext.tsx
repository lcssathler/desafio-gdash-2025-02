import { createContext, useContext, useState, type ReactNode } from 'react'
import axios from 'axios'
import { toast } from 'sonner'

interface AuthContextType {
  user: any
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
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
      toast.success('Login successfully!', {
        description: `Welcome, ${email}`,
        duration: 3000,
        position: 'top-right',
      })
      setTimeout(() => {
        window.location.href = '/home'
      }, 500)
    } catch (err) {
      toast.error('Login inválido', {
        description: 'Verifique suas credenciais',
        duration: 3000,
        position: 'top-right',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await axios.post('http://localhost:3000/users/register', { name, email, password })
      localStorage.setItem('token', res.data.access_token)
      setUser({ name, email })
      toast.success('User created successfully!', {
        description: `Welcome, ${name}`,
        duration: 3000,
        position: 'top-right',
      })
      setTimeout(() => {
        window.location.href = '/login'
      }, 500)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'error create account'
      toast.error('Erro ao registrar', {
        description: errorMessage,
        duration: 3000,
        position: 'top-right',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    toast.success('Logout concluded', {
      description: 'See ya!',
      duration: 2000,
      position: 'top-right',
    })
    setTimeout(() => {
      window.location.href = '/'
    }, 500)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) as AuthContextType