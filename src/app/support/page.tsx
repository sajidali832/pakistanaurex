"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { I18nProvider } from "@/lib/i18n";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function SupportPage() {
  const router = useRouter();

  return (
    <I18nProvider>
      <AppLayout>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Support</h1>
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
          </div>

          <Card className="border border-muted/60 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Need help with AUREX?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
              <p>
                If you have questions, issues with your account, or need help with invoices and
                quotations, you can always reach our support team.
              </p>

              <p>
                The fastest way to get a response is to email us at
                <a href="mailto:hello@aurex.sbs" className="text-primary font-medium ml-1">
                  hello@aurex.sbs
                </a>
                . Please include as much detail as possible so we can help you quickly.
              </p>

              <div className="mt-4 space-y-3 border-t pt-4">
                <h2 className="text-base font-semibold text-foreground">Send us a message</h2>
                <p>
                  You can also draft your message here and send it using your email client.
                  When you click <span className="font-semibold">Send via Email</span>, we will
                  open your default mail app with the details filled in.
                </p>

                <SupportForm />
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </I18nProvider>
  );
}

function SupportForm() {
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");

  const handleSend = () => {
    const encodedSubject = encodeURIComponent(subject || "Support request from AUREX");
    const encodedBody = encodeURIComponent(message);
    const mailto = `mailto:hello@aurex.sbs?subject=${encodedSubject}&body=${encodedBody}`;
    window.location.href = mailto;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Brief summary of your issue"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Describe the problem or question in detail..."
        />
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSend} disabled={!subject && !message}>
          Send via Email
        </Button>
      </div>
    </div>
  );
}
