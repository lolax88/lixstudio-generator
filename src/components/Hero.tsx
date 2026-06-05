'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';

export default function Hero() {
  const { t } = useLang();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 mb-8">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-sm text-emerald-300 font-medium">{t('hero_badge')}</span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          <span className="text-white">{t('hero_title_1')}</span>
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            {t('hero_title_2')}
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          {t('hero_desc')}{' '}
          <span className="text-gray-300 font-medium">{t('hero_desc_bold')}</span>
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/generator"
            className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-xl shadow-violet-500/25 text-lg"
          >
            {t('hero_cta')}
          </Link>
          <a
            href="#how-it-works"
            className="px-8 py-3.5 border border-gray-700 text-gray-300 font-medium rounded-xl hover:bg-gray-800/50 hover:border-gray-600 transition-all"
          >
            {t('hero_cta_2')}
          </a>
        </div>

        {/* Preview logos */}
        <div className="relative mx-auto max-w-3xl">
          <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-8 shadow-2xl">
            <div className="grid grid-cols-4 gap-6">
              {[
                { name: 'NovaByte', color: '#7C3AED', pattern: 'node-network' },
                { name: 'Bloom', color: '#EC4899', pattern: 'geometric-shapes' },
                { name: 'WaveRider', color: '#06B6D4', pattern: 'line-system' },
                { name: 'Earthy', color: '#059669', pattern: 'dot-matrix' },
              ].map((logo, i) => (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-xl bg-gray-800/50 flex items-center justify-center border border-gray-700/50 hover:border-violet-500/50 transition-colors">
                    <DemoIcon color={logo.color} index={i} />
                  </div>
                  <span className="text-xs text-gray-500">{logo.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoIcon({ color, index }: { color: string; index: number }) {
  const icons = [
    // Node network
    <svg key={0} viewBox="0 0 100 100" className="w-10 h-10">
      <g stroke={color} strokeWidth="2" fill="none">
        <path d="M 30 70 Q 50 70, 50 50 Q 50 30, 70 30" />
        <circle cx="30" cy="70" r="5" fill={color} />
        <circle cx="50" cy="50" r="6" fill={color} />
        <circle cx="70" cy="30" r="5" fill={color} />
      </g>
    </svg>,
    // Geometric
    <svg key={1} viewBox="0 0 100 100" className="w-10 h-10">
      <g fill="none" stroke={color} strokeWidth="2">
        <circle cx="40" cy="50" r="20" />
        <circle cx="60" cy="50" r="20" />
        <circle cx="50" cy="35" r="20" />
      </g>
    </svg>,
    // Waves
    <svg key={2} viewBox="0 0 100 100" className="w-10 h-10">
      <g fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <path d="M 15 50 Q 32 30, 50 50 T 85 50" />
        <path d="M 15 50 Q 32 40, 50 50 T 85 50" opacity="0.5" transform="translate(0,-8)" />
        <path d="M 15 50 Q 32 44, 50 50 T 85 50" opacity="0.3" transform="translate(0,8)" />
      </g>
    </svg>,
    // Dots
    <svg key={3} viewBox="0 0 100 100" className="w-10 h-10">
      <g fill={color}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (2 * Math.PI * i) / 6 - Math.PI / 2;
          return <circle key={i} cx={50 + 15 * Math.cos(angle)} cy={50 + 15 * Math.sin(angle)} r="4" />;
        })}
        <circle cx="50" cy="50" r="3" />
      </g>
    </svg>,
  ];
  return icons[index] || icons[0];
}
