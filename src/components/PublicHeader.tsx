"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AurexLogo } from '@/components/AurexLogo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@clerk/nextjs';
import { Menu, X } from 'lucide-react';

export function PublicHeader() {
  const { isSignedIn, isLoaded } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Blog', href: '/blog' },
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
    { name: 'Support', href: '/support' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
      >
        <div className="pointer-events-auto bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl shadow-black/5 rounded-full px-6 py-3 flex items-center gap-4 max-w-fit mx-auto transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
          {/* Logo - Icon only on mobile, Full on desktop */}
          <Link href="/" className="flex items-center">
             <AurexLogo size="sm" variant="icon" className="sm:hidden" />
             <AurexLogo size="sm" variant="full" className="hidden sm:flex" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
               const isActive = pathname === item.href;
               return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  } group`}
                >
                  {item.name}
                  {/* Underline animation */}
                  <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-primary origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100" />
                  {isActive && (
                     <motion.div
                       layoutId="activeTab"
                       className="absolute bottom-1 left-4 right-4 h-0.5 bg-primary rounded-full"
                       transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                     />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 pl-2">
            <ThemeToggle />
            
            <div className="h-6 w-px bg-border/50 hidden sm:block" />
            
            {isLoaded && isSignedIn ? (
              <Link href="/dashboard">
                <Button size="sm" className="rounded-full px-6 h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20 transition-all border-none">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/register">
                <Button size="sm" className="rounded-full px-6 h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20 transition-all border-none">
                  Start Free
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-24 inset-x-4 z-40 p-4 bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl md:hidden"
          >
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-4 py-3 text-sm font-medium rounded-xl hover:bg-muted transition-colors flex items-center justify-between group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary">→</span>
                </Link>
              ))}
              {!isSignedIn && (
                <Link 
                  href="/login"
                  className="px-4 py-3 text-sm font-medium rounded-xl hover:bg-muted transition-colors text-muted-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}