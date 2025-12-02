import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { Sun, CloudRain, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    login(formData.get('email') as string, formData.get('password') as string)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Sun className="w-12 h-12 text-yellow-500" />
              <Zap className="w-6 h-6 text-orange-500 absolute -bottom-1 -right-1" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Weather Forecast</CardTitle>
          <p className="text-center text-muted-foreground">Monitoring of weather conditions</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue="admin@example.com"
                required
                className='border-black border-2'
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                defaultValue="123456"
                required
                className='border-black border-2'
              />
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              className="w-full hover:border-2"
              onClick={() => navigate('/register')}
            >
              Create account
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <CloudRain className="inline-block w-4 h-4 mr-1" />
            Data collected from various cities in Brazil
          </div>
        </CardContent>
      </Card>
    </div>
  )
}