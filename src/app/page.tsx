"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  FileText,
  Users,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Wallet,
  TrendingUp,
  CreditCard,
  Star
} from 'lucide-react';
import { useEffect } from 'react';

const features = [
  {
    icon: FileText,
    title: 'Smart Invoicing',
    description: 'Create professional invoices in seconds. Customize templates, automate recurring billing, and get paid faster.',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    border: 'group-hover:border-blue-500/50'
  },
  {
    icon: Users,
    title: 'Client CRM',
    description: 'Centralize your client data. Track interaction history, payment status, and communications in one secure place.',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    gradient: 'from-purple-500/20 to-pink-500/20',
    border: 'group-hover:border-purple-500/50'
  },
  {
    icon: BarChart3,
    title: 'Financial Analytics',
    description: 'Visual reports that give you a 360-degree view of your business performance, revenue, and growth trends.',
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    gradient: 'from-orange-500/20 to-red-500/20',
    border: 'group-hover:border-orange-500/50'
  },
  {
    icon: Wallet,
    title: 'Expense Management',
    description: 'Track every penny. Categorize expenses, scan receipts, and monitor your cash flow with precision.',
    color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
    gradient: 'from-pink-500/20 to-rose-500/20',
    border: 'group-hover:border-pink-500/50'
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Aurex",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "PKR"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "150"
            },
            "description": "Free invoice software for Pakistani businesses. Create professional invoices, quotations, and tax invoices with FBR compliance.",
            "featureList": [
              "Professional Invoice Generation",
              "Quotation Management",
              "FBR Tax Invoice Support",
              "Client Management",
              "Financial Reports",
              "Multi-language (English/Urdu)"
            ]
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Aurex",
            "url": "https://aurex.sbs",
            "logo": "https://aurex.sbs/icons/icon-512x512.svg",
            "description": "Free invoicing and business management software for Pakistani SMBs",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "PK"
            },
            "sameAs": []
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Is Aurex free to use?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, Aurex is completely free to use for creating invoices, quotations, and managing your business."
                }
              },
              {
                "@type": "Question",
                "name": "Is Aurex compliant with FBR tax requirements?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, Aurex supports FBR-compliant tax invoices with proper NTN and STRN number handling, GST calculations, and all required fields."
                }
              },
              {
                "@type": "Question",
                "name": "Can I use Aurex in Urdu?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, Aurex supports both English and Urdu languages, allowing you to create invoices and manage your business in your preferred language."
                }
              }
            ]
          })
        }}
      />

      {/* Navigation */}
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Abstract Background Elements - More Colorful */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-tr from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-full blur-3xl -z-10 opacity-60 pointer-events-none animate-pulse duration-[5000ms]" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-gradient-to-bl from-pink-500/20 via-orange-500/20 to-yellow-500/20 rounded-full blur-3xl -z-10 opacity-40 pointer-events-none" />
        <div className="absolute top-40 left-10 w-32 h-32 bg-yellow-400/30 rounded-full blur-2xl -z-10 animate-bounce duration-[3000ms]" />
        
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-black/50 border border-purple-500/30 backdrop-blur-md rounded-full px-4 py-1.5 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-lg shadow-purple-500/10">
            <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-bold">New: Smart Automation V2.0</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 text-foreground animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 drop-shadow-sm">
            Simplify Your Business
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent pb-2">
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
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 rounded-full text-base font-bold shadow-xl shadow-blue-500/25 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 active:scale-95 transition-all duration-300 gap-2 border-none">
                Start Free Today
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-full text-base font-medium border-2 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-700 dark:text-purple-300 transition-all duration-300">
                Log in to account
              </Button>
            </Link>
          </div>

          {/* Dashboard Preview / Trust Indicators */}
          <div className="relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-medium text-muted-foreground mb-12">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/5 border border-blue-500/10">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>Bank-Grade Security</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/5 border border-purple-500/10">
                <Zap className="h-5 w-5 text-purple-600" />
                <span>Setup in 2 Minutes</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/5 border border-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>No Credit Card Required</span>
              </div>
            </div>

            {/* Abstract UI Mockup */}
            <div className="relative mx-auto max-w-5xl rounded-2xl border border-white/20 bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-2xl p-2 sm:p-4 ring-1 ring-black/5">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl -z-10" />
              <div className="rounded-xl overflow-hidden border border-border/50 bg-card shadow-sm aspect-[16/9] flex items-center justify-center relative group">
                {/* Gradient Overlay for Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
                
                {/* This would be an actual screenshot in production */}
                <div className="absolute inset-0 bg-gradient-to-br from-background to-muted flex flex-col p-4 sm:p-8 transition-transform duration-700 group-hover:scale-[1.01]">
                  {/* Header Mockup */}
                  <div className="h-10 w-full flex items-center justify-between mb-8 border-b border-border/50 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg" />
                      <div className="w-32 h-4 bg-muted-foreground/20 rounded-md" />
                    </div>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800" />
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800" />
                    </div>
                  </div>
                  {/* Content Mockup */}
                  <div className="flex gap-6 flex-1">
                    <div className="w-48 h-full bg-muted-foreground/5 rounded-xl border border-border/50 hidden md:block" />
                    <div className="flex-1 flex flex-col gap-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-32 rounded-xl bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-blue-100 dark:to-blue-900/10 border border-blue-200 dark:border-blue-800/50 p-4 flex flex-col justify-between">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20" />
                            <div className="w-20 h-3 bg-blue-500/30 rounded" />
                        </div>
                        <div className="h-32 rounded-xl bg-gradient-to-br from-purple-50 dark:from-purple-900/20 to-purple-100 dark:to-purple-900/10 border border-purple-200 dark:border-purple-800/50 p-4 flex flex-col justify-between">
                             <div className="w-8 h-8 rounded-lg bg-purple-500/20" />
                            <div className="w-20 h-3 bg-purple-500/30 rounded" />
                        </div>
                        <div className="h-32 rounded-xl bg-gradient-to-br from-green-50 dark:from-green-900/20 to-green-100 dark:to-green-900/10 border border-green-200 dark:border-green-800/50 p-4 flex flex-col justify-between">
                             <div className="w-8 h-8 rounded-lg bg-green-500/20" />
                            <div className="w-20 h-3 bg-green-500/30 rounded" />
                        </div>
                      </div>
                      <div className="flex-1 bg-white dark:bg-card rounded-xl border border-border/50 shadow-sm p-4 space-y-3">
                         <div className="w-full h-8 bg-muted/50 rounded" />
                         <div className="w-full h-8 bg-muted/50 rounded" />
                         <div className="w-full h-8 bg-muted/50 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - More Colorful */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent dark:from-blue-900/20 dark:via-transparent dark:to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
              Powering Growth for <span className="text-blue-600 dark:text-blue-400">Modern Businesses</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to manage your business operations efficiently, securely, and professionally.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="relative h-full rounded-[1.25rem] group">
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-[1.25rem] blur opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <Card className={`relative z-10 h-full bg-card border border-border/50 shadow-sm rounded-2xl overflow-hidden transition-all duration-300 ${feature.border}`}>
                  <CardContent className="p-8">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.color} ring-1 ring-inset ring-black/5 dark:ring-white/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
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
      <section className="py-24 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-primary font-bold mb-4 px-3 py-1 bg-primary/10 rounded-full text-sm">
                <Sparkles className="h-4 w-4" />
                Why Choose Aurex?
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold mb-6 tracking-tight leading-tight">
                Designed to make your life <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">Easier</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                Stop wrestling with spreadsheets and complicated software.
                Aurex gives you the tools you need to focus on what matters most—growing your business.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 group">
                    <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/20 transition-colors">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
                    </div>
                    <span className="text-base font-medium group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                <Link href="/register">
                  <Button size="lg" className="h-12 px-8 rounded-full text-base gap-2 shadow-lg shadow-green-500/20 bg-green-600 hover:bg-green-700">
                    Get Started Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative lg:h-[600px] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-green-500/20 to-blue-500/20 rounded-full blur-3xl opacity-30 animate-pulse" />
              <div className="relative w-full max-w-lg">
                <div className="relative z-10 bg-card border border-border/50 rounded-2xl shadow-2xl p-8 space-y-6 rotate-3 hover:rotate-0 transition-transform duration-500 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 rounded-2xl pointer-events-none" />
                  
                  {/* Mock Invoice Preview */}
                  <div className="flex items-center justify-between border-b border-border pb-6 relative">
                    <div>
                      <div className="font-bold text-xl mb-1 text-foreground">Invoice #INV-2025-001</div>
                      <div className="text-sm text-muted-foreground">Tech Solutions Inc.</div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">$1,250.00</div>
                      <div className="text-xs font-bold bg-green-500/10 text-green-600 px-3 py-1 rounded-full inline-block mt-1 border border-green-200 dark:border-green-800">PAID</div>
                    </div>
                  </div>
                  <div className="space-y-4 text-sm relative">
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
                  <div className="pt-4 relative">
                    <div className="flex justify-between text-sm font-medium mb-2">
                      <span>Total Amount</span>
                      <span>$1,250.00</span>
                    </div>
                    <div className="h-3 w-full bg-green-100 dark:bg-green-900/30 rounded-full overflow-hidden">
                      <div className="h-full w-full bg-green-500 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Floating Element */}
                <div className="absolute -bottom-10 -left-10 z-20 bg-background border border-border/50 rounded-xl shadow-xl p-4 flex items-center gap-4 animate-bounce duration-[3000ms]">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Revenue Growth</div>
                    <div className="text-lg font-bold text-blue-600">+127%</div>
                  </div>
                </div>
                
                 {/* Floating Element 2 */}
                <div className="absolute -top-5 -right-5 z-20 bg-background border border-border/50 rounded-xl shadow-xl p-4 flex items-center gap-4 animate-bounce duration-[4000ms] delay-700">
                  <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Expenses Saved</div>
                    <div className="text-lg font-bold text-purple-600">$450.00</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Gradient Background */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-[2.5rem] p-12 sm:p-20 text-center relative overflow-hidden shadow-2xl">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

            <h2 className="relative text-3xl sm:text-5xl font-bold mb-6 text-white tracking-tight">
              Ready to Upgrade Your Workflow?
            </h2>
            <p className="relative text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join thousands of businesses who trust Aurex for their financial operations.
              Start your free trial today.
            </p>
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-16 px-10 rounded-full text-lg font-bold gap-2 shadow-xl bg-white text-purple-600 hover:bg-white/90 hover:scale-105 transition-all">
                  <Sparkles className="h-5 w-5" />
                  Get Started Free
                </Button>
              </Link>
            </div>
            <p className="relative mt-6 text-sm text-white/70 font-medium">
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