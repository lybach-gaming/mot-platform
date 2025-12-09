"use client"

import type React from "react"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, ChevronDown, Mail, MessageSquare, Phone, FileText } from "lucide-react"

const faqs = [
  {
    category: "Getting Started",
    items: [
      {
        q: "How do I create my first referral link?",
        a: 'Navigate to "Referral Link Generator" in the main menu. Click "New Referral Link", enter a name for your campaign, and the system will generate a unique link for you.',
      },
      {
        q: "How long does it take for commissions to be paid out?",
        a: "Commissions are typically processed within 5-7 business days after a successful conversion. You can track the status in your Wallet & Payouts section.",
      },
      {
        q: "What are the commission rates?",
        a: "Commission rates vary by product but typically range from 15% to 30% per sale. You can see specific rates for each product in the Available Offers section.",
      },
    ],
  },
  {
    category: "Technical Issues",
    items: [
      {
        q: "My referral link is not tracking clicks",
        a: "Ensure your link is formatted correctly and includes the unique tracking parameter. If issues persist, clear your browser cache and try again. Contact support if problems continue.",
      },
      {
        q: "Why are my conversions not showing up?",
        a: "Conversions typically appear within a few hours. Check that the referred customer completed the entire purchase process. Some transactions may take longer to verify.",
      },
      {
        q: "How do I update my payment information?",
        a: "Go to Settings > Wallet Settings to add or update your payment methods including bank transfer, crypto wallet, or PayPal account.",
      },
    ],
  },
  {
    category: "Account Management",
    items: [
      {
        q: "How do I change my password?",
        a: "Visit Settings and navigate to Security Settings. Enter your current password and your new password, then click Update Password.",
      },
      {
        q: "Can I have multiple affiliate accounts?",
        a: "Each affiliate is limited to one active account. If you need a separate account for business purposes, please contact our support team.",
      },
      {
        q: "How do I withdraw my earnings?",
        a: 'Navigate to Wallet & Payouts, review your available balance, and click "Request Payout". Select your preferred payment method and amount.',
      },
    ],
  },
]

export default function HelpPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [contactForm, setContactForm] = useState({
    name: "John Doe",
    email: "john@example.com",
    subject: "",
    message: "",
  })

  const filteredFaqs = faqs
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.a.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.items.length > 0)

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Contact form submitted:", contactForm)
    setContactForm({ ...contactForm, subject: "", message: "" })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
          <p className="text-foreground/60 mt-2">Find answers and get help from our support team</p>
        </div>

        {/* Search Bar */}
        <Card className="p-6 bg-card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60" size={20} />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-md bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-card hover:border-accent transition-colors cursor-pointer">
            <MessageSquare size={24} className="text-accent mb-3" />
            <p className="font-semibold text-foreground">Live Chat</p>
            <p className="text-sm text-foreground/60 mt-1">Chat with our support team</p>
          </Card>
          <Card className="p-6 bg-card hover:border-accent transition-colors cursor-pointer">
            <Mail size={24} className="text-accent mb-3" />
            <p className="font-semibold text-foreground">Email Support</p>
            <p className="text-sm text-foreground/60 mt-1">support@affiliatehub.com</p>
          </Card>
          <Card className="p-6 bg-card hover:border-accent transition-colors cursor-pointer">
            <Phone size={24} className="text-accent mb-3" />
            <p className="font-semibold text-foreground">Phone Support</p>
            <p className="text-sm text-foreground/60 mt-1">+1 (555) 123-4567</p>
          </Card>
          <Card className="p-6 bg-card hover:border-accent transition-colors cursor-pointer">
            <FileText size={24} className="text-accent mb-3" />
            <p className="font-semibold text-foreground">Documentation</p>
            <p className="text-sm text-foreground/60 mt-1">Full API & Integration docs</p>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="p-6 bg-card">
          <h2 className="text-xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((category, catIdx) => (
                <div key={catIdx}>
                  <h3 className="text-sm font-semibold text-accent uppercase mb-2">{category.category}</h3>
                  {category.items.map((faq, idx) => (
                    <div key={idx} className="border border-border rounded-lg mb-2 overflow-hidden">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                        className="w-full flex items-center justify-between p-4 bg-background hover:bg-background/80 transition-colors"
                      >
                        <p className="text-foreground font-medium text-left">{faq.q}</p>
                        <ChevronDown
                          size={20}
                          className={`flex-shrink-0 text-foreground/60 transition-transform ${expandedFaq === idx ? "rotate-180" : ""}`}
                        />
                      </button>
                      {expandedFaq === idx && (
                        <div className="p-4 bg-card border-t border-border">
                          <p className="text-foreground/80">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <p className="text-foreground/60 text-center py-8">No results found for "{searchQuery}"</p>
            )}
          </div>
        </Card>

        {/* Contact Form */}
        <Card className="p-6 bg-card">
          <h2 className="text-xl font-bold text-foreground mb-6">Still need help? Contact us</h2>
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-md bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-md bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
              <input
                type="text"
                value={contactForm.subject}
                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                placeholder="How can we help?"
                className="w-full px-4 py-2 rounded-md bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Message</label>
              <textarea
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder="Tell us what you need..."
                rows={5}
                className="w-full px-4 py-2 rounded-md bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              />
            </div>
            <Button type="submit" className="w-full md:w-auto bg-accent hover:bg-accent/90">
              Send Message
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}
