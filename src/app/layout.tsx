import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'LixStudio Logo Generator',
    template: '%s | LixStudio',
  },
  description: 'Professional SVG logo generator using algorithmic design patterns. Create unique, beautiful logos for any brand.',
  keywords: ['logo generator', 'SVG', 'design', 'brand identity', 'geometric', 'dot matrix'],
  authors: [{ name: 'LixStudio' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'LixStudio Logo Generator',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-gray-950 text-white`}>
        {children}
      </body>
    </html>
  );
}