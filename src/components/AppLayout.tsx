"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n, Language } from '@/lib/i18n';
import { useUser, useClerk } from '@clerk/nextjs';
import { AurexLogo } from './AurexLogo';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  LayoutDashboard,
  FileText,
  FileSpreadsheet,
  Users,
  Receipt,
  BarChart3,
  Settings,
  Building2,
  Menu,
  LogOut,
  Globe,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  Crown,
  Sparkles,
  Lock,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AppLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'invoices', href: '/invoices', icon: FileText },
  { key: 'quotations', href: '/quotations', icon: FileSpreadsheet },
  { key: 'taxInvoices', href: '/tax-invoices', icon: Receipt },
  { key: 'clients', href: '/clients', icon: Users },
  { key: 'reports', href: '/reports', icon: BarChart3 },
  { key: 'bankExport', href: '/bank-export', icon: Building2 },
  { key: 'settings', href: '/settings', icon: Settings },
];

interface Subscription {
  tier: 'free' | 'trial' | 'premium';
  status: 'inactive' | 'active' | 'expired' | 'cancelled';
  isExpired: boolean;
  daysRemaining: number;
  needsActivation: boolean;
  planType?: string;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { t, language, setLanguage, isRTL } = useI18n();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/login');
    }
  }, [user, isLoaded, router]);

  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebar_collapsed');
    if (savedCollapsed === 'true') {
      setSidebarCollapsed(true);
    }
  }, []);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) return;
      try {
        const res = await fetch('/api/subscriptions');
        const data = await res.json();
        setSubscription(data);

        if (data.needsActivation && pathname !== '/activate') {
          router.push('/activate');
        } else if (data.isExpired && pathname !== '/upgrade') {
          router.push('/upgrade');
        }
      } catch (err) {
        console.error('Failed to fetch subscription');
      } finally {
        setSubscriptionLoading(false);
      }
    };

    if (isLoaded && user) {
      fetchSubscription();
    }
  }, [isLoaded, user, pathname, router]);

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebar_collapsed', newState.toString());
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ur' : 'en');
  };

  const getTierLabel = () => {
    if (!subscription) return 'Free';
    if (subscription.tier === 'premium') return 'Premium';
    if (subscription.tier === 'trial') return 'Free Tier';
    return 'Free';
  };

  const getTierColor = () => {
    if (!subscription) return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    if (subscription.tier === 'premium') return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white';
    if (subscription.tier === 'trial') return 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  };

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userName = user.fullName || user.firstName || 'User';
  const userEmail = user.primaryEmailAddress?.emailAddress || '';
  const userInitial = userName.charAt(0).toUpperCase();
  const userImage = user.imageUrl;

  const isLocked = subscription?.isExpired || subscription?.needsActivation;

  const NavLink = ({ item, collapsed }: { item: typeof navItems[0]; collapsed?: boolean }) => {
    const Icon = item.icon;
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

    const linkContent = (
      <Link
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center ${collapsed ? 'justify-center p-2' : 'gap-2 px-3 py-2'} rounded-md transition-colors text-sm ${isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        {!collapsed && <span className="truncate">{t(item.key)}</span>}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side={isRTL ? 'left' : 'right'} className="text-xs">
            {t(item.key)}
          </TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  };

  const SubscriptionBadge = ({ collapsed }: { collapsed?: boolean }) => (
    <div className={`${collapsed ? 'px-1' : 'px-2'} py-2 border-b border-white/10`}>
      {collapsed ? (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <div className="flex justify-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTierColor()}`}>
                {subscription?.tier === 'premium' ? (
                  <Crown className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side={isRTL ? 'left' : 'right'}>
            <div className="text-xs">
              <div className="font-semibold">{getTierLabel()}</div>
              {subscription?.daysRemaining !== undefined && subscription.daysRemaining > 0 && (
                <div className="text-muted-foreground">{subscription.daysRemaining} days left</div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      ) : (
        <div className={`rounded-lg p-2 ${getTierColor()}`}>
          <div className="flex items-center gap-2">
            {subscription?.tier === 'premium' ? (
              <Crown className="h-4 w-4" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold">{getTierLabel()}</div>
              {subscription?.daysRemaining !== undefined && subscription.daysRemaining > 0 && (
                <div className="text-xs opacity-80">{subscription.daysRemaining} days left</div>
              )}
            </div>
          </div>
          {subscription?.tier !== 'premium' && (
            <Link href="/upgrade">
              <Button size="sm" variant="secondary" className="w-full mt-2 h-7 text-xs bg-white/20 hover:bg-white/30">
                <Zap className="h-3 w-3 mr-1" />
                Upgrade
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );

  const Sidebar = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full bg-transparent">
      <div className={`${collapsed ? 'p-2' : 'p-3'} border-b flex items-center justify-center border-white/10`}>
        {collapsed ? (
          <Link href="/dashboard" className="flex items-center justify-center">
            <AurexLogo size="sm" variant="icon" />
          </Link>
        ) : (
          <Link href="/dashboard" className="flex items-center gap-2">
            <AurexLogo size="sm" variant="full" />
          </Link>
        )}
      </div>

      <SubscriptionBadge collapsed={collapsed} />

      <div className={`${collapsed ? 'px-1 py-2' : 'px-2 py-2'} flex justify-center border-b border-white/10`}>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-7 w-7"
            >
              {collapsed ? (
                <PanelLeft className="h-3.5 w-3.5" />
              ) : (
                <PanelLeftClose className="h-3.5 w-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isRTL ? 'left' : 'right'}>
            {collapsed ? 'Expand' : 'Collapse'}
          </TooltipContent>
        </Tooltip>
      </div>

      <nav className={`flex-1 ${collapsed ? 'px-1' : 'px-2'} py-2 space-y-1`}>
        {navItems.map((item) => (
          <NavLink key={item.key} item={item} collapsed={collapsed} />
        ))}
      </nav>

      <div className={`${collapsed ? 'px-1' : 'px-2'} border-t border-white/10 py-2`}>
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLanguage}
                className="w-full h-7"
              >
                <Globe className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isRTL ? 'left' : 'right'}>
              {language === 'en' ? 'اردو' : 'English'}
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 h-7 text-xs"
            onClick={toggleLanguage}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>{language === 'en' ? 'اردو' : 'English'}</span>
          </Button>
        )}
      </div>
    </div>
  );

  const MobileSidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <AurexLogo size="sm" variant="full" />
        </Link>
      </div>
      <div className="p-3 border-b">
        <div className={`rounded-lg p-2 ${getTierColor()}`}>
          <div className="flex items-center gap-2">
            {subscription?.tier === 'premium' ? (
              <Crown className="h-4 w-4" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <div className="flex-1">
              <div className="text-xs font-semibold">{getTierLabel()}</div>
              {subscription?.daysRemaining !== undefined && subscription.daysRemaining > 0 && (
                <div className="text-xs opacity-80">{subscription.daysRemaining} days left</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.key} item={item} collapsed={false} />
        ))}
      </nav>
      <div className="p-3 border-t space-y-2">
        {subscription?.tier !== 'premium' && (
          <Link href="/upgrade" onClick={() => setMobileOpen(false)}>
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <Zap className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
          </Link>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 h-8 text-sm"
          onClick={toggleLanguage}
        >
          <Globe className="h-4 w-4" />
          {language === 'en' ? 'اردو' : 'English'}
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 h-8 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          {t('logout')}
        </Button>
      </div>
    </div>
  );

  if (isLocked && pathname !== '/upgrade' && pathname !== '/activate') {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-tr from-red-500/20 via-orange-500/20 to-yellow-500/20 rounded-full blur-3xl -z-10 opacity-60" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full"
          >
            <Card className="border border-red-200 dark:border-red-900 bg-white/80 dark:bg-black/80 backdrop-blur-xl shadow-2xl">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
                  <Lock className="h-10 w-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Account Locked</h2>
                <p className="text-muted-foreground mb-6">
                  {subscription?.needsActivation 
                    ? "Please activate your free trial to continue using all features."
                    : "Your subscription has expired. Upgrade to premium to continue using all features."}
                </p>
                <div className="space-y-3">
                  <Link href={subscription?.needsActivation ? "/activate" : "/upgrade"}>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Zap className="h-4 w-4 mr-2" />
                      {subscription?.needsActivation ? "Activate Free Trial" : "Upgrade Now"}
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className={`min-h-screen bg-background relative overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-tr from-purple-500/10 via-blue-500/10 to-cyan-500/10 rounded-full blur-3xl -z-10 opacity-60 pointer-events-none animate-pulse duration-[5000ms]" />
        <div className="fixed bottom-0 right-0 w-[800px] h-[600px] bg-gradient-to-bl from-pink-500/10 via-orange-500/10 to-yellow-500/10 rounded-full blur-3xl -z-10 opacity-40 pointer-events-none" />

        <aside
          className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col border-r border-white/20 bg-background/60 backdrop-blur-xl transition-all duration-200 ${sidebarCollapsed ? 'lg:w-12' : 'lg:w-48'
            }`}
        >
          <Sidebar collapsed={sidebarCollapsed} />
        </aside>

        <header className="lg:hidden sticky top-0 z-50 flex h-12 items-center gap-3 border-b border-white/20 bg-background/60 backdrop-blur-xl px-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? 'right' : 'left'} className="w-56 p-0">
              <MobileSidebar />
            </SheetContent>
          </Sheet>

          <div className="flex-1">
            <AurexLogo size="sm" variant="full" />
          </div>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Avatar className="h-7 w-7">
                  {userImage && <AvatarImage src={userImage} alt={userName} />}
                  <AvatarFallback className="text-xs">{userInitial}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
              <DropdownMenuItem onClick={toggleLanguage}>
                <Globe className="h-4 w-4 mr-2" />
                {language === 'en' ? 'اردو' : 'English'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                {t('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className={`transition-all duration-200 ${sidebarCollapsed ? 'lg:pl-12' : 'lg:pl-48'
          }`}>
          <header className="hidden lg:flex h-12 items-center justify-between border-b border-white/20 bg-background/60 backdrop-blur-xl px-4">
            <h1 className="text-sm font-medium">
              {navItems.find(item => pathname.startsWith(item.href))?.key
                ? t(navItems.find(item => pathname.startsWith(item.href))!.key)
                : t('dashboard')}
            </h1>

            <div className="flex items-center gap-2">
              <ThemeToggle />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 h-8">
                    <Avatar className="h-6 w-6">
                      {userImage && <AvatarImage src={userImage} alt={userName} />}
                      <AvatarFallback className="text-xs">{userInitial}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{userName}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                  <DropdownMenuItem disabled className="text-xs">
                    {userEmail}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <div className="p-4">
            {children}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}