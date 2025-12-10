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

export default function ContactPage() {
  const router = useRouter();

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
              <CardTitle>Get in touch with us.</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
              <p>
                For any questions about AUREX, pricing, security, or partnerships, you can reach
                our team directly.
              </p>

              <p>
                Email:
                <a
                  href="mailto:hello@aurex.sbs"
                  className="text-primary font-medium ml-1"
                >
                  hello@aurex.sbs
                </a>
              </p>

              <p>
                We aim to respond to all messages as quickly as possible. For urgent support
                relating to access or billing, please use the same email with a clear subject
                line so we can prioritise your request.
              </p>

              <div className="mt-4 space-y-3 border-t pt-4">
                <h2 className="text-base font-semibold text-foreground">Send us a message</h2>
                <p>
                  You can also draft your message here and send it using your email client.
                  When you click <span className="font-semibold">Send via Email</span>, we will
                  open your default mail app with the details filled in.
                </p>

                <ContactForm />
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </I18nProvider>
  );
}

function ContactForm() {
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");

  const handleSend = () => {
    const encodedSubject = encodeURIComponent(subject || "Message from AUREX contact page");
    const encodedBody = encodeURIComponent(message);
    const mailto = `mailto:hello@aurex.sbs?subject=${encodedSubject}&body=${encodedBody}`;
    window.location.href = mailto;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="contact-subject">Subject</Label>
        <Input
          id="contact-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Brief summary of your message"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Write your message in detail..."
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
