'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLang } from '@/context/LanguageContext';

// Warung Kopi — real logos
const WARUNGKOPI = [
  { name: 'Kopi Pagi', src: '/templates/kopi-pagi/kopi-pagi-icon.png', desc: 'Paper cup + steam, minimalis modern', descEn: 'Paper cup + steam, minimalist modern' },
  { name: 'Roast House', src: '/templates/roast-house/roasthouse-wordmark.png', desc: 'Custom typography, pure wordmark', descEn: 'Custom typography, pure wordmark' },
  { name: 'Senja Coffee', src: '/templates/senja-coffee/senja-coffee-icon.png', desc: 'Sunset icon, bold & elegant', descEn: 'Sunset icon, bold & elegant' },
  { name: 'Kedai Nusantara', src: '/templates/kedai-nusantara/kedai-nusantara-icon.png', desc: 'Cup kertas + motif daun, budaya Indonesia', descEn: 'Paper cup + leaf motif, Indonesian heritage' },
];

// Placeholder categories — will be replaced with real logos later
const PLACEHOLDER_CATS = [
  {
    category: 'Villa & Bali Tourism',
    categoryEn: 'Villa & Tourism',
    icon: '🌴',
    color: '#0D9488',
    items: ['Villa Indah', 'Bali Retreat', 'Sunset Villa', 'Tropis Stay'],
  },
  {
    category: 'Rental Motor',
    categoryEn: 'Motor Rental',
    icon: '🛵',
    color: '#1E88E5',
    items: ['Ride Bali', 'MotoRent', 'Bali Wheels', 'GoRide'],
  },
  {
    category: 'Fashion & Beauty',
    categoryEn: 'Fashion & Beauty',
    icon: '👗',
    color: '#B76E79',
    items: ['Luxe Beauty', 'Studio Mode', 'Glow Skin', 'Batik Modern'],
  },
  {
    category: 'Tech & Startup',
    categoryEn: 'Tech & Startup',
    icon: '💻',
    color: '#00B0FF',
    items: ['ByteLab', 'CloudSync', 'PixelCraft', 'LaunchPad'],
  },
];

function PlaceholderLogo({ color, name }: { color: string; name: string }) {
  return (
    <div className="flex items-center justify-center w-20 h-20 mx-auto rounded-xl bg-gray-800/50 border border-gray-700/50">
      <span className="text-2xl font-bold" style={{ color }}>{name.charAt(0)}</span>
    </div>
  );
}

export default function PortfolioPage() {
  const { lang } = useLang();

  return (
    <main className="bg-gray-950 min-h-screen">
      {/* Header */}
      <section className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Link href="/generator" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors">
            ← {lang === 'id' ? 'Kembali ke Generator' : 'Back to Generator'}
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            {lang === 'id' ? 'Portofolio Logo' : 'Logo Portfolio'}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {lang === 'id'
              ? 'Contoh logo yang dibuat dengan LixStudio. Setiap logo unik, profesional, dan siap pakai untuk bisnis Anda.'
              : 'Sample logos created with LixStudio. Each logo is unique, professional, and ready to use for your business.'}
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Link
              href="/generator"
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-xl shadow-violet-500/25"
            >
              {lang === 'id' ? 'Buat Logo Anda' : 'Create Your Logo'}
            </Link>
            <a
              href="#templates"
              className="px-6 py-3 border border-gray-700 text-gray-300 font-medium rounded-xl hover:bg-gray-800/50 hover:border-gray-600 transition-all"
            >
              {lang === 'id' ? 'Lihat Contoh' : 'See Examples'}
            </a>
          </div>
        </div>
      </section>

      {/* Warung Kopi — REAL LOGOS */}
      <section id="templates" className="pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">☕</span>
            <h2 className="text-2xl font-bold text-white">
              {lang === 'id' ? 'Warung Kopi' : 'Coffee Shop'}
            </h2>
            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
              {lang === 'id' ? 'Selesai' : 'Done'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {WARUNGKOPI.map((item, i) => (
              <div
                key={i}
                className="group bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6 hover:border-violet-500/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className="relative w-full aspect-square mx-auto mb-4 rounded-xl overflow-hidden bg-white/5 border border-gray-700/50 group-hover:border-violet-500/30 transition-colors">
                  <Image
                    src={item.src}
                    alt={item.name}
                    fill
                    className="object-contain p-2"
                    unoptimized
                  />
                </div>
                <p className="text-sm font-medium text-white text-center">{item.name}</p>
                <p className="text-xs text-gray-500 text-center mt-1">
                  {lang === 'id' ? item.desc : item.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Placeholder categories */}
      {PLACEHOLDER_CATS.map((cat, ci) => (
        <section key={ci} className="pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">{cat.icon}</span>
              <h2 className="text-2xl font-bold text-white">
                {lang === 'id' ? cat.category : cat.categoryEn}
              </h2>
              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full">
                {lang === 'id' ? 'Segera' : 'Coming Soon'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {cat.items.map((name, ii) => (
                <div
                  key={ii}
                  className="group bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6 opacity-60"
                >
                  <PlaceholderLogo color={cat.color} name={name} />
                  <p className="text-sm font-medium text-white text-center mt-4">{name}</p>
                  <p className="text-xs text-gray-500 text-center mt-1">
                    {lang === 'id' ? 'Segera hadir' : 'Coming soon'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="pb-24 px-4">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-b from-violet-950/40 to-gray-900/50 rounded-2xl border border-violet-500/30 p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            {lang === 'id' ? 'Mau Logo Seperti Ini?' : 'Want a Logo Like This?'}
          </h2>
          <p className="text-gray-400 mb-8">
            {lang === 'id'
              ? 'Buat logo Anda sendiri secara gratis, atau hubungi kami untuk desain kustom profesional.'
              : 'Create your own logo for free, or contact us for professional custom design.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/generator"
              className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-xl shadow-violet-500/25"
            >
              {lang === 'id' ? 'Buat Logo — Gratis' : 'Create Logo — Free'}
            </Link>
            <a
              href="https://wa.me/6281246113369"
              target="_blank"
              rel="noopener"
              className="px-8 py-3.5 border border-gray-700 text-gray-300 font-medium rounded-xl hover:bg-gray-800/50 hover:border-gray-600 transition-all"
            >
              {lang === 'id' ? '💬 Hubungi Kami' : '💬 Contact Us'}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
