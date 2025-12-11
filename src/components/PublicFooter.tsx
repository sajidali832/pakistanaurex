import Link from 'next/link';
import { AurexLogo } from '@/components/AurexLogo';

export function PublicFooter() {
    return (
        <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t-4 border-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-pink-950/20">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-2">
                        <Link href="/">
                            <AurexLogo size="md" variant="full" />
                        </Link>
                    </div>
                    <div className="flex gap-8 text-sm font-semibold">
                        <Link href="/blog" className="text-gray-700 dark:text-gray-300 hover:text-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 hover:bg-clip-text transition-all">Blog</Link>
                        <Link href="/privacy" className="text-gray-700 dark:text-gray-300 hover:text-transparent hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:bg-clip-text transition-all">Privacy</Link>
                        <Link href="/terms" className="text-gray-700 dark:text-gray-300 hover:text-transparent hover:bg-gradient-to-r hover:from-orange-600 hover:to-amber-600 hover:bg-clip-text transition-all">Terms</Link>
                        <Link href="/support" className="text-gray-700 dark:text-gray-300 hover:text-transparent hover:bg-gradient-to-r hover:from-green-600 hover:to-emerald-600 hover:bg-clip-text transition-all">Support</Link>
                        <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-transparent hover:bg-gradient-to-r hover:from-rose-600 hover:to-red-600 hover:bg-clip-text transition-all">Contact</Link>
                    </div>
                </div>
                <div className="mt-8 text-center md:text-left text-sm text-gray-600 dark:text-gray-400 font-medium">
                    © {new Date().getFullYear()} Aurex. All rights reserved.
                </div>
            </div>
        </footer>
    );
}