"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Shield, Lock, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function CompliancePage() {
  const documents = [
    {
      title: "Terms of Service",
      description: "Legal terms governing use of the AffiliateHub platform",
      icon: FileText,
      href: "/compliance/terms",
      items: ["Affiliate Program Rules", "Commission Terms", "Dispute Resolution"],
    },
    {
      title: "Privacy Policy",
      description: "How we collect, use, and protect your personal data",
      icon: Shield,
      href: "/compliance/privacy",
      items: ["Data Collection", "Data Security", "Your Rights"],
    },
    {
      title: "Cookie Policy",
      description: "Information about cookies and tracking technologies",
      icon: Lock,
      href: "/compliance/cookies",
      items: ["Essential Cookies", "Performance Tracking", "Cookie Management"],
    },
  ]

  const complianceStandards = [
    { title: "GDPR Compliant", description: "Full compliance with EU General Data Protection Regulation" },
    { title: "CCPA Compliant", description: "California Consumer Privacy Act compliance" },
    { title: "SOC 2 Certified", description: "Security, availability, and confidentiality standards" },
    { title: "SSL/TLS Encrypted", description: "All data transmitted securely with 256-bit encryption" },
    { title: "Regular Audits", description: "Third-party security audits conducted quarterly" },
    { title: "Anti-Fraud Measures", description: "Advanced fraud detection and prevention systems" },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Compliance & Legal</h1>
          <p className="text-foreground/60 mt-2">Access legal documents and compliance information</p>
        </div>

        {/* Legal Documents */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Legal Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {documents.map((doc) => {
              const Icon = doc.icon
              return (
                <Link key={doc.href} href={doc.href}>
                  <Card className="p-6 bg-card hover:border-accent transition-all cursor-pointer h-full">
                    <Icon size={32} className="text-accent mb-4" />
                    <h3 className="text-lg font-bold text-foreground mb-2">{doc.title}</h3>
                    <p className="text-sm text-foreground/60 mb-4">{doc.description}</p>
                    <ul className="space-y-2 mb-4">
                      {doc.items.map((item) => (
                        <li key={item} className="text-sm text-foreground/70 flex items-start gap-2">
                          <CheckCircle size={16} className="text-accent flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full bg-accent hover:bg-accent/90 text-xs mt-auto">Read Document</Button>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Compliance Standards */}
        <Card className="p-8 bg-card border-2 border-accent/20">
          <h2 className="text-2xl font-bold text-foreground mb-6">Our Compliance Standards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {complianceStandards.map((standard) => (
              <div key={standard.title} className="flex gap-4">
                <CheckCircle size={24} className="text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground">{standard.title}</h3>
                  <p className="text-sm text-foreground/60 mt-1">{standard.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Certifications */}
        <Card className="p-8 bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20">
          <h2 className="text-2xl font-bold text-foreground mb-6">Certifications & Verifications</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-card rounded-lg border border-border text-center">
              <p className="font-bold text-accent text-lg">ISO 27001</p>
              <p className="text-xs text-foreground/60 mt-2">Information Security Management</p>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border text-center">
              <p className="font-bold text-accent text-lg">SOC 2 Type II</p>
              <p className="text-xs text-foreground/60 mt-2">Security Compliance</p>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border text-center">
              <p className="font-bold text-accent text-lg">PCI DSS</p>
              <p className="text-xs text-foreground/60 mt-2">Payment Card Security</p>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border text-center">
              <p className="font-bold text-accent text-lg">CCPA</p>
              <p className="text-xs text-foreground/60 mt-2">California Privacy</p>
            </div>
          </div>
        </Card>

        {/* Contact Compliance Team */}
        <Card className="p-8 bg-card border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-4">Compliance Questions?</h2>
          <p className="text-foreground/80 mb-6">
            For any compliance, legal, or privacy-related inquiries, please contact our compliance team.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-foreground/60 font-semibold mb-1">Email</p>
              <p className="text-foreground font-medium">compliance@affiliatehub.com</p>
            </div>
            <div>
              <p className="text-sm text-foreground/60 font-semibold mb-1">Legal Contact</p>
              <p className="text-foreground font-medium">legal@affiliatehub.com</p>
            </div>
          </div>
          <Button className="mt-6 bg-accent hover:bg-accent/90">Submit Compliance Request</Button>
        </Card>
      </div>
    </DashboardLayout>
  )
}
