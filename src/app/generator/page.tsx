import Navbar from '@/components/Navbar';
import LogoGenerator from '@/components/LogoGenerator';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Create Your Logo — LixStudio Logo Generator',
  description:
    'Design and download professional SVG logos. Choose your industry, colors, style, and pattern. Export as SVG or PNG.',
  openGraph: {
    title: 'Create Your Logo — LixStudio Logo Generator',
    description: 'Design and download professional SVG logos. Export as SVG or PNG.',
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