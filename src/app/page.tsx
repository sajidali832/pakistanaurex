"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import {
  FileText,
  Users,
  Package,
  BarChart3,
  Globe,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Loader2,
  PieChart,
  Wallet
} from 'lucide-react';
import { useEffect } from 'react';

const features = [
  {
    icon: FileText,
    title: 'Smart Invoicing',
    description: 'Create professional invoices in seconds. Customize templates, automate recurring billing, and get paid faster.',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },

  {
    icon: Users,
    title: 'Client CRM',
    description: 'Centralize your client data. Track interaction history, payment status, and communications in one secure place.',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
  {
    icon: BarChart3,
    title: 'Financial Analytics',
    description: 'Visual reports that give you a 360-degree view of your business performance, revenue, and growth trends.',
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  },
  {
    icon: Wallet,
    title: 'Expense Management',
    description: 'Track every penny. Categorize expenses, scan receipts, and monitor your cash flow with precision.',
    color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  },

];

const benefits = [
  'Automated tax calculations & compliance',
  'Professional templates that fit your brand',
  'Real-time financial insights & dashboard',
  'Secure cloud storage & daily backups',
  'Export data to PDF, Excel, and CSV',
  '24/7 priority customer support',
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20">
      {/* Navigation */}
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10 opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-500/5 rounded-full blur-3xl -z-10 opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-secondary/50 border border-border/50 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            New: Smart Automation Features
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-8 text-foreground animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Simplify Your Business
            <br />
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Finances & Operations
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            The all-in-one platform designed to help modern businesses grow.
            Manage invoices, expenses, and client relationships seamlessly from one dashboard.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 rounded-full text-base font-semibold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300 gap-2">
                Start Free Today
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 rounded-full text-base font-medium border-muted-foreground/20 hover:bg-secondary/80 transition-all duration-300">
                Log in to account
              </Button>
            </Link>
          </div>

          {/* Dashboard Preview / Trust Indicators */}
          <div className="relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-medium text-muted-foreground mb-12">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Bank-Grade Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <span>Setup in 2 Minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>No Credit Card Required</span>
              </div>
            </div>

            {/* Abstract UI Mockup */}
            <div className="relative mx-auto max-w-5xl rounded-xl border border-border/50 bg-background/50 backdrop-blur-xl shadow-2xl p-2 sm:p-4">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-blue-500/5 rounded-xl -z-10" />
              <div className="rounded-lg overflow-hidden border border-border/50 bg-card shadow-sm aspect-[16/9] flex items-center justify-center relative">
                {/* This would be an actual screenshot in production */}
                <div className="absolute inset-0 bg-gradient-to-br from-background to-muted flex flex-col p-8">
                  {/* Header Mockup */}
                  <div className="h-8 w-full flex items-center justify-between mb-8">
                    <div className="w-32 h-6 bg-muted-foreground/10 rounded-md" />
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-muted-foreground/10" />
                      <div className="w-8 h-8 rounded-full bg-muted-foreground/10" />
                    </div>
                  </div>
                  {/* Content Mockup */}
                  <div className="flex gap-6 flex-1">
                    <div className="w-48 h-full bg-muted-foreground/5 rounded-lg hidden md:block" />
                    <div className="flex-1 flex flex-col gap-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-24 rounded-lg bg-primary/5 border border-primary/10" />
                        <div className="h-24 rounded-lg bg-blue-500/5 border border-blue-500/10" />
                        <div className="h-24 rounded-lg bg-green-500/5 border border-green-500/10" />
                      </div>
                      <div className="flex-1 bg-muted-foreground/5 rounded-lg border border-border/50" />
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-background/0">
                  <span className="sr-only">Dashboard Preview</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
              Powering Growth for Modern Businesses
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to manage your business operations efficiently, securely, and professionally.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="relative h-full rounded-[1.25rem] border border-transparent p-1">
                <GlowingEffect
                  blur={0}
                  borderWidth={3}
                  spread={80}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                />
                <Card className="relative z-10 h-full bg-card border border-border/50 shadow-sm rounded-2xl group overflow-hidden">
                  <CardContent className="p-8">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${feature.color} ring-1 ring-inset ring-black/5 dark:ring-white/10 group-hover:scale-110 transition-transform duration-500`}>
                      <feature.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-primary font-semibold mb-4">
                <Sparkles className="h-5 w-5" />
                Why Choose Aurex?
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold mb-6 tracking-tight">
                Designed to make your life easier
              </h2>
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                Stop wrestling with spreadsheets and complicated software.
                Aurex gives you the tools you need to focus on what matters most—growing your business.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
                    </div>
                    <span className="text-base font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                <Link href="/register">
                  <Button size="lg" className="h-12 px-8 rounded-full text-base gap-2 shadow-lg shadow-primary/20">
                    Get Started Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative lg:h-[600px] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-full blur-3xl opacity-30 animate-pulse" />
              <div className="relative w-full max-w-lg">
                <div className="relative z-10 bg-card border border-border/50 rounded-2xl shadow-2xl p-8 space-y-6 rotate-3 hover:rotate-0 transition-transform duration-500">
                  {/* Mock Invoice Preview */}
                  <div className="flex items-center justify-between border-b border-border pb-6">
                    <div>
                      <div className="font-bold text-xl mb-1">Invoice #INV-2025-001</div>
                      <div className="text-sm text-muted-foreground">Tech Solutions Inc.</div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">$1,250.00</div>
                      <div className="text-xs font-bold bg-green-500/10 text-green-600 px-2 py-1 rounded-full inline-block mt-1">PAID</div>
                    </div>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Billed To</span>
                      <span className="font-medium">Acme Corp</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Date Issued</span>
                      <span className="font-medium">Dec 7, 2025</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Due Date</span>
                      <span className="font-medium">Dec 21, 2025</span>
                    </div>
                  </div>
                  <div className="pt-4">
                    <div className="flex justify-between text-sm font-medium mb-2">
                      <span>Total Amount</span>
                      <span>$1,250.00</span>
                    </div>
                    <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                      <div className="h-full w-full bg-primary rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Floating Element */}
                <div className="absolute -bottom-10 -left-10 z-20 bg-background border border-border/50 rounded-xl shadow-xl p-4 flex items-center gap-4 animate-bounce duration-[3000ms]">
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <PieChart className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Revenue Growth</div>
                    <div className="text-lg font-bold text-green-600">+127%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-primary rounded-3xl p-12 sm:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <h2 className="relative text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-primary-foreground tracking-tight">
              Ready to Upgrade Your Workflow?
            </h2>
            <p className="relative text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto">
              Join thousands of businesses who trust Aurex for their financial operations.
              Start your free trial today.
            </p>
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto h-14 px-10 rounded-full text-lg font-semibold gap-2 shadow-xl  hover:scale-105 transition-all">
                  <Sparkles className="h-5 w-5" />
                  Get Started Free
                </Button>
              </Link>
            </div>
            <p className="relative mt-6 text-sm text-primary-foreground/60">
              No credit card required. Cancel anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* Footer */}
      <PublicFooter />
    </div>
  );
}