"use client";

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

interface Subscription {
  id?: number;
  clerkUserId?: string;
  tier: 'free' | 'trial' | 'premium';
  status: 'inactive' | 'active' | 'expired' | 'cancelled';
  trialActivatedAt?: string;
  trialExpiresAt?: string;
  premiumStartedAt?: string;
  premiumExpiresAt?: string;
  agreedToTermsAt?: string;
  planType?: 'basic' | 'pro';
  isExpired: boolean;
  daysRemaining: number;
  needsActivation: boolean;
}

export function useSubscription() {
  const { user, isLoaded } = useUser();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!isLoaded || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/subscriptions');
      const data = await res.json();
      setSubscription(data);
    } catch (err) {
      setError('Failed to fetch subscription');
    } finally {
      setLoading(false);
    }
  }, [isLoaded, user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const activateTrial = async () => {
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate_trial' }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchSubscription();
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: 'Failed to activate trial' };
    }
  };

  const upgradeToPremium = async (planType: 'basic' | 'pro', paymentId?: string) => {
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upgrade_premium', planType, paymentId }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchSubscription();
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: 'Failed to upgrade' };
    }
  };

  const canAccess = () => {
    if (!subscription) return false;
    if (subscription.needsActivation) return false;
    if (subscription.isExpired) return false;
    return subscription.status === 'active';
  };

  const getTierLabel = () => {
    if (!subscription) return 'Free';
    if (subscription.tier === 'premium') return 'Premium';
    if (subscription.tier === 'trial') return 'Free Tier';
    return 'Free';
  };

  return {
    subscription,
    loading,
    error,
    activateTrial,
    upgradeToPremium,
    canAccess,
    getTierLabel,
    refetch: fetchSubscription,
  };
}
