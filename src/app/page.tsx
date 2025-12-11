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
    color: 'from-blue-500 via-cyan-500 to-teal-500',
    iconColor: 'text-white',
  },
  {
    icon: Users,
    title: 'Client CRM',
    description: 'Centralize your client data. Track interaction history, payment status, and communications in one secure place.',
    color: 'from-purple-500 via-pink-500 to-rose-500',
    iconColor: 'text-white',
  },
  {
    icon: BarChart3,
    title: 'Financial Analytics',
    description: 'Visual reports that give you a 360-degree view of your business performance, revenue, and growth trends.',
    color: 'from-orange-500 via-amber-500 to-yellow-500',
    iconColor: 'text-white',
  },
  {
    icon: Wallet,
    title: 'Expense Management',
    description: 'Track every penny. Categorize expenses, scan receipts, and monitor your cash flow with precision.',
    color: 'from-pink-500 via-fuchsia-500 to-violet-500',
    iconColor: 'text-white',
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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-sky-50 to-pink-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20 text-foreground overflow-x-hidden selection:bg-primary/20">
      {/* Navigation */}
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Colorful Background Elements */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-purple-400/30 to-pink-500/30 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl -z-10 animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-orange-400/20 to-amber-500/20 rounded-full blur-3xl -z-10 animate-pulse delay-2000" />

        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 border-2 border-emerald-400/50 backdrop-blur-sm rounded-full px-5 py-2 text-sm font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-lg shadow-emerald-500/20">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
            <span className="bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">Trusted by 5,000+ Pakistani Businesses</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 dark:from-violet-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">Simplify Your Business</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Finances & Operations
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 font-medium">
            The all-in-one platform designed to help modern businesses grow.
            Manage invoices, expenses, and client relationships seamlessly from one dashboard.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-14 px-10 rounded-full text-base font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 text-white shadow-2xl shadow-purple-500/50 hover:shadow-purple-600/60 hover:scale-105 active:scale-95 transition-all duration-300 gap-2 border-0">
                Start Free Today
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-10 rounded-full text-base font-bold border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all duration-300 shadow-lg hover:shadow-xl">
                Log in to account
              </Button>
            </Link>
          </div>

          {/* Dashboard Preview / Trust Indicators */}
          <div className="relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-bold mb-12">
              <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 rounded-full shadow-lg shadow-emerald-500/30">
                <Shield className="h-5 w-5" />
                <span>Bank-Grade Security</span>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 rounded-full shadow-lg shadow-amber-500/30">
                <Zap className="h-5 w-5" />
                <span>Setup in 2 Minutes</span>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-5 py-2.5 rounded-full shadow-lg shadow-blue-500/30">
                <CheckCircle2 className="h-5 w-5" />
                <span>No Credit Card Required</span>
              </div>
            </div>

            {/* Abstract UI Mockup */}
            <div className="relative mx-auto max-w-5xl rounded-2xl border-4 border-white dark:border-gray-800 bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-900/80 dark:to-gray-800/80 backdrop-blur-xl shadow-2xl p-2 sm:p-4">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-pink-500/10 to-orange-500/10 rounded-2xl -z-10" />
              <div className="rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm aspect-[16/9] flex items-center justify-center relative">
                {/* This would be an actual screenshot in production */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950 flex flex-col p-8">
                  {/* Header Mockup */}
                  <div className="h-8 w-full flex items-center justify-between mb-8">
                    <div className="w-32 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-md shadow-sm" />
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg" />
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 shadow-lg" />
                    </div>
                  </div>
                  {/* Content Mockup */}
                  <div className="flex gap-6 flex-1">
                    <div className="w-48 h-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 rounded-xl hidden md:block shadow-inner" />
                    <div className="flex-1 flex flex-col gap-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-24 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 border-2 border-violet-300 shadow-lg" />
                        <div className="h-24 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-cyan-300 shadow-lg" />
                        <div className="h-24 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 border-2 border-emerald-300 shadow-lg" />
                      </div>
                      <div className="flex-1 bg-gradient-to-br from-pink-100 to-orange-100 dark:from-pink-950/50 dark:to-orange-950/50 rounded-xl border-2 border-pink-200 dark:border-pink-800 shadow-inner" />
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
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-100/50 via-purple-100/50 to-pink-100/50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Powering Growth for Modern Businesses
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">
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
                <Card className="relative z-10 h-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-2 border-white dark:border-gray-700 shadow-2xl rounded-2xl group overflow-hidden">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                      <feature.icon className={`h-8 w-8 ${feature.iconColor} drop-shadow-lg`} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors text-base">
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
      <section className="py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-orange-50 via-rose-50 to-purple-50 dark:from-orange-950/20 dark:via-rose-950/20 dark:to-purple-950/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full font-bold mb-6 shadow-lg shadow-amber-500/30">
                <Sparkles className="h-5 w-5" />
                Why Choose Aurex?
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold mb-6 tracking-tight bg-gradient-to-r from-orange-600 via-rose-600 to-purple-600 dark:from-orange-400 dark:via-rose-400 dark:to-purple-400 bg-clip-text text-transparent">
                Designed to make your life easier
              </h2>
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-10 leading-relaxed font-medium">
                Stop wrestling with spreadsheets and complicated software.
                Aurex gives you the tools you need to focus on what matters most—growing your business.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => {
                  const colors = [
                    'from-blue-500 to-cyan-500',
                    'from-purple-500 to-pink-500',
                    'from-orange-500 to-amber-500',
                    'from-green-500 to-emerald-500',
                    'from-rose-500 to-red-500',
                    'from-indigo-500 to-violet-500',
                  ];
                  return (
                    <div 
                      key={index} 
                      className="group relative flex items-center gap-4 p-5 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-transparent transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-2xl"
                    >
                      <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${colors[index]} flex items-center justify-center flex-shrink-0 shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300`}>
                        <CheckCircle2 className="h-7 w-7 text-white drop-shadow-lg" />
                      </div>
                      <span className="text-base font-bold text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{benefit}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-12">
                <Link href="/register">
                  <Button size="lg" className="h-14 px-10 rounded-full text-base font-bold gap-2 bg-gradient-to-r from-orange-600 via-rose-600 to-purple-600 hover:from-orange-700 hover:via-rose-700 hover:to-purple-700 text-white shadow-2xl shadow-rose-500/50 hover:shadow-rose-600/60 hover:scale-105 transition-all border-0">
                    Get Started Now
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative lg:h-[600px] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 via-pink-500/30 to-orange-500/30 rounded-full blur-3xl opacity-50 animate-pulse" />
              <div className="relative w-full max-w-lg">
                <div className="relative z-10 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/50 dark:via-pink-950/50 dark:to-orange-950/50 border-2 border-purple-200/50 dark:border-purple-500/30 rounded-3xl shadow-2xl p-8 space-y-6 rotate-3 hover:rotate-0 transition-all duration-500 hover:shadow-purple-500/20 hover:shadow-3xl">
                  {/* Mock Invoice Preview */}
                  <div className="flex items-center justify-between border-b-2 border-purple-200/50 dark:border-purple-500/30 pb-6">
                    <div>
                      <div className="font-bold text-xl mb-1 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Invoice #INV-2025-001</div>
                      <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Tech Solutions Inc.</div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">$1,250.00</div>
                      <div className="text-xs font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1.5 rounded-full inline-block mt-1 shadow-lg shadow-green-500/30">PAID ✓</div>
                    </div>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200/50 dark:border-blue-500/20">
                      <span className="text-blue-700 dark:text-blue-300 font-semibold">Billed To</span>
                      <span className="font-bold text-blue-900 dark:text-blue-100">Acme Corp</span>
                    </div>
                    <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border border-violet-200/50 dark:border-violet-500/20">
                      <span className="text-violet-700 dark:text-violet-300 font-semibold">Date Issued</span>
                      <span className="font-bold text-violet-900 dark:text-violet-100">Dec 7, 2025</span>
                    </div>
                    <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border border-rose-200/50 dark:border-rose-500/20">
                      <span className="text-rose-700 dark:text-rose-300 font-semibold">Due Date</span>
                      <span className="font-bold text-rose-900 dark:text-rose-100">Dec 21, 2025</span>
                    </div>
                  </div>
                  <div className="pt-4 px-4 py-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-200/50 dark:border-amber-500/30">
                    <div className="flex justify-between text-sm font-bold mb-3">
                      <span className="text-amber-900 dark:text-amber-100">Total Amount</span>
                      <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent text-lg">$1,250.00</span>
                    </div>
                    <div className="h-3 w-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full w-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 rounded-full shadow-lg animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Floating Element */}
                <div className="absolute -bottom-10 -left-10 z-20 bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-white/50 dark:border-emerald-300/30 rounded-2xl shadow-2xl shadow-emerald-500/40 p-5 flex items-center gap-4 animate-bounce duration-[3000ms]">
                  <div className="h-12 w-12 rounded-xl bg-white/30 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/50">
                    <PieChart className="h-7 w-7 text-white drop-shadow-lg" />
                  </div>
                  <div>
                    <div className="text-xs text-white/90 font-semibold">Revenue Growth</div>
                    <div className="text-2xl font-bold text-white drop-shadow-lg">+127%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-violet-100 via-fuchsia-100 to-pink-100 dark:from-violet-950/40 dark:via-fuchsia-950/40 dark:to-pink-950/40">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-3xl p-12 sm:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-yellow-400/10 via-orange-400/10 to-transparent rounded-full blur-2xl" />

            <h2 className="relative text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight drop-shadow-lg">
              Ready to Upgrade Your Workflow?
            </h2>
            <p className="relative text-xl text-white/95 mb-10 max-w-2xl mx-auto font-medium drop-shadow">
              Join thousands of businesses who trust Aurex for their financial operations.
              Start your free trial today.
            </p>
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto h-16 px-12 rounded-full text-lg font-bold gap-3 shadow-2xl bg-white text-purple-600 hover:bg-gray-50 hover:scale-105 transition-all border-0">
                  <Sparkles className="h-6 w-6" />
                  Get Started Free
                </Button>
              </Link>
            </div>
            <p className="relative mt-6 text-sm text-white/80 font-medium">
              No credit card required. Cancel anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}