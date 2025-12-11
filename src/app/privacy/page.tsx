"use client";

import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { I18nProvider } from "@/lib/i18n";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <I18nProvider>
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Privacy Policy</h1>
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
          </div>

          <Card className="border border-muted/60 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Your privacy, protected.</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
              <p>
                At AUREX, we take the security and confidentiality of your business data very
                seriously. This Privacy Policy explains how we collect, use, and protect the
                information you store in the platform.
              </p>

              <h2 className="text-base font-semibold text-foreground mt-4">1. Data we store</h2>
              <p>
                We store the information you provide when using the platform, including company
                details, client information, invoices, quotations, payments, and related
                accounting data. We do not collect more information than is necessary to
                operate and improve the service.
              </p>

              <h2 className="text-base font-semibold text-foreground mt-4">2. Secure servers & infrastructure</h2>
              <p>
                Your data is hosted on secure servers with modern security controls. We follow
                industry best practices for access control, encryption in transit (HTTPS), and
                regular security updates for our infrastructure.
              </p>

              <h2 className="text-base font-semibold text-foreground mt-4">3. How we use your data</h2>
              <p>
                We use your data only to provide and improve the AUREX service: generating
                invoices and quotations, managing clients, and producing reports. We do not sell,
                rent, or trade your personal or business information with third parties.
              </p>

              <h2 className="text-base font-semibold text-foreground mt-4">4. No selling or misuse of data</h2>
              <p>
                We do not sell your personal data or use it for unrelated advertising purposes.
                Any analytics we run are aggregated and anonymised wherever possible so that
                individual users and businesses cannot be identified.
              </p>

              <h2 className="text-base font-semibold text-foreground mt-4">5. Data deletion & account closure</h2>
              <p>
                If you choose to permanently delete your account, your associated business data
                is removed from our active systems within <span className="font-semibold">7 days</span>.
                Limited backups may be kept for a short technical retention period, after which
                they are securely destroyed on a rolling basis.
              </p>

              <h2 className="text-base font-semibold text-foreground mt-4">6. Access control & security practices</h2>
              <p>
                Access to production systems is strictly limited to authorised personnel and is
                logged and monitored. We follow least-privilege principles and apply security
                patches to our stack on a regular basis to reduce vulnerabilities.
              </p>

              <h2 className="text-base font-semibold text-foreground mt-4">7. Your responsibilities</h2>
              <p>
                You are responsible for keeping your login credentials secure and for managing
                access to your own devices and browser sessions. We recommend using strong,
                unique passwords and enabling additional security measures where available.
              </p>

              <h2 className="text-base font-semibold text-foreground mt-4">8. Contact & questions</h2>
              <p>
                If you have any questions about this Privacy Policy or how your data is handled,
                you can contact us at
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
