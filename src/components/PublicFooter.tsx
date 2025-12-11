import Link from 'next/link';
import { AurexLogo } from '@/components/AurexLogo';

export function PublicFooter() {
  return (
    <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link href="/">
              <AurexLogo size="sm" variant="full" />
            </Link>
          </div>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/support" className="hover:text-foreground transition-colors">Support</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
        <div className="mt-6 text-center md:text-left text-xs text-muted-foreground">
          © {new Date().getFullYear()} Aurex. All rights reserved.
        </div>
      </div>
    </footer>
  );
}