"use client"

import { PrivyProvider } from "@privy-io/react-auth"
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana"
import type { ReactNode } from "react"

export function PrivyClientProvider({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        externalWallets: {solana: {connectors: toSolanaWalletConnectors()}},
        appearance: {
          theme: "dark",
          accentColor: "#22c55e", // green accent color for MOT branding
          showWalletLoginFirst: true,
          logo: "/icon.svg",
          walletChainType: "solana-only", // restrict to Solana wallets only
          walletList: ["phantom", "solflare", "backpack"], // Solana wallet list
        },
      
        loginMethods: ["email", "wallet", "google", "twitter", "telegram"],
        embeddedWallets: {
          solana: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  )
}
