"use client"

import { useState } from "react"
import { Search, Menu, Wallet, Bell } from "lucide-react"
import UserProfileMenu from "@/components/user-profile-menu"

interface TopHeaderProps {
  onMenuClick: () => void
}

export default function TopHeader({ onMenuClick }: TopHeaderProps) {
  const [country, setCountry] = useState("United States")
  const [currency, setCurrency] = useState("USD")

  return (
    <header className="bg-card border-b border-border px-6 md:px-8 py-4 flex items-center justify-between gap-4">
      {/* Left: Search and Menu */}
      <div className="flex items-center gap-4 flex-1">
        <button onClick={onMenuClick} className="hidden lg:block p-2 hover:bg-muted rounded-md">
          <Menu size={20} className="text-foreground" />
        </button>

        <div className="hidden md:flex items-center gap-2 bg-muted px-3 py-2 rounded-lg flex-1 max-w-md">
          <Search size={18} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Right: Controls and User */}
      <div className="flex items-center gap-4">
        {/* Country dropdown */}
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="hidden lg:flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-sm border border-border cursor-pointer hover:bg-muted/80"
        >
          <option>United States</option>
          <option>United Kingdom</option>
          <option>Canada</option>
          <option>Australia</option>
        </select>

        {/* Currency dropdown */}
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="hidden lg:flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-sm border border-border cursor-pointer hover:bg-muted/80"
        >
          <option>USD</option>
          <option>EUR</option>
          <option>GBP</option>
          <option>USDC</option>
        </select>

        {/* Notification icon */}
        <button className="relative p-2 hover:bg-muted rounded-lg">
          <Bell size={20} className="text-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </button>

        {/* Earnings badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-accent rounded-full text-accent-foreground font-semibold text-sm">
          <Wallet size={16} />
          Earned $870
        </div>

        {/* User Profile Menu */}
        <UserProfileMenu />
      </div>
    </header>
  )
}
