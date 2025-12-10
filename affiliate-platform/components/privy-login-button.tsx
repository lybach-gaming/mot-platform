"use client"

import { usePrivy } from "@privy-io/react-auth"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"

export function PrivyLoginButton() {
  const { login } = usePrivy()

  return (
    <Button onClick={() => login()} className="w-full gap-2 justify-center" size="lg">
      <LogIn className="w-4 h-4" />
      Sign In with Privy
    </Button>
  )
}
