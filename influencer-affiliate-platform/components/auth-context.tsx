"use client"
import { createContext, useContext, useState, type ReactNode } from "react"

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  walletAddress?: string
  referralCode?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      setUser({
        id: "1",
        email,
        name: "John Doe",
        walletAddress: "EJwyCDwXYoUgCQcsFuYAQRjSGukxFV2ne7DqJMoWFVJ3",
        referralCode: "JOHN2024",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setUser({
        id: "1",
        email,
        name,
        walletAddress: "EJwyCDwXYoUgCQcsFuYAQRjSGukxFV2ne7DqJMoWFVJ3",
        referralCode: `${name.toUpperCase().slice(0, 4)}${Date.now().toString().slice(-4)}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
