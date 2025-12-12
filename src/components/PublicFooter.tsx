import Link from 'next/link';
import { AurexLogo } from '@/components/AurexLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Facebook, Twitter, Instagram, Linkedin, Github, ArrowRight, Mail } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="bg-background border-t border-border/40 pt-16 pb-8 relative overflow-hidden">
      {/* Decorative gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-muted/20 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-block">
              <AurexLogo size="md" variant="full" />
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              Simplifying financial operations for modern businesses. 
              Manage invoices, expenses, and clients all in one place.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-foreground">Product</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Testimonials</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Changelog</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-foreground">Company</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/partners" className="hover:text-primary transition-colors">Partners</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-bold text-foreground">Stay Updated</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to our newsletter for the latest updates and financial tips.
            </p>
            <div className="flex gap-2">
              <Input 
                placeholder="Enter your email" 
                className="bg-background border-border/60 focus-visible:ring-primary/20"
              />
              <Button size="icon" className="shrink-0 bg-primary hover:bg-primary/90">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              By subscribing, you agree to our Privacy Policy and provide consent to receive updates.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Aurex Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}