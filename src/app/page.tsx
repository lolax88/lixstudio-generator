import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'LixStudio — Buat Logo Gratis untuk Bisnis Anda',
  description:
    'Buat logo profesional untuk bisnis Anda dalam hitungan detik. Gratis, tanpa perlu keahlian desain. Cocok untuk UMKM, warung kopi, villa, dan usaha kecil.',
  openGraph: {
    title: 'LixStudio — Buat Logo Gratis',
    description: 'Buat logo profesional untuk bisnis Anda dalam hitungan detik. Gratis!',
    url: 'https://lixstudio-generatorz.vercel.app',
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
