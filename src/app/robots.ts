import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/invoices/',
          '/quotations/',
          '/tax-invoices/',
          '/clients/',
          '/reports/',
          '/bank-export/',
          '/settings/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/invoices/',
          '/quotations/',
          '/tax-invoices/',
          '/clients/',
          '/reports/',
          '/bank-export/',
          '/settings/',
        ],
      },
    ],
    sitemap: 'https://aurex.sbs/sitemap.xml',
    host: 'https://aurex.sbs',
  }
}
