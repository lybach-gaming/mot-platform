'use client'

import { usePrivy } from '@privy-io/react-auth'
import { createContext, useContext, type ReactNode } from 'react'

interface User {
  id: string
  email?: string
  walletAddress?: string
  phoneNumber?: string
  name?: string
}

interface PrivyAuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: () => void
  logout: () => Promise<void>
  ready: boolean
}

const PrivyAuthContext = createContext<PrivyAuthContextType | undefined>(undefined)

export function PrivyAuthProvider({ children }: { children: ReactNode }) {
  const { user, ready, authenticated, login, logout } = usePrivy()

  const mappedUser: User | null = user
    ? {
        id: user.id,
        email: user.email?.address,
        walletAddress:
          user.linkedAccounts
            ?.find((account) => account.type === 'wallet')
            ?.address || undefined,
        phoneNumber: user.phoneNumber?.number,
        name: user.name,
      }
    : null

  const handleLogout = async () => {
    await logout()
  }

  return (
    <PrivyAuthContext.Provider
      value={{
        user: mappedUser,
        isLoading: !ready,
        isAuthenticated: authenticated,
        login,
        logout: handleLogout,
        ready,
      }}
    >
      {children}
    </PrivyAuthContext.Provider>
  )
}

export function usePrivyAuth() {
  const context = useContext(PrivyAuthContext)
  if (context === undefined) {
    throw new Error('usePrivyAuth must be used within PrivyAuthProvider')
  }
  return context
}
