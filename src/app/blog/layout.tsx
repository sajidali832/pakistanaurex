import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <PublicHeader />
            <main className="flex-1 pt-16">
                {children}
            </main>
            <PublicFooter />
        </div>
    );
}
