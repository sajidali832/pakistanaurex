import Link from 'next/link';
import { AurexLogo } from '@/components/AurexLogo';

export function PublicFooter() {
    return (
        <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t bg-muted/20 text-foreground">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-2">
                        <Link href="/">
                            <AurexLogo size="md" variant="full" />
                        </Link>
                    </div>
                    <div className="flex gap-8 text-sm text-muted-foreground">
                        <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
                        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
                        <Link href="/support" className="hover:text-primary transition-colors">Support</Link>
                        <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
                    </div>
                </div>
                <div className="mt-8 text-center md:text-left text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Aurex. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
