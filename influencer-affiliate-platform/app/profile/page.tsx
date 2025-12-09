'use client'

import { usePrivyAuth } from '@/components/privy-auth-context'
import DashboardLayout from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Wallet, Copy } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const { user, isAuthenticated, ready } = usePrivyAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, ready, router])

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? 'default' : 'outline'}>
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="p-8">
          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                {(user.name || user.email || 'U')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{user.name || user.email}</h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>

            {/* User Info Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Email Address
                </Label>
                <Input value={user.email || ''} disabled={!isEditing} />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Display Name
                </Label>
                <Input value={user.name || ''} disabled={!isEditing} />
              </div>
            </div>

            {/* Wallet Address */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Wallet Address
              </Label>
              <div className="flex gap-2">
                <Input value={user.walletAddress || 'Not connected'} disabled />
                <Button variant="outline" size="icon">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Phone Number */}
            {user.phoneNumber && (
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={user.phoneNumber} disabled />
              </div>
            )}
          </div>
        </Card>

        {/* Account Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-muted-foreground text-sm mb-2">Account Status</p>
            <p className="text-2xl font-bold text-accent">Active</p>
          </Card>
          <Card className="p-6">
            <p className="text-muted-foreground text-sm mb-2">Member Since</p>
            <p className="text-lg font-bold text-foreground">Today</p>
          </Card>
          <Card className="p-6">
            <p className="text-muted-foreground text-sm mb-2">Account Tier</p>
            <p className="text-lg font-bold text-foreground">Starter</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
