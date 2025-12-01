import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut } from 'lucide-react'

export default function Header() {
  const { logout, user } = useAuth()

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Weather Forecast</h1>
        </div>
        <div className="flex items-center gap-4">
          {user?.name && (
            <span className="text-sm text-black-600">Welcome, {user.name}</span>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={logout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
