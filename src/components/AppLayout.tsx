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
    // Load collapsed state from localStorage
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Get user display info
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
        className={`flex items-center ${collapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2.5'} rounded-xl transition-all duration-300 ${isActive
          ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/30'
          : 'text-muted-foreground hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 dark:hover:from-violet-950/30 dark:hover:to-purple-950/30 hover:text-violet-700 dark:hover:text-violet-400'
        }`}
      >
        <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'drop-shadow-lg' : ''}`} />
        {!collapsed && <span className="text-sm font-medium truncate">{t(item.key)}</span>}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side={isRTL ? 'left' : 'right'} className="font-medium text-sm">
            {t(item.key)}
          </TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  };

  const Sidebar = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 dark:from-gray-950 dark:via-purple-950/20 dark:to-pink-950/20">
      {/* Header with logo */}
      <div className={`${collapsed ? 'p-3' : 'p-4'} border-b border-purple-200/50 dark:border-purple-800/30 flex items-center justify-center`}>
        {collapsed ? (
          <Link href="/dashboard" className="flex items-center justify-center">
            <AurexLogo size="lg" variant="icon" />
          </Link>
        ) : (
          <Link href="/dashboard" className="flex items-center gap-2">
            <AurexLogo size="md" variant="full" />
          </Link>
        )}
      </div>

      {/* Collapse Toggle Button - Icon only */}
      <div className={`${collapsed ? 'px-1 py-2' : 'px-3 py-2'} flex justify-center border-b border-purple-200/50 dark:border-purple-800/30`}>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hover:bg-purple-100 dark:hover:bg-purple-900/30 h-8 w-8 hover:text-purple-700 dark:hover:text-purple-400"
            >
              {collapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isRTL ? 'left' : 'right'}>
            {collapsed ? 'Expand' : 'Collapse'}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${collapsed ? 'px-1' : 'px-2'} py-2 space-y-1`}>
        {navItems.map((item) => (
          <NavLink key={item.key} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Footer - Language Toggle */}
      <div className={`${collapsed ? 'px-1' : 'px-2'} border-t border-purple-200/50 dark:border-purple-800/30 py-2`}>
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLanguage}
                className="w-full h-8 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-400"
              >
                <Globe className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isRTL ? 'left' : 'right'}>
              {language === 'en' ? 'اردو' : 'English'}
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 h-8 border-purple-200 dark:border-purple-800/30 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-400 hover:border-purple-300"
            onClick={toggleLanguage}
          >
            <Globe className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">{language === 'en' ? 'اردو' : 'English'}</span>
          </Button>
        )}
      </div>
    </div>
  );

  // Mobile Sidebar (always expanded)
  const MobileSidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <AurexLogo size="md" variant="full" />
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.key} item={item} collapsed={false} />
        ))}
      </nav>
      <div className="p-4 border-t">
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
    <TooltipProvider>
      <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
        {/* Desktop Sidebar */}
        <aside
          className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col border-r bg-card transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:w-14' : 'lg:w-52'
            }`}
        >
          <Sidebar collapsed={sidebarCollapsed} />
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
              <MobileSidebar />
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
                  {userImage && <AvatarImage src={userImage} alt={userName} />}
                  <AvatarFallback>{userInitial}</AvatarFallback>
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
        <main className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:pl-14' : 'lg:pl-52'
          }`}>
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
                      {userImage && <AvatarImage src={userImage} alt={userName} />}
                      <AvatarFallback>{userInitial}</AvatarFallback>
                    </Avatar>
                    <span>{userName}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                  <DropdownMenuItem disabled>
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

          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}