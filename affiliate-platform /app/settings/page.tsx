"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Lock, User, Eye, EyeOff, Save } from "lucide-react"

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [settings, setSettings] = useState({
    email: "john@example.com",
    fullName: "John Doe",
    businessName: "John's Digital Marketing",
    phone: "+1 (555) 123-4567",
    country: "United States",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    emailNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    payoutAlerts: true,
  })

  const handleChange = (field: string, value: any) => {
    setSettings({ ...settings, [field]: value })
  }

  const handleSave = () => {
    // Handle save logic here
    console.log("Settings saved:", settings)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-foreground/60 mt-2">Manage your account and preferences</p>
        </div>

        {/* Profile Settings */}
        <Card className="p-6 bg-card">
          <div className="flex items-center gap-3 mb-6">
            <User size={24} className="text-accent" />
            <h2 className="text-xl font-bold text-foreground">Profile Settings</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                <input
                  type="text"
                  value={settings.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Business Name</label>
                <input
                  type="text"
                  value={settings.businessName}
                  onChange={(e) => handleChange("businessName", e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Country</label>
                <select
                  value={settings.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option>United States</option>
                  <option>Canada</option>
                  <option>United Kingdom</option>
                  <option>Australia</option>
                  <option>Germany</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} className="bg-accent hover:bg-accent/90">
                <Save size={16} className="mr-2" />
                Save Profile
              </Button>
            </div>
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="p-6 bg-card">
          <div className="flex items-center gap-3 mb-6">
            <Lock size={24} className="text-accent" />
            <h2 className="text-xl font-bold text-foreground">Security Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={settings.currentPassword}
                  onChange={(e) => handleChange("currentPassword", e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
                <input
                  type="password"
                  value={settings.newPassword}
                  onChange={(e) => handleChange("newPassword", e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={settings.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button className="bg-accent hover:bg-accent/90">
                <Lock size={16} className="mr-2" />
                Update Password
              </Button>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6 bg-card">
          <div className="flex items-center gap-3 mb-6">
            <Bell size={24} className="text-accent" />
            <h2 className="text-xl font-bold text-foreground">Notification Preferences</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-background">
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-foreground/60">Receive updates via email</p>
              </div>
              <label className="relative inline-block w-12 h-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleChange("emailNotifications", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-full h-full bg-gray-300 peer-focus:outline peer-focus:outline-2 rounded-full peer-checked:bg-accent transition-colors"></div>
                <span className="absolute left-0 top-1/2 -translate-y-1/2 inline-block w-5 h-5 transform rounded-full bg-white shadow peer-checked:translate-x-6 transition-transform"></span>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-background">
              <div>
                <p className="font-medium text-foreground">SMS Notifications</p>
                <p className="text-sm text-foreground/60">Receive text message alerts</p>
              </div>
              <label className="relative inline-block w-12 h-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => handleChange("smsNotifications", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-full h-full bg-gray-300 peer-focus:outline peer-focus:outline-2 rounded-full peer-checked:bg-accent transition-colors"></div>
                <span className="absolute left-0 top-1/2 -translate-y-1/2 inline-block w-5 h-5 transform rounded-full bg-white shadow peer-checked:translate-x-6 transition-transform"></span>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-background">
              <div>
                <p className="font-medium text-foreground">Weekly Reports</p>
                <p className="text-sm text-foreground/60">Get your weekly performance summary</p>
              </div>
              <label className="relative inline-block w-12 h-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.weeklyReports}
                  onChange={(e) => handleChange("weeklyReports", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-full h-full bg-gray-300 peer-focus:outline peer-focus:outline-2 rounded-full peer-checked:bg-accent transition-colors"></div>
                <span className="absolute left-0 top-1/2 -translate-y-1/2 inline-block w-5 h-5 transform rounded-full bg-white shadow peer-checked:translate-x-6 transition-transform"></span>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-background">
              <div>
                <p className="font-medium text-foreground">Payout Alerts</p>
                <p className="text-sm text-foreground/60">Notify me when payouts are processed</p>
              </div>
              <label className="relative inline-block w-12 h-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.payoutAlerts}
                  onChange={(e) => handleChange("payoutAlerts", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-full h-full bg-gray-300 peer-focus:outline peer-focus:outline-2 rounded-full peer-checked:bg-accent transition-colors"></div>
                <span className="absolute left-0 top-1/2 -translate-y-1/2 inline-block w-5 h-5 transform rounded-full bg-white shadow peer-checked:translate-x-6 transition-transform"></span>
              </label>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
