"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
          <p className="text-foreground/60 mt-2">Last updated: November 10, 2025</p>
        </div>

        <Card className="p-8 bg-card max-w-none">
          <div className="space-y-6 text-foreground">
            <section>
              <h2 className="text-2xl font-bold mb-3">1. Introduction</h2>
              <p className="text-foreground/80">
                AffiliateHub ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy
                Policy explains how we collect, use, disclose, and safeguard your information when you use our affiliate
                platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">2. Information We Collect</h2>
              <p className="text-foreground/80 mb-3">We collect information in the following ways:</p>
              <div className="space-y-3 text-foreground/80">
                <div>
                  <h3 className="font-semibold mb-1">Personal Information:</h3>
                  <p>
                    Name, email address, phone number, business information, payment details, and identification
                    documents for KYC verification.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Usage Data:</h3>
                  <p>
                    Information about how you use our platform, including referral links generated, clicks, conversions,
                    and earnings.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Technical Data:</h3>
                  <p>
                    IP address, browser type, operating system, and cookies to enhance user experience and security.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">3. How We Use Your Information</h2>
              <p className="text-foreground/80 mb-3">We use collected information for:</p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80">
                <li>Processing payments and commissions</li>
                <li>Verifying identity and preventing fraud</li>
                <li>Improving our services and user experience</li>
                <li>Sending transactional and promotional emails</li>
                <li>Complying with legal and regulatory requirements</li>
                <li>Analyzing platform usage and trends</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">4. Data Security</h2>
              <p className="text-foreground/80">
                We implement industry-standard security measures including SSL encryption, regular security audits, and
                secure data centers. However, no method of transmission over the internet is completely secure. While we
                strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">5. Data Retention</h2>
              <p className="text-foreground/80">
                We retain personal data for as long as your account is active and as needed to comply with legal
                obligations. You may request deletion of your data subject to legal requirements and unresolved
                disputes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">6. Third-Party Sharing</h2>
              <p className="text-foreground/80">
                We do not sell your personal information. We may share data with service providers, payment processors,
                and legal authorities when required by law. All third parties are bound by confidentiality agreements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">7. Your Rights</h2>
              <p className="text-foreground/80 mb-3">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80">
                <li>Access your personal data</li>
                <li>Request corrections to inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Data portability in common formats</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">8. Contact Us</h2>
              <p className="text-foreground/80">
                For privacy-related inquiries, contact us at privacy@affiliatehub.com or through our contact form.
              </p>
            </section>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
