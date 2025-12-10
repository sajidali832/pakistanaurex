"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { I18nProvider } from "@/lib/i18n";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

export default function ContactPage() {
  const router = useRouter();
  const [copied, setCopied] = React.useState(false);
  const email = "hello@aurex.sbs";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <I18nProvider>
      <AppLayout>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Contact</h1>
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
          </div>

          <Card className="border border-muted/60 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Get in touch with us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
              <p>
                For any questions about AUREX, pricing, security, or partnerships, you can reach
                our team directly.
              </p>

              <p>
                If you want to report a problem, suggest a feature, or need any help, email us at:
              </p>

              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <span className="text-lg font-medium text-foreground">{email}</span>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              <p>
                We aim to respond to all messages as quickly as possible.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </I18nProvider>
  );
}
