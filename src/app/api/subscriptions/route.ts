import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { subscriptions } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

async function ensureTableExists() {
  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clerk_user_id TEXT NOT NULL UNIQUE,
      tier TEXT NOT NULL DEFAULT 'free',
      status TEXT NOT NULL DEFAULT 'inactive',
      trial_activated_at TEXT,
      trial_expires_at TEXT,
      premium_started_at TEXT,
      premium_expires_at TEXT,
      agreed_to_terms_at TEXT,
      payment_id TEXT,
      plan_type TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`);
  } catch (e) {
    console.log('Table may already exist or error creating:', e);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureTableExists();

    const subscription = await db.select().from(subscriptions).where(eq(subscriptions.clerkUserId, userId)).get();
    
    if (!subscription) {
      return NextResponse.json({ 
        tier: 'free', 
        status: 'inactive',
        needsActivation: true 
      });
    }

    const now = new Date();
    let isExpired = false;
    let daysRemaining = 0;

    if (subscription.tier === 'trial' && subscription.trialExpiresAt) {
      const expiresAt = new Date(subscription.trialExpiresAt);
      isExpired = now > expiresAt;
      daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    } else if (subscription.tier === 'premium' && subscription.premiumExpiresAt) {
      const expiresAt = new Date(subscription.premiumExpiresAt);
      isExpired = now > expiresAt;
      daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    }

    return NextResponse.json({
      ...subscription,
      isExpired,
      daysRemaining,
      needsActivation: subscription.status === 'inactive'
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ 
      tier: 'free', 
      status: 'inactive',
      needsActivation: true,
      error: 'Failed to fetch subscription' 
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureTableExists();

    const body = await request.json();
    const { action, planType, paymentId } = body;

    const existingSubscription = await db.select().from(subscriptions).where(eq(subscriptions.clerkUserId, userId)).get();
    const now = new Date().toISOString();

    if (action === 'activate_trial') {
      const trialExpiresAt = new Date();
      trialExpiresAt.setDate(trialExpiresAt.getDate() + 7);

      if (existingSubscription) {
        await db.update(subscriptions)
          .set({
            tier: 'trial',
            status: 'active',
            trialActivatedAt: now,
            trialExpiresAt: trialExpiresAt.toISOString(),
            agreedToTermsAt: now,
            updatedAt: now,
          })
          .where(eq(subscriptions.clerkUserId, userId));
      } else {
        await db.insert(subscriptions).values({
          clerkUserId: userId,
          tier: 'trial',
          status: 'active',
          trialActivatedAt: now,
          trialExpiresAt: trialExpiresAt.toISOString(),
          agreedToTermsAt: now,
          createdAt: now,
          updatedAt: now,
        });
      }

      return NextResponse.json({ success: true, tier: 'trial', expiresAt: trialExpiresAt.toISOString() });
    }

    if (action === 'upgrade_premium') {
      const premiumExpiresAt = new Date();
      premiumExpiresAt.setDate(premiumExpiresAt.getDate() + 30);

      if (existingSubscription) {
        await db.update(subscriptions)
          .set({
            tier: 'premium',
            status: 'active',
            premiumStartedAt: now,
            premiumExpiresAt: premiumExpiresAt.toISOString(),
            planType: planType || 'basic',
            paymentId: paymentId || null,
            updatedAt: now,
          })
          .where(eq(subscriptions.clerkUserId, userId));
      } else {
        await db.insert(subscriptions).values({
          clerkUserId: userId,
          tier: 'premium',
          status: 'active',
          premiumStartedAt: now,
          premiumExpiresAt: premiumExpiresAt.toISOString(),
          planType: planType || 'basic',
          paymentId: paymentId || null,
          createdAt: now,
          updatedAt: now,
        });
      }

      return NextResponse.json({ success: true, tier: 'premium', expiresAt: premiumExpiresAt.toISOString() });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}