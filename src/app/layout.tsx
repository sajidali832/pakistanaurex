import type { Metadata, Viewport } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";

export const metadata: Metadata = {
  title: {
    default: "Aurex - Best Free Invoice Software & Business Management for Pakistan SMBs",
    template: "%s | Aurex - Free Invoice & Quotation Software Pakistan"
  },
  description: "Aurex is the #1 free invoicing software for Pakistani businesses. Create professional invoices, quotations, tax invoices (FBR compliant), manage clients & track payments. Best billing software for SMBs in Karachi, Lahore, Islamabad. Free invoice generator with GST/Sales Tax support.",
  keywords: [
    "free invoice software pakistan",
    "invoice generator pakistan",
    "billing software karachi",
    "quotation software lahore",
    "invoice maker islamabad",
    "FBR tax invoice software",
    "GST invoice pakistan",
    "sales tax invoice generator",
    "free billing software SMB",
    "small business invoicing",
    "professional invoice template",
    "quotation maker free",
    "client management software",
    "accounting software pakistan",
    "business management software",
    "invoice software free download",
    "online invoice generator",
    "best invoicing app pakistan",
    "free invoice template pakistan",
    "Aurex invoicing",
    "create invoice online free",
    "send invoice pakistan",
    "invoice tracking software",
    "payment tracking app",
    "expense management pakistan",
    "CRM software pakistan",
    "inventory management",
    "financial reporting tool",
    "cloud accounting software",
    "invoice software for freelancers",
    "contractor invoice software",
    "professional billing system",
    "recurring invoice software",
    "invoice automation",
    "digital invoice pakistan",
    "e-invoicing pakistan",
    "STRN invoice generator",
    "NTN invoice software",
    "business invoice creator"
  ],
  authors: [{ name: "Aurex Team" }],
  creator: "Aurex",
  publisher: "Aurex",
  metadataBase: new URL('https://aurex.sbs'),
  alternates: {
    canonical: '/',
    languages: {
      'en': '/',
      'ur': '/?lang=ur',
    }
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'verification_token',
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    alternateLocale: ["ur_PK", "en_US"],
    url: "https://aurex.sbs",
    title: "Aurex - Free Invoice & Quotation Software for Pakistan",
    description: "Create professional invoices, quotations & tax invoices for free. Best billing software for Pakistani SMBs. FBR compliant, GST support, client management & more.",
    siteName: "Aurex",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Aurex - Professional Invoice Software Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aurex - #1 Free Invoice Software Pakistan",
    description: "Create professional invoices & quotations for free. Best billing software for Pakistani businesses. Start now!",
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
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.png",
  },
  category: 'Business Software',
  classification: 'Invoice Software, Accounting Software, Business Management',
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
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/favicon.png" sizes="32x32" type="image/png" />
          <link rel="icon" href="/icons/icon-192x192.png" sizes="192x192" type="image/png" />
          <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
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
    </ClerkProvider>
  );
}