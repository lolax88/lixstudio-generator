'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';

// Template data — replace with real logos later
const TEMPLATES = [
  {
    category: 'Warung Kopi',
    icon: '☕',
    categoryEn: 'Coffee Shop',
    items: [
      { name: 'Kopi Pagi', color: '#5C3D2E', pattern: 'geometric-shapes' },
      { name: 'Senja Coffee', color: '#D4712A', pattern: 'line-system' },
      { name: 'Kedai Nusantara', color: '#2D5A3D', pattern: 'dot-matrix' },
      { name: 'Roast House', color: '#0D0D0D', pattern: 'node-network' },
    ],
  },
  {
    category: 'Villa & Bali Tourism',
    icon: '🌴',
    categoryEn: 'Villa & Tourism',
    items: [
      { name: 'Villa Indah', color: '#0D9488', pattern: 'dot-matrix' },
      { name: 'Bali Retreat', color: '#B8860B', pattern: 'geometric-shapes' },
      { name: 'Sunset Villa', color: '#E07A5F', pattern: 'line-system' },
      { name: 'Tropis Stay', color: '#52B788', pattern: 'node-network' },
    ],
  },
  {
    category: 'Rental Motor',
    icon: '🛵',
    categoryEn: 'Motor Rental',
    items: [
      { name: 'Ride Bali', color: '#1E88E5', pattern: 'node-network' },
      { name: 'MotoRent', color: '#E53935', pattern: 'geometric-shapes' },
      { name: 'Bali Wheels', color: '#43A047', pattern: 'dot-matrix' },
      { name: 'GoRide', color: '#FF6D00', pattern: 'line-system' },
    ],
  },
  {
    category: 'Fashion & Beauty',
    icon: '👗',
    categoryEn: 'Fashion & Beauty',
    items: [
      { name: 'Luxe Beauty', color: '#B76E79', pattern: 'dot-matrix' },
      { name: 'Studio Mode', color: '#0D0D0D', pattern: 'line-system' },
      { name: 'Glow Skin', color: '#9575CD', pattern: 'geometric-shapes' },
      { name: 'Batik Modern', color: '#6D4C41', pattern: 'node-network' },
    ],
  },
  {
    category: 'Tech & Startup',
    icon: '💻',
    categoryEn: 'Tech & Startup',
    items: [
      { name: 'ByteLab', color: '#00B0FF', pattern: 'node-network' },
      { name: 'CloudSync', color: '#7C3AED', pattern: 'geometric-shapes' },
      { name: 'PixelCraft', color: '#00E676', pattern: 'dot-matrix' },
      { name: 'LaunchPad', color: '#FF6D00', pattern: 'line-system' },
    ],
  },
];

// Simple SVG demo icons for showcase (will be replaced with real templates)
function DemoLogo({ color, pattern }: { color: string; pattern: string }) {
  const patterns: Record<string, React.ReactNode> = {
    'dot-matrix': (
      <g fill={color}>
        {[0, 1, 2, 3, 4, 5].map(i => {
          const angle = (2 * Math.PI * i) / 6 - Math.PI / 2;
          return <circle key={i} cx={50 + 18 * Math.cos(angle)} cy={50 + 18 * Math.sin(angle)} r="4" />;
        })}
        <circle cx="50" cy="50" r="3" />
      </g>
    ),
    'geometric-shapes': (
      <g fill="none" stroke={color} strokeWidth="2">
        <circle cx="38" cy="50" r="18" />
        <circle cx="62" cy="50" r="18" />
        <circle cx="50" cy="35" r="18" />
      </g>
    ),
    'line-system': (
      <g fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <path d="M 20 50 Q 35 30, 50 50 T 80 50" />
        <path d="M 20 50 Q 35 40, 50 50 T 80 50" opacity="0.5" transform="translate(0,-8)" />
        <path d="M 20 50 Q 35 44, 50 50 T 80 50" opacity="0.3" transform="translate(0,8)" />
      </g>
    ),
    'node-network': (
      <g stroke={color} strokeWidth="2" fill="none">
        <path d="M 30 70 Q 50 70, 50 50 Q 50 30, 70 30" />
        <circle cx="30" cy="70" r="5" fill={color} />
        <circle cx="50" cy="50" r="6" fill={color} />
        <circle cx="70" cy="30" r="5" fill={color} />
      </g>
    ),
  };

  return (
    <svg viewBox="0 0 100 100" className="w-16 h-16">
      {patterns[pattern] || patterns['dot-matrix']}
    </svg>
  );
}

export default function PortfolioPage() {
  const { t, lang } = useLang();

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

      {/* Template Gallery */}
      <section id="templates" className="pb-24 px-4">
        <div className="max-w-6xl mx-auto space-y-16">
          {TEMPLATES.map((cat, ci) => (
            <div key={ci}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{cat.icon}</span>
                <h2 className="text-2xl font-bold text-white">
                  {lang === 'id' ? cat.category : cat.categoryEn}
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {cat.items.map((item, ii) => (
                  <div
                    key={ii}
                    className="group bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6 hover:border-violet-500/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-xl bg-gray-800/50 border border-gray-700/50 group-hover:border-violet-500/30 transition-colors">
                      <DemoLogo color={item.color} pattern={item.pattern} />
                    </div>
                    <p className="text-sm font-medium text-white text-center">{item.name}</p>
                    <p className="text-xs text-gray-500 text-center mt-1">{item.pattern}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

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
