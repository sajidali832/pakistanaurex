"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { AurexLogo } from '@/components/AurexLogo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Loader2, ArrowRight, LogOut, Star, FileText, Users, BarChart3, Bot, Shield, Building2 } from 'lucide-react';

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 499,
    period: 'month',
    description: 'Perfect for small businesses',
    features: [
      'Unlimited Invoices',
      'Unlimited Quotations',
      'Tax Invoices (FBR Compliant)',
      'Client Management (up to 50)',
      'Basic Reports',
      'Email Support',
    ],
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 999,
    period: 'month',
    description: 'For growing businesses',
    features: [
      'Everything in Basic',
      'Unlimited Clients',
      'Advanced Reports & Analytics',
      'Bank Transaction Import',
      'AI Business Assistant',
      'Priority Support',
      'Custom Branding',
      'Multi-user Access',
    ],
    popular: true,
  },
];

export default function UpgradePage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro'>('pro');
  const [processing, setProcessing] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/login');
      return;
    }

    const fetchSubscription = async () => {
      try {
        const res = await fetch('/api/subscriptions');
        const data = await res.json();
        setSubscription(data);
      } catch (err) {
        console.error('Failed to fetch subscription');
      }
    };

    if (isLoaded && user) {
      fetchSubscription();
    }
  }, [isLoaded, user, router]);

  const handleUpgrade = async () => {
    setProcessing(true);
    
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'upgrade_premium',
          planType: selectedPlan,
        }),
      });

      const data = await res.json();

      if (data.success) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Upgrade failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-tr from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-full blur-3xl -z-10 opacity-60" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-gradient-to-bl from-pink-500/20 via-orange-500/20 to-yellow-500/20 rounded-full blur-3xl -z-10 opacity-40" />

      <div className="max-w-5xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <AurexLogo size="sm" variant="full" />
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Upgrade to Premium
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {subscription?.isExpired 
              ? "Your subscription has expired. Choose a plan to continue using all features."
              : "Unlock all features and take your business to the next level."}
          </p>
          {subscription?.daysRemaining > 0 && (
            <Badge variant="outline" className="mt-4">
              {subscription.daysRemaining} days remaining in your {subscription.tier === 'trial' ? 'trial' : 'subscription'}
            </Badge>
          )}
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`relative cursor-pointer transition-all duration-300 border-2 ${
                  selectedPlan === plan.id 
                    ? 'border-purple-500 shadow-lg shadow-purple-500/20' 
                    : 'border-white/20 hover:border-purple-300'
                } bg-white/30 dark:bg-black/30 backdrop-blur-xl`}
                onClick={() => setSelectedPlan(plan.id as 'basic' | 'pro')}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none">
                      <Star className="h-3 w-3 mr-1" /> Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pt-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">Rs. {plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <div className="p-1 rounded-full bg-green-100 dark:bg-green-900/20">
                          <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <div className={`w-full h-2 rounded-full ${
                      selectedPlan === plan.id 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                        : 'bg-muted'
                    }`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <Button
            size="lg"
            onClick={handleUpgrade}
            disabled={processing}
            className="h-14 px-12 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl shadow-purple-500/25 transition-all"
          >
            {processing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 mr-2" />
                Upgrade to {selectedPlan === 'pro' ? 'Pro' : 'Basic'} - Rs. {plans.find(p => p.id === selectedPlan)?.price}/mo
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            30-day subscription. Cancel anytime. Secure payment.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 grid grid-cols-3 gap-4 max-w-2xl mx-auto"
        >
          {[
            { icon: Shield, text: 'Secure Payment' },
            { icon: Zap, text: 'Instant Access' },
            { icon: Users, text: '24/7 Support' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2 text-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
                <item.icon className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-sm text-muted-foreground">{item.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
