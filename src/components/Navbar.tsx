'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLang } from '@/context/LanguageContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, setLang, t } = useLang();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              LixStudio
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm text-gray-300 hover:text-white transition-colors">
              {t('nav_home')}
            </Link>
            <Link href="/generator" className="text-sm text-gray-300 hover:text-white transition-colors">
              {t('nav_generator')}
            </Link>
            <a href="#pricing" className="text-sm text-gray-300 hover:text-white transition-colors">
              {t('nav_pricing')}
            </a>
            <a href="#faq" className="text-sm text-gray-300 hover:text-white transition-colors">
              {t('nav_faq')}
            </a>

            {/* Language switcher */}
            <button
              onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-700 text-sm text-gray-300 hover:bg-gray-800/50 hover:border-gray-600 transition-all"
              title={lang === 'id' ? 'Switch to English' : 'Ganti ke Indonesia'}
            >
              <span className="text-base">{lang === 'id' ? '🇮🇩' : '🇬🇧'}</span>
              <span className="text-xs font-medium">{lang === 'id' ? 'ID' : 'EN'}</span>
            </button>

            <Link
              href="/generator"
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/25"
            >
              {t('nav_cta')}
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile language switcher */}
            <button
              onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
              className="p-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800/50"
            >
              <span className="text-base">{lang === 'id' ? '🇮🇩' : '🇬🇧'}</span>
            </button>

            <button
              className="text-gray-300 hover:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-gray-950/95 backdrop-blur-xl border-t border-gray-800/50">
          <div className="px-4 py-4 space-y-3">
            <Link href="/" className="block text-gray-300 hover:text-white py-2" onClick={() => setMobileOpen(false)}>{t('nav_home')}</Link>
            <Link href="/generator" className="block text-gray-300 hover:text-white py-2" onClick={() => setMobileOpen(false)}>{t('nav_generator')}</Link>
            <Link href="/generator" className="block px-4 py-2 bg-violet-600 text-white rounded-lg text-center font-medium" onClick={() => setMobileOpen(false)}>{t('nav_cta')}</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
