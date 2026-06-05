import Navbar from '@/components/Navbar';
import LogoGenerator from '@/components/LogoGenerator';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Generator Logo — LixStudio',
  description:
    'Buat dan unduh logo profesional. Pilih industri, warna, gaya, dan pola. Ekspor sebagai SVG atau PNG.',
  openGraph: {
    title: 'Generator Logo — LixStudio',
    description: 'Buat logo profesional untuk bisnis Anda. Gratis!',
  },
};

export default function GeneratorPage() {
  return (
    <main className="bg-gray-950 min-h-screen">
      <Navbar />
      <LogoGenerator />
      <Footer />
    </main>
  );
}
