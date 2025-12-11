"use client";

import React from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AurexLogo } from '@/components/AurexLogo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@clerk/nextjs';

export function PublicHeader() {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/">
          <AurexLogo size="sm" variant="full" />
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isLoaded && isSignedIn ? (
            <Link href="/dashboard">
              <Button size="sm" className="h-8 text-xs">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="h-8 text-xs">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="h-8 text-xs">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}