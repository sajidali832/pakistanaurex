"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { AurexLogo } from '@/components/AurexLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  Users, 
  Package, 
  BarChart3, 
  Building2, 
  Globe,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Loader2
} from 'lucide-react';
import { useEffect } from 'react';

const features = [
  {
    icon: FileText,
    title: 'Professional Invoices',
    titleUrdu: 'پیشہ ور انوائسز',
    description: 'Create beautiful invoices with multiple templates, automatic tax calculations, and PDF export.',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    icon: Package,
    title: 'Quotations',
    titleUrdu: 'کوٹیشنز',
    description: 'Send professional quotations and convert them to invoices with one click.',
    color: 'bg-green-500/10 text-green-600 dark:text-green-400',
  },
  {
    icon: Users,
    title: 'Client Management',
    titleUrdu: 'کلائنٹ مینجمنٹ',
    description: 'Manage all your clients in one place with complete contact and billing information.',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
  {
    icon: BarChart3,
    title: 'Reports & Analytics',
    titleUrdu: 'رپورٹس',
    description: 'Get insights into your business with detailed sales, tax, and client reports.',
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  },
  {
    icon: Building2,
    title: 'Bank Export',
    titleUrdu: 'بینک ایکسپورٹ',
    description: 'Export bank-ready files for JazzCash, EasyPaisa, and standard bank formats.',
    color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  },
  {
    icon: Globe,
    title: 'Urdu & English',
    titleUrdu: 'اردو اور انگریزی',
    description: 'Full bilingual support with RTL layout for Urdu language users.',
    color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  },
];

const benefits = [
  'NTN & STRN compliant invoices for Pakistan',
  'Multiple invoice templates to choose from',
  'Automatic tax calculations (GST)',
  'Track payments and outstanding balances',
  'Export to PDF, Excel, and CSV',
  'Complete RTL support for Urdu',
];

export default function LandingPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && session?.user) {
      router.push('/dashboard');
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <AurexLogo size="md" variant="full" />
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Try Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Made for Pakistani Businesses
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Smart Business Management
              <span className="block text-primary mt-2">for Pakistan</span>
            </h1>
            
            {/* Urdu Tagline */}
            <p className="text-xl sm:text-2xl text-muted-foreground mb-4 font-urdu" dir="rtl">
              پاکستان کے لیے سمارٹ بزنس مینجمنٹ
            </p>
            
            {/* Description */}
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Create professional invoices, manage clients, track payments, and generate bank-ready exports. 
              Complete bilingual support in English and Urdu.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/register">
                <Button size="lg" className="gap-2 text-lg px-8 py-6 h-auto">
                  <Sparkles className="h-5 w-5" />
                  Start Free Today
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6 h-auto">
                  Login to Your Account
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>Fast & Reliable</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                <span>FBR Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to Run Your Business
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed specifically for Pakistani small and medium businesses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2 font-urdu" dir="rtl">
                    {feature.titleUrdu}
                  </p>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Built for Pakistani Businesses
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                AUREX understands the unique needs of businesses in Pakistan. From NTN compliance to bank exports, 
                we've got you covered.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <Link href="/register">
                  <Button size="lg" className="gap-2">
                    Get Started Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-3xl p-8">
                <div className="bg-card rounded-2xl shadow-2xl p-6 space-y-4">
                  {/* Mock Invoice Preview */}
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <div className="font-bold text-lg">Invoice #INV-2025-001</div>
                      <div className="text-sm text-muted-foreground">Your Company Name</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">PKR 125,000</div>
                      <div className="text-xs text-green-600 font-medium">PAID</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Client:</span>
                      <span>ABC Enterprises</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span>Dec 7, 2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (17% GST):</span>
                      <span>PKR 18,162</span>
                    </div>
                  </div>
                  <div className="pt-4 flex gap-2">
                    <div className="h-2 flex-1 bg-primary/20 rounded-full" />
                    <div className="h-2 w-16 bg-primary rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Streamline Your Business?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Join thousands of Pakistani businesses already using AUREX for their invoicing needs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="gap-2 text-lg px-8">
                <Sparkles className="h-5 w-5" />
                Sign Up Free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8 bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <AurexLogo size="sm" variant="full" />
          <p className="text-sm text-muted-foreground">
            © 2025 AUREX. Smart Business Management for Pakistan.
          </p>
        </div>
      </footer>
    </div>
  );
}