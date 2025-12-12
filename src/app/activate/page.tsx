"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { AurexLogo } from '@/components/AurexLogo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Sparkles, Check, Loader2, Shield, Zap, FileText, Users, BarChart3, Bot, ArrowRight, Crown } from 'lucide-react';

const features = [
  { icon: FileText, title: 'Unlimited Invoices', desc: 'Create unlimited professional invoices' },
  { icon: FileText, title: 'Quotation Creation', desc: 'Generate quotations for your clients' },
  { icon: Shield, title: 'Tax Invoices', desc: 'FBR-compliant tax invoice generation' },
  { icon: Users, title: 'Client Management', desc: 'Manage unlimited clients' },
  { icon: BarChart3, title: 'Bank Reports', desc: 'Financial reports and analytics' },
  { icon: Bot, title: 'AI Assistant', desc: 'Smart business insights' },
];

export default function ActivatePage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [step, setStep] = useState<'loading' | 'terms' | 'activating' | 'success'>('loading');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/login');
      return;
    }

    const checkSubscription = async () => {
      try {
        const res = await fetch('/api/subscriptions');
        const data = await res.json();
        
        if (data.status === 'active' && !data.isExpired) {
          router.push('/dashboard');
          return;
        }
        
        setStep('terms');
      } catch {
        setStep('terms');
      }
    };

    if (isLoaded && user) {
      checkSubscription();
    }
  }, [isLoaded, user, router]);

  const handleActivate = async () => {
    if (!agreedToTerms) return;
    
    setStep('activating');
    setActivating(true);

    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate_trial' }),
      });

      const data = await res.json();

      if (data.success) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setStep('success');
        await new Promise(resolve => setTimeout(resolve, 2000));
        router.push('/dashboard');
      }
    } catch (err) {
      setStep('terms');
    } finally {
      setActivating(false);
    }
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-tr from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-full blur-3xl -z-10 opacity-60" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (step === 'activating') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-tr from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-full blur-3xl -z-10 opacity-60 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-gradient-to-bl from-pink-500/20 via-orange-500/20 to-yellow-500/20 rounded-full blur-3xl -z-10 opacity-40" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="relative"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-purple-500/30"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            Activating Your Account
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground"
          >
            Setting up your 7-day free tier...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-tr from-green-500/20 via-emerald-500/20 to-cyan-500/20 rounded-full blur-3xl -z-10 opacity-60" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center"
          >
            <Check className="h-12 w-12 text-white" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-center bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent"
          >
            Account Activated!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground"
          >
            Redirecting to your dashboard...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-tr from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-full blur-3xl -z-10 opacity-60" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-gradient-to-bl from-pink-500/20 via-orange-500/20 to-yellow-500/20 rounded-full blur-3xl -z-10 opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl space-y-6"
      >
        <div className="flex flex-col items-center space-y-2">
          <AurexLogo size="md" variant="full" />
        </div>

        <Card className="border border-white/20 bg-white/30 dark:bg-black/30 backdrop-blur-2xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent pointer-events-none" />
          <CardContent className="p-8 relative z-10">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mb-4"
              >
                <Crown className="h-10 w-10 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Activate Your 7-Day Free Tier
              </h1>
              <p className="text-muted-foreground">
                Get full access to all features for 7 days, completely free!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-black/20"
                >
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600/10 to-purple-600/10">
                    <feature.icon className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="space-y-4 mb-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">Terms & Conditions</h3>
              <div className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
                <p>• Your 7-day free trial begins immediately upon activation.</p>
                <p>• After the trial period ends, you will need to subscribe to continue using the service.</p>
                <p>• All features will be locked after the trial expires until you upgrade.</p>
                <p>• Premium subscription is required after 7 days for continued access.</p>
                <p>• Premium plans start from Rs. 499/month for full access.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 mb-6">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                I agree to the terms and conditions. I understand that after 7 days, payment will be required to continue using the service.
              </Label>
            </div>

            <Button
              onClick={handleActivate}
              disabled={!agreedToTerms || activating}
              className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-purple-500/25 transition-all"
            >
              {activating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Activating...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Activate Your 7-Day Free Tier
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
