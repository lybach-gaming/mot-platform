"use client"
import { useState } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

export default function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0)
  const router = useRouter()
  const { signup, isLoading } = useAuth()

  const checkPasswordStrength = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 8) strength++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
    if (/\d/.test(pwd)) strength++
    if (/[^a-zA-Z\d]/.test(pwd)) strength++
    setPasswordStrength(strength)
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    checkPasswordStrength(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password || !name) {
      setError("Please fill in all fields")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    try {
      await signup(email, password, name)
      router.push("/")
    } catch (err) {
      setError("Signup failed. Please try again.")
    }
  }

  const strengthLabels = ["Weak", "Fair", "Good", "Strong", "Very Strong"]
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-green-600"]

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          disabled={isLoading}
        />
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                passwordStrength === 0 ? "w-0" : strengthColors[Math.min(passwordStrength - 1, 4)]
              }`}
              style={{ width: `${(passwordStrength / 4) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{strengthLabels[passwordStrength]}</span>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  )
}
