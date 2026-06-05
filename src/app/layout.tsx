import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { Analytics } from '@vercel/analytics/react';
import MetaPixel from '@/components/MetaPixel';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const SITE_URL = 'https://lixstudio-generatorz.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'LixStudio — Buat Logo Gratis untuk Bisnis Anda',
    template: '%s | LixStudio',
  },
  description:
    'Buat logo profesional untuk bisnis Anda dalam hitungan detik. Gratis, tanpa perlu keahlian desain. Cocok untuk UMKM, warung kopi, villa, dan usaha kecil.',
  keywords: [
    'logo generator gratis',
    'buat logo online',
    'desain logo UMKM',
    'logo bisnis kecil',
    'logo warung kopi',
    'logo villa bali',
    'logo generator indonesia',
    'free logo maker',
    'logo design tool',
    'SVG logo generator',
  ],
  authors: [{ name: 'LixStudio', url: SITE_URL }],
  creator: 'LixStudio',
  publisher: 'LixStudio',
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
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: SITE_URL,
    siteName: 'LixStudio Logo Generator',
    title: 'LixStudio — Buat Logo Gratis untuk Bisnis Anda',
    description:
      'Buat logo profesional untuk bisnis Anda dalam hitungan detik. Gratis!',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'LixStudio Logo Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LixStudio — Buat Logo Gratis',
    description:
      'Buat logo profesional untuk bisnis Anda dalam hitungan detik. Gratis!',
    images: [`${SITE_URL}/og-image.png`],
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'id-ID': SITE_URL,
      'en-US': SITE_URL,
    },
  },
  verification: {
    // google: 'YOUR_GOOGLE_VERIFICATION_CODE',  // Tambah nanti
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="canonical" href={SITE_URL} />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'LixStudio Logo Generator',
              url: SITE_URL,
              description:
                'Buat logo profesional untuk bisnis Anda dalam hitungan detik. Gratis!',
              applicationCategory: 'DesignApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              creator: {
                '@type': 'Organization',
                name: 'LixStudio',
                url: SITE_URL,
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-gray-950 text-white`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <Analytics />
        <MetaPixel />
      </body>
    </html>
  );
}
