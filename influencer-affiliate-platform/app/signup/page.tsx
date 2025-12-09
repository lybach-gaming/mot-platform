"use client"

import Link from "next/link"
import { PrivySignupForm } from "@/components/privy-signup-form"
import { Wallet, ArrowLeft } from "lucide-react"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated gradient background elements for Web3 aesthetic */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center justify-center mb-12">
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition"></div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center transform hover:scale-110 transition">
              <Wallet className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white text-center">MOT Affiliate Hub</h1>
          <p className="text-emerald-400 text-sm mt-2">Join Web3's Premier Affiliate Network</p>
        </div>

        {/* Card with Glassmorphism */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-8 shadow-2xl hover:border-white/30 transition">
          <h2 className="text-2xl font-bold text-white mb-2">Get started</h2>
          <p className="text-slate-300 mb-8">Join thousands of affiliates earning with MOT</p>

          <PrivySignupForm />

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <span className="text-xs text-slate-400">HAVE ACCOUNT?</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-slate-300 text-sm">
              <Link
                href="/login"
                className="text-green-400 hover:text-green-300 font-semibold flex items-center justify-center gap-1 group cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
                Sign in instead
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-8">
          By signing up, you agree to our{" "}
          <Link href="/compliance/terms" className="text-green-400 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/compliance/privacy" className="text-green-400 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
