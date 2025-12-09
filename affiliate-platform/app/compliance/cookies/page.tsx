"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"

export default function CookiePolicyPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cookie Policy</h1>
          <p className="text-foreground/60 mt-2">Last updated: November 10, 2025</p>
        </div>

        <Card className="p-8 bg-card max-w-none">
          <div className="space-y-6 text-foreground">
            <section>
              <h2 className="text-2xl font-bold mb-3">1. What are Cookies?</h2>
              <p className="text-foreground/80">
                Cookies are small data files stored on your device that help us recognize you and enhance your
                experience. They can be session-based (deleted when you close your browser) or persistent (remain until
                manually deleted).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">2. Types of Cookies We Use</h2>
              <div className="space-y-3 text-foreground/80">
                <div>
                  <h3 className="font-semibold mb-1">Essential Cookies:</h3>
                  <p>
                    Required for authentication, security, and basic platform functionality. These cannot be disabled.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Performance Cookies:</h3>
                  <p>
                    Help us understand how you interact with the platform to improve performance and user experience.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Tracking Cookies:</h3>
                  <p>Used to monitor referral link performance and conversion tracking across our network.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Marketing Cookies:</h3>
                  <p>Enable personalized marketing and advertising preferences.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">3. Managing Your Cookie Preferences</h2>
              <p className="text-foreground/80">
                You can control cookie settings through your browser. Most browsers allow you to refuse cookies or alert
                you when cookies are being sent. Please note that disabling essential cookies may affect platform
                functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">4. Third-Party Cookies</h2>
              <p className="text-foreground/80">
                Third-party service providers (analytics, payment processors, advertising networks) may set their own
                cookies. We recommend reviewing their privacy policies for more information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">5. Cookie Duration</h2>
              <p className="text-foreground/80">
                Most cookies expire after 1-2 years. Authentication cookies typically expire after 30 days or when you
                log out. You can clear cookies at any time through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">6. Questions?</h2>
              <p className="text-foreground/80">
                For more information about our cookie practices, please contact us at cookies@affiliatehub.com.
              </p>
            </section>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
