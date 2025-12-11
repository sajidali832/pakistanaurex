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

    const navItems = [];

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

            <div className="fixed top-5 left-5 z-[5001]">
                <Link href="/">
                    <AurexLogo size="md" variant="full" />
                </Link>
            </div>

            <div className="fixed top-5 right-5 z-[5001]">
                <ThemeToggle />
            </div>
        </div>
    );
}