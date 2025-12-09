"use client"
import Link from "next/link"
import {
  LayoutDashboard,
  Link2,
  TrendingUp,
  Zap,
  BarChart3,
  Wallet,
  Briefcase,
  Users,
  Settings,
  HelpCircle,
  Menu,
  X,
  LogOut,
  FileText,
} from "lucide-react"
import { useI18n } from "@/components/i18n-context"
import { usePrivyAuth } from "@/components/privy-auth-context"
import { useRouter } from "next/navigation"

interface SidebarProps {
  open: boolean
  onToggle: () => void
}

export default function Sidebar({ open, onToggle }: SidebarProps) {
  const { t, language, setLanguage } = useI18n()
  const { logout } = usePrivyAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const menuSections = [
    {
      label: t("mainMenu"),
      items: [
        { icon: LayoutDashboard, label: t("dashboard"), href: "/" },
        { icon: Link2, label: t("referralLinkGenerator"), href: "/new-referrals" },
        { icon: TrendingUp, label: t("activeCampaigns"), href: "/campaigns" },
        { icon: Zap, label: t("customLinkGenerator"), href: "/links" },
      ],
    },
    {
      label: t("earnings"),
      items: [
        { icon: BarChart3, label: t("earningsReports"), href: "/earnings" },
        { icon: Briefcase, label: t("commissionEarnings"), href: "/commissions" },
      ],
    },
    {
      label: t("affiliateProgram"),
      items: [
        { icon: Users, label: t("affiliateLeaderboard"), href: "/leaderboard" },
        { icon: Wallet, label: t("walletPayouts"), href: "/wallet" },
      ],
    },
    {
      label: t("preference"),
      items: [
        { icon: Settings, label: t("settings"), href: "/settings" },
        { icon: HelpCircle, label: t("helpCenter"), href: "/help" },
        { icon: FileText, label: t("compliance"), href: "/compliance" },
      ],
    },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-md bg-primary text-primary-foreground"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative z-40 lg:z-0 w-64 h-screen bg-sidebar border-r border-sidebar-border
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          overflow-y-auto flex flex-col
        `}
      >
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent/70 rounded-lg flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-sm">MOT</span>
            </div>
            <span className="text-sidebar-foreground font-bold text-lg">Affiliate Hub</span>
          </div>
        </div>

        {/* User info section */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent">
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sidebar-foreground font-semibold text-sm truncate">John Doe</p>
              <p className="text-sidebar-foreground/60 text-xs truncate">john@example.com</p>
            </div>
          </div>
        </div>

        {/* Menu sections */}
        <nav className="flex-1 px-4 py-6 space-y-6">
          {menuSections.map((section) => (
            <div key={section.label}>
              <p className="text-sidebar-foreground/50 text-xs font-semibold uppercase tracking-wide mb-3 px-3">
                {section.label}
              </p>
              <ul className="space-y-2">
                {section.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                      >
                        <Icon size={18} className="flex-shrink-0" />
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage("en")}
              className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                language === "en"
                  ? "bg-accent text-accent-foreground"
                  : "bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("fr")}
              className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                language === "fr"
                  ? "bg-accent text-accent-foreground"
                  : "bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80"
              }`}
            >
              FR
            </button>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm">{t("logout")}</span>
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onToggle} />}
    </>
  )
}
