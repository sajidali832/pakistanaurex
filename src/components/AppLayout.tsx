"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n, Language } from '@/lib/i18n';
import { authClient, useSession } from '@/lib/auth-client';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
} from 'lucide-react';

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

export default function AppLayout({ children }: AppLayoutProps) {
  const { t, language, setLanguage, isRTL } = useI18n();
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  const handleSignOut = async () => {
    const token = localStorage.getItem("bearer_token");
    await authClient.signOut({
      fetchOptions: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
    localStorage.removeItem("bearer_token");
    refetch();
    router.push('/login');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ur' : 'en');
  };

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const Icon = item.icon;
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

    return (
      <Link
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
      >
        <Icon className="h-5 w-5" />
        <span>{t(item.key)}</span>
      </Link>
    );
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <AurexLogo size="md" variant="full" />
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.key} item={item} />
        ))}
      </nav>

      <div className="p-4 border-t space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={toggleLanguage}
        >
          <Globe className="h-4 w-4" />
          {language === 'en' ? 'اردو' : 'English'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col border-r bg-card">
        <Sidebar />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side={isRTL ? 'right' : 'left'} className="w-64 p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>

        <div className="flex-1">
          <AurexLogo size="sm" variant="full" />
        </div>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {session.user.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
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

      {/* Main Content */}
      <main className="lg:pl-64">
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 items-center justify-between border-b bg-background px-6">
          <h1 className="text-xl font-semibold">
            {navItems.find(item => pathname.startsWith(item.href))?.key
              ? t(navItems.find(item => pathname.startsWith(item.href))!.key)
              : t('dashboard')}
          </h1>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {session.user.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span>{session.user.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                <DropdownMenuItem disabled>
                  {session.user.email}
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

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}