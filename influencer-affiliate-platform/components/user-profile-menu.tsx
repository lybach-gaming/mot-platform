'use client'

import Link from 'next/link'
import { usePrivyAuth } from '@/components/privy-auth-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, Settings, Wallet, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function UserProfileMenu() {
  const {ready, user, authenticated, logout } = usePrivyAuth()
  const router = useRouter()

  if (!user) return null

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const disableLogout = !ready || (ready && !authenticated);

  const displayName = user.name || user.email?.split('@')[0] || 'User'
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-accent text-accent-foreground font-bold">
          {initials}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col space-y-1">
          <p className="font-semibold">{displayName}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>My Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/wallet" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            <span>Wallet</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="text-destructive cursor-pointer">
          <button onClick={handleLogout} className="flex items-center w-full">
            <LogOut className="w-4 h-4 mr-2" />
            <span>Logout</span>
          </button>
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  )
}
