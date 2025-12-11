"use client";

import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { I18nProvider } from "@/lib/i18n";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  const router = useRouter();

  return (
    <I18nProvider>
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Terms &amp; Conditions</h1>
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
          </div>

          <Card className="border border-muted/60 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Agreement for using AUREX.</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
              <p>
                These Terms &amp; Conditions govern your use of the AUREX platform. By creating
                an account or using the service, you agree to these terms.
              </p>

              <h2 className="text-base font-semibold text-foreground mt-4">1. Service description</h2>
              <p>
                AUREX provides online tools for managing clients, invoices, quotations, and other
                business records. The platform is provided on an "as is" basis and may evolve
                over time.
              </p>

              <h2 className="text-base font-semibold text-foreground mt-4">2. Data security & privacy</h2>
              <p>
                We operate AUREX on secure servers and follow industry-standard security
                practices to protect your information. Data in transit is protected with HTTPS,
                and access to infrastructure is restricted to authorised personnel. Our
                <a href="/privacy" className="text-primary font-medium ml-1">
                  Privacy Policy
                </a>
                explains in detail how your information is collected, used, and protected.
              </p>

              <h2 className="text-base font-semibold text-foreground mt-4">3. Ownership of data</h2>
              <p>
                You remain the owner of the data you store in AUREX. We do not claim ownership of
                your business records, invoices, client lists, or any other content you upload.
              </p>

              <h2 className="text-base font-semibold text-foreground mt-4">4. No sale or misuse of personal data</h2>
              <p>
                We do not sell your personal data or use it for unrelated advertising. We use
                your information strictly to operate, secure, and improve the AUREX service.
              </p>

              <h2 className="text-base font-semibold text-foreground mt-4">5. Account deletion & data removal</h2>
              <p>
                If you delete your account, we begin the removal process for your associated
                business data. Your information is removed from active systems within
                <span className="font-semibold"> 7 days </span> of confirmed deletion. Residual
                copies may remain in encrypted backups for a limited technical period before they
                are permanently removed.
              </p>

              <h2 className="text-base font-semibold text-foreground mt-4">6. Your responsibilities</h2>
              <p>
                You are responsible for keeping your login details confidential and for the
                actions taken from your account. You agree not to share your password, attempt to
                break security controls, or misuse the service in any way.
              </p>

              <h2 className="text-base font-semibold text-foreground mt-4">7. Acceptable use</h2>
              <p>
                You agree not to use AUREX to store or transmit unlawful content, spam, or
                malicious code, or to attempt unauthorised access to any part of the service or
                related systems.
              </p>

              <h2 className="text-base font-semibold text-foreground mt-4">8. Changes to the service</h2>
              <p>
                We may improve or modify AUREX from time to time. We will make reasonable efforts
                to keep the platform stable and reliable, but we do not guarantee uninterrupted
                availability.
              </p>

              <h2 className="text-base font-semibold text-foreground mt-4">9. Limitation of liability</h2>
              <p>
                While we take security and reliability seriously, AUREX is provided without
                warranties of any kind. To the maximum extent permitted by law, we are not liable
                for indirect, incidental, or consequential damages arising from use of the
                service.
              </p>

              <h2 className="text-base font-semibold text-foreground mt-4">10. Contact</h2>
              <p>
                For questions about these Terms &amp; Conditions, please contact us at
                <a href="mailto:hello@aurex.sbs" className="text-primary font-medium ml-1">
                  hello@aurex.sbs
                </a>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </I18nProvider>
  );
}
