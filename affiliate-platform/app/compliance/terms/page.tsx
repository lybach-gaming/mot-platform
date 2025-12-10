"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
          <p className="text-foreground/60 mt-2">Last updated: November 10, 2025</p>
        </div>

        <Card className="p-8 bg-card prose prose-invert max-w-none">
          <div className="space-y-6 text-foreground">
            <section>
              <h2 className="text-2xl font-bold mb-3">1. Agreement to Terms</h2>
              <p className="text-foreground/80">
                These Terms of Service ("Terms") constitute a legally binding agreement between you ("User" or
                "Affiliate") and AffiliateHub ("Company," "we," "us," or "our"). By accessing or using our platform, you
                agree to be bound by these Terms. If you do not agree to any part of these Terms, you may not use our
                services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">2. Affiliate Program Rules</h2>
              <p className="text-foreground/80 mb-3">As an affiliate in our program, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80">
                <li>Provide accurate and truthful information in your profile</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not engage in fraudulent or deceptive marketing practices</li>
                <li>Not use spam, phishing, or malware in promotion</li>
                <li>Respect intellectual property rights</li>
                <li>Not bid on company trademarked keywords without permission</li>
                <li>Maintain confidentiality of affiliate account credentials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">3. Commission and Payment</h2>
              <p className="text-foreground/80 mb-3">
                Commission rates and terms are specified in individual affiliate program agreements. The Company
                reserves the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80">
                <li>Modify commission rates with 30 days written notice</li>
                <li>Withhold payment for fraudulent or suspicious activity</li>
                <li>Deduct commissions for refunds or chargebacks</li>
                <li>Maintain a minimum payout threshold of $50</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">4. Account Termination</h2>
              <p className="text-foreground/80">
                The Company may terminate your affiliate account immediately if you violate these Terms or engage in
                prohibited activities. Upon termination, all unpaid commissions earned prior to the termination date
                will be forfeited.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">5. Limitation of Liability</h2>
              <p className="text-foreground/80">
                To the fullest extent permitted by law, the Company shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages, including lost profits, even if advised of the possibility
                of such damages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">6. Dispute Resolution</h2>
              <p className="text-foreground/80">
                Any disputes arising from these Terms shall be resolved through binding arbitration in accordance with
                the rules of the American Arbitration Association. Both parties waive the right to a jury trial.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">7. Changes to Terms</h2>
              <p className="text-foreground/80">
                We reserve the right to modify these Terms at any time. Continued use of the platform following
                notification of changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">8. Contact Information</h2>
              <p className="text-foreground/80">
                For questions regarding these Terms, please contact us at legal@affiliatehub.com or through our contact
                form.
              </p>
            </section>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
