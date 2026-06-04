import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'LixStudio Logo Generator — Create Professional SVG Logos Instantly',
  description:
    'Generate stunning, unique SVG logos using advanced geometric patterns, dot matrices, and node networks. No design skills needed. Free to start.',
  keywords: 'logo generator, SVG logo, design tool, brand identity, geometric logo, dot matrix',
  openGraph: {
    title: 'LixStudio Logo Generator',
    description: 'Create stunning SVG logos with advanced geometric patterns. Free to start.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LixStudio Logo Generator',
    description: 'Create stunning SVG logos with advanced geometric patterns.',
  },
};

export default function HomePage() {
  return (
    <main className="bg-gray-950 min-h-screen">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}