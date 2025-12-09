'use client'

import Link from 'next/link'
import { usePrivyAuth } from '@/components/privy-auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Zap, Users, TrendingUp, Lock } from 'lucide-react'

export default function LandingPage() {
  const { isAuthenticated, ready } = usePrivyAuth()
  const router = useRouter()

  useEffect(() => {
    if (ready && isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, ready, router])

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-bold">MOT Affiliate Hub</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button className="gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Earn With MOT
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The first Web3-native affiliate program. Real-time payouts, transparent tracking, and Solana integration.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Start Earning
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-20">
          <div className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors">
            <Zap className="w-8 h-8 text-accent mb-3" />
            <h3 className="font-semibold mb-2">Real-time Payouts</h3>
            <p className="text-sm text-muted-foreground">Get paid instantly on-chain via Solana</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors">
            <TrendingUp className="w-8 h-8 text-accent mb-3" />
            <h3 className="font-semibold mb-2">Detailed Analytics</h3>
            <p className="text-sm text-muted-foreground">Track every click, conversion, and commission</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors">
            <Users className="w-8 h-8 text-accent mb-3" />
            <h3 className="font-semibold mb-2">Affiliate Network</h3>
            <p className="text-sm text-muted-foreground">Join thousands of Web3 affiliates</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors">
            <Lock className="w-8 h-8 text-accent mb-3" />
            <h3 className="font-semibold mb-2">Web3 Security</h3>
            <p className="text-sm text-muted-foreground">Your wallets, your keys, your security</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start earning?</h2>
          <p className="text-muted-foreground mb-8">Join MOT Affiliate Hub in less than 2 minutes</p>
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Sign Up Now
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
