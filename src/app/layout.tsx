import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'LixStudio — Logo Generator Gratis',
    template: '%s | LixStudio',
  },
  description: 'Buat logo profesional untuk bisnis Anda dalam hitungan detik. Gratis, tanpa perlu keahlian desain. Cocok untuk UMKM dan usaha kecil.',
  keywords: ['logo generator', 'buat logo gratis', 'desain logo', 'UMMK', 'bisnis kecil'],
  authors: [{ name: 'LixStudio' }],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'LixStudio Logo Generator',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-gray-950 text-white`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
