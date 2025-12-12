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
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.key} item={item} collapsed={false} />
        ))}
      </nav>
      <div className="p-3 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 h-8 text-sm"
          onClick={toggleLanguage}
        >
          <Globe className="h-4 w-4" />
          {language === 'en' ? 'اردو' : 'English'}
        </Button>
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <div className={`min-h-screen bg-background relative overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}>
        {/* Abstract Background Elements */}
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