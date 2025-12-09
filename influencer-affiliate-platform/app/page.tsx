'use client'

import { usePrivyAuth } from '@/components/privy-auth-context'
import DashboardLayout from '@/components/dashboard-layout'
import DashboardContent from '@/components/dashboard-content'
import QuickActionsBar from '@/components/quick-actions-bar'
import WalletPanel from '@/components/wallet-panel'
import ConversionDrillDown from '@/components/conversion-drill-down'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { isAuthenticated, ready } = usePrivyAuth()
  const router = useRouter()

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

  if (!isAuthenticated) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DashboardContent />
        <QuickActionsBar />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ConversionDrillDown />
          </div>
          <div>
            <WalletPanel />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
