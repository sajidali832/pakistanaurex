"use client";

import React, { useEffect, useState } from 'react';
import { FloatingNav } from '@/components/ui/floating-navbar';
import { Home, BookOpen, LayoutDashboard, LogIn, UserPlus } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AurexLogo } from '@/components/AurexLogo';
import Link from 'next/link';
import { useAuth, useUser } from '@clerk/nextjs';

export function PublicHeader() {
    const { isSignedIn, isLoaded } = useAuth();
    const { user } = useUser();

    // We should allow the component to mount first to avoid hydration mismatch
    // But Clerk's hooks handle this reasonably well.
    // Ideally we want to show loading state or default to guest, but for header links it's okay to update.

    const navItems = [
        {
            name: "Home",
            link: "/",
            icon: <Home className="h-4 w-4 text-neutral-500 dark:text-white" />,
        },
        {
            name: "Blog",
            link: "/blog",
            icon: <BookOpen className="h-4 w-4 text-neutral-500 dark:text-white" />,
        },
    ];

    // Add auth-specific link: only show Dashboard when signed in.
    // We intentionally do NOT show small Login/Register here because
    // the hero section already has big buttons for those actions.
    if (isLoaded && isSignedIn) {
        navItems.push({
            name: "Dashboard",
            link: "/dashboard",
            icon: <LayoutDashboard className="h-4 w-4 text-neutral-500 dark:text-white" />,
        });
    }

    return (
        <div className="relative w-full">
            <FloatingNav navItems={navItems} />

            {/* Logo fixed at top left */}
            <div className="fixed top-5 left-5 z-[5001]">
                <Link href="/">
                    <AurexLogo size="md" variant="full" />
                </Link>
            </div>

            {/* Theme Toggle fixed at top right */}
            <div className="fixed top-5 right-5 z-[5001]">
                <ThemeToggle />
            </div>
        </div>
    );
}
