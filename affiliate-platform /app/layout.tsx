import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { PrivyClientProvider } from "@/components/privy-provider"
import { PrivyAuthProvider } from "@/components/privy-auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { I18nProvider } from "@/components/i18n-context"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MOT Affiliate Hub",
  description: "MOT Web3 affiliate dashboard with multi-login, referrals, and wallet management",
  generator: "Next.js",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <ThemeProvider>
          <PrivyClientProvider>
            <PrivyAuthProvider>
              <I18nProvider>
                {children}
                <Analytics />
              </I18nProvider>
            </PrivyAuthProvider>
          </PrivyClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
