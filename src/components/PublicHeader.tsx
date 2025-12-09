"use client";

import { FloatingNav } from '@/components/ui/floating-navbar';
import { Home, BookOpen } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AurexLogo } from '@/components/AurexLogo';
import Link from 'next/link';

export function PublicHeader() {
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
