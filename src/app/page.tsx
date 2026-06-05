import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'LixStudio — Buat Logo Gratis, Langsung Pakai',
  description:
    'Buat logo profesional untuk bisnis Anda dalam hitungan detik. Gratis, tanpa perlu keahlian desain. Cocok untuk UMKM, warung kopi, villa, dan usaha kecil.',
  keywords: 'logo generator, buat logo gratis, desain logo UMKM, logo bisnis kecil, logo warung kopi, logo villa bali',
  openGraph: {
    title: 'LixStudio — Buat Logo Gratis',
    description: 'Buat logo profesional untuk bisnis Anda dalam hitungan detik. Gratis!',
    type: 'website',
    locale: 'id_ID',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LixStudio — Buat Logo Gratis',
    description: 'Buat logo profesional untuk bisnis Anda dalam hitungan detik. Gratis!',
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