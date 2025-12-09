'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Wallet, Mail } from 'lucide-react'

export function PrivySignupForm() {
  const { login, user, authenticated } = usePrivy()
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'wallet' | 'complete'>('email')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (authenticated && user) {
      router.push('/')
    }
  }, [authenticated, user, router])

  const handleSignupClick = async () => {
    setIsLoading(true)
    try {
      login()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Step Indicators */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4 flex-1">
          {/* Email Step */}
          <div className={`flex flex-col items-center ${step === 'email' || step === 'wallet' || step === 'complete' ? 'text-accent' : 'text-muted-foreground'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
              step === 'email' || step === 'wallet' || step === 'complete'
                ? 'border-accent bg-accent/10'
                : 'border-muted'
            }`}>
              {step === 'email' || step === 'wallet' || step === 'complete' ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <Mail className="w-5 h-5" />
              )}
            </div>
            <span className="text-xs mt-2">Email</span>
          </div>

          <div className={`flex-1 h-1 ${step === 'wallet' || step === 'complete' ? 'bg-accent' : 'bg-muted'}`} />

          {/* Wallet Step */}
          <div className={`flex flex-col items-center ${step === 'wallet' || step === 'complete' ? 'text-accent' : 'text-muted-foreground'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
              step === 'wallet' || step === 'complete'
                ? 'border-accent bg-accent/10'
                : 'border-muted'
            }`}>
              {step === 'complete' ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <Wallet className="w-5 h-5" />
              )}
            </div>
            <span className="text-xs mt-2">Wallet</span>
          </div>
        </div>
      </div>

      {/* Content Cards */}
      {step === 'email' && (
        <Card className="p-6 border-2 border-accent/20">
          <h3 className="text-lg font-semibold mb-4">Create your account</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Sign up with your email address to get started with MOT Affiliate Hub. Secure, simple, and Web3-native.
          </p>
          <Button
            onClick={handleSignupClick}
            disabled={isLoading}
            size="lg"
            className="w-full"
          >
            {isLoading ? 'Setting up...' : 'Continue with Email'}
          </Button>
        </Card>
      )}

      {step === 'wallet' && (
        <Card className="p-6 border-2 border-accent/20">
          <h3 className="text-lg font-semibold mb-4">Connect your Solana wallet</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Link your Solana wallet to receive affiliate payouts directly on-chain. You can add more wallets later.
          </p>
          <Button
            onClick={handleSignupClick}
            disabled={isLoading}
            size="lg"
            className="w-full gap-2"
          >
            <Wallet className="w-4 h-4" />
            {isLoading ? 'Connecting...' : 'Connect Solana Wallet'}
          </Button>
        </Card>
      )}

      {step === 'complete' && (
        <Card className="p-6 border-2 border-green-500/20 bg-green-500/5">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-semibold">Account created!</h3>
          </div>
          <p className="text-muted-foreground text-sm mb-6">
            Welcome to MOT Affiliate Hub. Your account is ready to use. Redirecting to dashboard...
          </p>
        </Card>
      )}

      {/* Info Box */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
        <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">Multi-chain support</p>
          <p>Start with Solana and add Ethereum or other chains later in settings.</p>
        </div>
      </div>
    </div>
  )
}
