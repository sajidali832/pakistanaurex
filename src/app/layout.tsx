import type { Metadata, Viewport } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import { ThemeProvider } from "@/components/ThemeProvider";
import Script from "next/script";

export const metadata: Metadata = {
  title: {
    default: "Aurex - Smart Business Management for Growing Enterprises",
    template: "%s | Aurex"
  },
  description: "Simplify your business finances with Aurex. Professional invoicing, expense tracking, inventory management, and CRM tools designed for modern businesses.",
  keywords: ["business management", "invoicing software", "accounting tool", "inventory management", "CRM", "expense tracking", "financial reporting", "small business software", "Aurex", "billing software"],
  authors: [{ name: "Aurex Team" }],
  creator: "Aurex",
  publisher: "Aurex",
  metadataBase: new URL('https://aurex.company'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aurex.company",
    title: "Aurex - Smart Business Management",
    description: "The all-in-one platform for invoicing, inventory, and client management. Start growing your business today.",
    siteName: "Aurex",
    images: [
      {
        url: "/og-image.jpg", // We should probably create this or use a placeholder
        width: 1200,
        height: 630,
        alt: "Aurex Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aurex - Business Management Simplified",
    description: "Manage invoices, clients, and expenses in one place. Try Aurex for free.",
    images: ["/og-image.jpg"],
    creator: "@aurex",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AUREX",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icons/icon-512x512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <ErrorReporter />
          <Script
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
            strategy="afterInteractive"
            data-target-origin="*"
            data-message-type="ROUTE_CHANGE"
            data-include-search-params="true"
            data-only-in-iframe="true"
            data-debug="true"
            data-custom-data='{"appName": "AUREX", "version": "1.0.0", "greeting": "hi"}'
          />
          <Script id="register-sw" strategy="afterInteractive">
            {`
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                      console.log('SW registered:', registration.scope);
                    })
                    .catch((error) => {
                      console.log('SW registration failed:', error);
                    });
                });
              }
            `}
          </Script>
          {children}
          <VisualEditsMessenger />
        </ThemeProvider>
      </body>
    </html>
  );
}