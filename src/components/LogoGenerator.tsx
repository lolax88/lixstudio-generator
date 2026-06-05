'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Industry, LogoVariant, ColorPalette, DesignPattern, LogoConfig } from '@/lib/types';
import { generateLogo, downloadSvg, downloadPng } from '@/lib/logoGenerator';
import { ALL_PALETTES, getPaletteForIndustry } from '@/lib/colorPalettes';
import { INDUSTRIES } from '@/lib/industries';
import { ALL_PATTERNS } from '@/lib/patterns';
import LogoPreview from './LogoPreview';
import { useLang } from '@/context/LanguageContext';
import { TranslationKey } from '@/lib/i18n';
import { trackEvent } from './MetaPixel';

// 6 styles from Nutlope/logocreator
type AiStyle = 'tech' | 'flashy' | 'modern' | 'playful' | 'abstract' | 'minimal';

// SVG styles for free mode
type SvgStyle = 'minimal' | 'modern' | 'playful' | 'elegant' | 'bold';

// Color presets for AI mode
const PRIMARY_COLORS = [
  { name: 'Blue', hex: '#0F6FFF' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Green', hex: '#00FF00' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Purple', hex: '#7C3AED' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Teal', hex: '#14B8A6' },
];

const BACKGROUND_COLORS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Light Gray', hex: '#F3F4F6' },
  { name: 'Dark Gray', hex: '#374151' },
  { name: 'Black', hex: '#000000' },
  { name: 'Navy', hex: '#1E293B' },
  { name: 'Cream', hex: '#FEF3C7' },
];

type GenerationMode = 'free' | 'premium';

// UMKM example presets (brand names stay as-is — they're proper nouns)
const UMKM_EXAMPLES = [
  { name: 'Warung Kopi', industry: 'cafe' as Industry, icon: '☕', color: '#8B4513' },
  { name: 'Villa Bali', industry: 'bali_tourism' as Industry, icon: '🌴', color: '#10B981' },
  { name: 'Rental Motor', industry: 'tech' as Industry, icon: '🛵', color: '#0F6FFF' },
];

export default function LogoGenerator() {
  const { t, lang } = useLang();

  const [brandName, setBrandName] = useState('');
  const [industry, setIndustry] = useState<Industry>('tech');
  const [svgStyle, setSvgStyle] = useState<SvgStyle>('modern');
  const [aiStyle, setAiStyle] = useState<AiStyle>('modern');
  const [variant, setVariant] = useState<LogoVariant>('icon-only');
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette>(getPaletteForIndustry('tech'));
  const [selectedPattern, setSelectedPattern] = useState<DesignPattern>('node-network');
  const [mode, setMode] = useState<GenerationMode>('free');

  // BYOK: User's API keys (persisted in localStorage)
  const [userAPIKey, setUserAPIKey] = useState('');
  const [userHFKey, setUserHFKey] = useState('');
  const [userGoogleKey, setUserGoogleKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showHFKey, setShowHFKey] = useState(false);
  const [showGoogleKey, setShowGoogleKey] = useState(false);

  // AI color picker
  const [primaryColor, setPrimaryColor] = useState('#7C3AED');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [additionalInfo, setAdditionalInfo] = useState('');

  // AI state
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Derived translations
  const VARIANTS: { id: LogoVariant; label: string; desc: string }[] = useMemo(() => [
    { id: 'icon-only', label: t('var_icon'), desc: t('var_icon_desc') },
    { id: 'wordmark', label: t('var_wordmark'), desc: t('var_wordmark_desc') },
    { id: 'stacked', label: t('var_stacked'), desc: t('var_stacked_desc') },
    { id: 'horizontal', label: t('var_horizontal'), desc: t('var_horizontal_desc') },
  ], [t]);

  const SVG_STYLES: { id: SvgStyle; label: string; icon: string }[] = useMemo(() => [
    { id: 'minimal', label: t('style_minimal'), icon: '◇' },
    { id: 'modern', label: t('style_modern'), icon: '⬡' },
    { id: 'playful', label: t('style_playful'), icon: '◈' },
    { id: 'elegant', label: t('style_elegant'), icon: '◆' },
    { id: 'bold', label: t('style_bold'), icon: '■' },
  ], [t]);

  const AI_STYLES: { id: AiStyle; label: string; desc: string }[] = useMemo(() => [
    { id: 'tech', label: t('ai_tech'), desc: t('ai_tech_desc') },
    { id: 'flashy', label: t('ai_flashy'), desc: t('ai_flashy_desc') },
    { id: 'modern', label: t('ai_modern'), desc: t('ai_modern_desc') },
    { id: 'playful', label: t('ai_playful'), desc: t('ai_playful_desc') },
    { id: 'abstract', label: t('ai_abstract'), desc: t('ai_abstract_desc') },
    { id: 'minimal', label: t('ai_minimal'), desc: t('ai_minimal_desc') },
  ], [t]);

  const SIMPLE_PATTERN_NAMES: Record<DesignPattern, string> = useMemo(() => ({
    'dot-matrix': t('pat_dot_matrix'),
    'geometric-shapes': t('pat_geometric'),
    'line-system': t('pat_line_system'),
    'node-network': t('pat_node_network'),
    'dots-shapes': t('pat_dots_shapes'),
    'dots-lines': t('pat_dots_lines'),
    'shapes-lines': t('pat_shapes_lines'),
  }), [t]);

  // Load API keys from localStorage on mount
  useEffect(() => {
    const savedTogether = localStorage.getItem('lixstudio-api-key');
    const savedHF = localStorage.getItem('lixstudio-hf-key');
    const savedGoogle = localStorage.getItem('lixstudio-google-key');
    if (savedTogether) setUserAPIKey(savedTogether);
    if (savedHF) setUserHFKey(savedHF);
    if (savedGoogle) setUserGoogleKey(savedGoogle);
  }, []);

  // Save API keys to localStorage
  const handleApiKeyChange = useCallback((val: string) => {
    setUserAPIKey(val);
    localStorage.setItem('lixstudio-api-key', val);
  }, []);

  const handleHFKeyChange = useCallback((val: string) => {
    setUserHFKey(val);
    localStorage.setItem('lixstudio-hf-key', val);
  }, []);

  const handleGoogleKeyChange = useCallback((val: string) => {
    setUserGoogleKey(val);
    localStorage.setItem('lixstudio-google-key', val);
  }, []);

  // Update palette when industry changes
  useEffect(() => {
    setSelectedPalette(getPaletteForIndustry(industry));
    const ind = INDUSTRIES.find(i => i.id === industry);
    if (ind && ind.suggestedPatterns.length > 0) {
      setSelectedPattern(ind.suggestedPatterns[0]);
    }
  }, [industry]);

  // SVG logo config
  const config: LogoConfig = useMemo(() => ({
    brandName: brandName || 'Brand',
    industry,
    colorPalette: selectedPalette,
    style: svgStyle,
    variant,
    pattern: selectedPattern,
  }), [brandName, industry, selectedPalette, svgStyle, variant, selectedPattern]);

  const svgContent = useMemo(() => generateLogo(config), [config]);

  const allVariants = useMemo(() => {
    return VARIANTS.map(v => ({
      ...v,
      svg: generateLogo({ ...config, variant: v.id }),
    }));
  }, [config, VARIANTS]);

  // AI generation
  const handleAiGenerate = useCallback(async () => {
    setAiLoading(true);
    setAiError(null);
    setAiImage(null);

    try {
      const res = await fetch('/api/generate-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAPIKey: userAPIKey || undefined,
          userHFKey: userHFKey || undefined,
          userGoogleKey: userGoogleKey || undefined,
          brandName: brandName || 'Brand',
          industry,
          style: aiStyle,
          primaryColor,
          backgroundColor,
          additionalInfo,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAiError(data.error || 'Generation failed');
        return;
      }

      setAiImage(data.image);
      trackEvent('Purchase', { content_name: 'AI Logo', brand: brandName || 'Brand' });
    } catch {
      setAiError('Network error. Please try again.');
    } finally {
      setAiLoading(false);
    }
  }, [brandName, industry, aiStyle, primaryColor, backgroundColor, additionalInfo, userAPIKey]);

  const handleDownloadAi = useCallback(() => {
    if (!aiImage) return;
    const a = document.createElement('a');
    a.href = aiImage;
    a.download = `${brandName || 'logo'}-ai.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [aiImage, brandName]);

  const handleDownloadSvg = useCallback(() => {
    downloadSvg(svgContent, `${brandName || 'logo'}-${variant}`);
    trackEvent('Download', { content_name: 'SVG', brand: brandName || 'Brand' });
  }, [svgContent, brandName, variant]);

  const handleDownloadPng = useCallback(() => {
    downloadPng(svgContent, `${brandName || 'logo'}-${variant}`);
    trackEvent('Download', { content_name: 'PNG', brand: brandName || 'Brand' });
  }, [svgContent, brandName, variant]);

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{t('gen_logo_generator')}</h1>
          <p className="text-gray-400 mb-4">{t('gen_free_subtitle')}</p>

          {/* Free Logo Generator Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-medium text-emerald-300">{t('gen_free_badge')}</span>
          </div>

          {/* Mode Toggle */}
          <div className="mt-5 inline-flex items-center gap-1 p-1 bg-gray-900/80 rounded-xl border border-gray-800/50">
            <button
              onClick={() => setMode('free')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'free'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {t('gen_free_tab')}
            </button>
            <button
              onClick={() => setMode('premium')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'premium'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/25'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {t('gen_premium_tab')}
            </button>
          </div>
        </div>

        {/* UMKM Quick Examples */}
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          <span className="text-sm text-gray-500 self-center">{t('gen_examples')}</span>
          {UMKM_EXAMPLES.map(ex => (
            <button
              key={ex.name}
              onClick={() => {
                setBrandName(ex.name);
                setIndustry(ex.industry);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900/60 border border-gray-800/50 rounded-xl text-sm text-gray-300 hover:bg-gray-800/60 hover:text-white transition-all"
            >
              <span>{ex.icon}</span>
              <span>{ex.name}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ===== Unified Controls Panel ===== */}
          <div className="lg:col-span-4">
            <div className="bg-gray-900/50 rounded-2xl border border-gray-800/50 p-6 space-y-6">
              <h2 className="text-lg font-semibold text-white">{t('gen_settings')}</h2>

              {/* Brand Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('gen_brand_name')}</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={e => setBrandName(e.target.value)}
                  placeholder={t('gen_brand_placeholder')}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
                  maxLength={30}
                />
              </div>

              {/* Industry */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('gen_industry')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {INDUSTRIES.map(ind => (
                    <button
                      key={ind.id}
                      onClick={() => setIndustry(ind.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all ${
                        industry === ind.id
                          ? 'bg-violet-600/20 border border-violet-500/50 text-violet-300'
                          : 'bg-gray-800/30 border border-gray-700/30 text-gray-400 hover:bg-gray-800/50 hover:text-gray-300'
                      }`}
                    >
                      <span>{ind.icon}</span>
                      <span className="truncate">{ind.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('gen_layout')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {VARIANTS.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setVariant(v.id)}
                      className={`px-3 py-2.5 rounded-xl text-sm transition-all ${
                        variant === v.id
                          ? 'bg-violet-600/20 border border-violet-500/50 text-violet-300'
                          : 'bg-gray-800/30 border border-gray-700/30 text-gray-400 hover:bg-gray-800/50'
                      }`}
                    >
                      <div className="font-medium">{v.label}</div>
                      <div className="text-xs text-gray-500">{v.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Style — different for Free vs Premium */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('gen_style')}</label>
                {mode === 'free' ? (
                  <div className="flex gap-2">
                    {SVG_STYLES.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSvgStyle(s.id)}
                        className={`flex-1 flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-xs transition-all ${
                          svgStyle === s.id
                            ? 'bg-violet-600/20 border border-violet-500/50 text-violet-300'
                            : 'bg-gray-800/30 border border-gray-700/30 text-gray-400 hover:bg-gray-800/50'
                        }`}
                      >
                        <span className="text-lg">{s.icon}</span>
                        <span>{s.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {AI_STYLES.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setAiStyle(s.id)}
                        className={`px-3 py-2.5 rounded-xl text-sm transition-all ${
                          aiStyle === s.id
                            ? 'bg-orange-600/20 border border-orange-500/50 text-orange-300'
                            : 'bg-gray-800/30 border border-gray-700/30 text-gray-400 hover:bg-gray-800/50'
                        }`}
                      >
                        <div className="font-medium">{s.label}</div>
                        <div className="text-xs text-gray-500">{s.desc}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Color — different for Free vs Premium */}
              {mode === 'free' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('gen_color')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {ALL_PALETTES.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPalette(p)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all ${
                          selectedPalette.id === p.id
                            ? 'bg-violet-600/20 border border-violet-500/50 text-white'
                            : 'bg-gray-800/30 border border-gray-700/30 text-gray-400 hover:bg-gray-800/50'
                        }`}
                      >
                        <div className="flex gap-0.5">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.primary }} />
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.secondary }} />
                        </div>
                        <span className="text-xs">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('gen_color')}</label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Primary Color */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">{t('gen_primary_color')}</label>
                      <div className="grid grid-cols-4 gap-1.5 mb-2">
                        {PRIMARY_COLORS.map(c => (
                          <button
                            key={c.hex}
                            onClick={() => setPrimaryColor(c.hex)}
                            className={`w-full aspect-square rounded-lg border-2 transition-all ${
                              primaryColor === c.hex ? 'border-orange-400 scale-110' : 'border-gray-700/50'
                            }`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={e => setPrimaryColor(e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={primaryColor}
                          onChange={e => setPrimaryColor(e.target.value)}
                          className="flex-1 px-2 py-1 bg-gray-800/50 border border-gray-700/50 rounded text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    {/* Background Color */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">{t('gen_bg_color')}</label>
                      <div className="grid grid-cols-3 gap-1.5 mb-2">
                        {BACKGROUND_COLORS.map(c => (
                          <button
                            key={c.hex}
                            onClick={() => setBackgroundColor(c.hex)}
                            className={`w-full aspect-square rounded-lg border-2 transition-all ${
                              backgroundColor === c.hex ? 'border-orange-400 scale-110' : 'border-gray-700/50'
                            }`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={e => setBackgroundColor(e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={backgroundColor}
                          onChange={e => setBackgroundColor(e.target.value)}
                          className="flex-1 px-2 py-1 bg-gray-800/50 border border-gray-700/50 rounded text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pattern — Free mode only */}
              {mode === 'free' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('gen_pattern')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ALL_PATTERNS.map(p => (
                      <button
                        key={p}
                        onClick={() => setSelectedPattern(p)}
                        className={`px-3 py-2.5 rounded-xl text-sm transition-all ${
                          selectedPattern === p
                            ? 'bg-violet-600/20 border border-violet-500/50 text-violet-300'
                            : 'bg-gray-800/30 border border-gray-700/30 text-gray-400 hover:bg-gray-800/50'
                        }`}
                      >
                        {SIMPLE_PATTERN_NAMES[p]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info — Premium mode only */}
              {mode === 'premium' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('gen_desc_label')} <span className="text-gray-500">({t('gen_optional')})</span>
                  </label>
                  <textarea
                    value={additionalInfo}
                    onChange={e => setAdditionalInfo(e.target.value)}
                    placeholder={t('gen_desc_placeholder')}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all resize-none"
                    rows={3}
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">{additionalInfo.length}/200</p>
                </div>
              )}

              {/* BYOK: API Keys (Premium mode only) */}
              {mode === 'premium' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    {t('gen_api_keys')}
                    <span className="ml-2 text-xs text-gray-500">{t('gen_api_optional')}</span>
                  </label>

                  {/* Hugging Face Key (FREE) */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-medium text-green-400">{t('gen_hf_label')}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-300 rounded-full">{t('gen_hf_free')}</span>
                    </div>
                    <div className="relative">
                      <input
                        type={showHFKey ? 'text' : 'password'}
                        value={userHFKey}
                        onChange={e => handleHFKeyChange(e.target.value)}
                        placeholder="hf_xxxxxxxx"
                        className="w-full px-4 py-2.5 pr-10 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all text-sm"
                      />
                      <button type="button" onClick={() => setShowHFKey(!showHFKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                        {showHFKey ? '🙈' : '👁️'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('gen_hf_help')}{' '}
                      <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener" className="text-green-400 hover:underline">
                        huggingface.co/settings/tokens
                      </a>
                    </p>
                  </div>

                  {/* Together AI Key (Paid, $5 free credit) */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-medium text-orange-400">{t('gen_together_label')}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-orange-500/20 text-orange-300 rounded-full">{t('gen_together_free')}</span>
                    </div>
                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={userAPIKey}
                        onChange={e => handleApiKeyChange(e.target.value)}
                        placeholder="key_xxxxxxxx"
                        className="w-full px-4 py-2.5 pr-10 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all text-sm"
                      />
                      <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                        {showApiKey ? '🙈' : '👁️'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('gen_together_help')}{' '}
                      <a href="https://api.together.xyz" target="_blank" rel="noopener" className="text-orange-400 hover:underline">
                        api.together.xyz
                      </a>
                    </p>
                  </div>

                  {/* Google AI Studio Key (FREE) */}
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-medium text-blue-400">{t('gen_google_label')}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded-full">{t('gen_google_free')}</span>
                    </div>
                    <div className="relative">
                      <input
                        type={showGoogleKey ? 'text' : 'password'}
                        value={userGoogleKey}
                        onChange={e => handleGoogleKeyChange(e.target.value)}
                        placeholder="AIzaSyxxxxxxx"
                        className="w-full px-4 py-2.5 pr-10 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all text-sm"
                      />
                      <button type="button" onClick={() => setShowGoogleKey(!showGoogleKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                        {showGoogleKey ? '🙈' : '👁️'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('gen_google_help')}{' '}
                      <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" className="text-blue-400 hover:underline">
                        aistudio.google.com/apikey
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ===== Preview Panel (bigger) ===== */}
          <div className="lg:col-span-8 space-y-6">
            {mode === 'free' ? (
              <>
                {/* SVG Preview — Bigger */}
                <div className="bg-gray-900/50 rounded-2xl border border-gray-800/50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{t('gen_preview')}</h3>
                    <div className="flex gap-3">
                      <button onClick={handleDownloadSvg} className="flex items-center gap-2 px-5 py-2.5 bg-violet-600/20 border border-violet-500/30 rounded-xl text-sm font-medium text-violet-300 hover:bg-violet-600/30 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3" /></svg>
                        {t('gen_download_svg')}
                      </button>
                      <button onClick={handleDownloadPng} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/25">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3" /></svg>
                        {t('gen_download_png')}
                      </button>
                    </div>
                  </div>

                  {/* Big preview area */}
                  <div className="flex items-center justify-center p-10 bg-gray-950/50 rounded-xl border border-gray-800/30 min-h-[420px]">
                    <LogoPreview svgContent={svgContent} size={380} />
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    {VARIANTS.find(v => v.id === variant)?.desc} • {SIMPLE_PATTERN_NAMES[selectedPattern]} • {svgStyle}
                  </p>
                </div>

                {/* All Variants */}
                <div className="bg-gray-900/50 rounded-2xl border border-gray-800/50 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">{t('gen_all_variants')}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {allVariants.map((v, i) => (
                      <button key={i} onClick={() => setVariant(v.id as LogoVariant)} className={`p-4 rounded-xl border transition-all ${variant === v.id ? 'border-violet-500/50 bg-violet-500/10' : 'border-gray-700/30 bg-gray-800/20 hover:border-gray-600/50'}`}>
                        <div className="flex items-center justify-center mb-2 h-24"><LogoPreview svgContent={v.svg} size={100} /></div>
                        <span className="text-xs text-gray-400">{v.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Download all */}
                <div className="bg-gray-900/50 rounded-2xl border border-gray-800/50 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-white">{t('gen_download_all_title')}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{t('gen_download_all_desc')}</p>
                    </div>
                    <button onClick={() => allVariants.forEach(v => downloadSvg(v.svg, `${brandName || 'logo'}-${v.id}`))} className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/25">
                      {t('gen_download_all_btn')}
                    </button>
                  </div>
                </div>

                {/* Portfolio CTA */}
                <a
                  href="https://lixstudio.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gray-900/50 rounded-2xl border border-gray-800/50 p-5 flex items-center justify-between hover:border-violet-500/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-2xl group-hover:bg-violet-500/20 transition-colors">
                      🎨
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">
                        {lang === 'id' ? 'Lihat 20+ Contoh Logo Profesional' : 'See 20+ Professional Logo Examples'}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {lang === 'id' ? 'Dari klien kami — warung kopi, villa, rental motor, dan lainnya' : 'From our clients — coffee shops, villas, motor rentals, and more'}
                      </p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </>
            ) : (
              /* Premium AI Preview */
              <div className="bg-gray-900/50 rounded-2xl border border-gray-800/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{t('gen_ai_logo')}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{t('gen_ai_desc')}</p>
                  </div>
                  {aiImage && (
                    <button onClick={handleDownloadAi} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-orange-500/25">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3" /></svg>
                      {t('gen_ai_download')}
                    </button>
                  )}
                </div>

                <button onClick={handleAiGenerate} disabled={aiLoading} className="w-full mb-6 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed">
                  {aiLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      {t('gen_ai_loading')}
                    </span>
                  ) : (
                    t('gen_ai_btn')
                  )}
                </button>

                {/* Big preview area */}
                <div className="flex items-center justify-center p-10 bg-gray-950/50 rounded-xl border border-gray-800/30 min-h-[480px]">
                  {aiLoading ? (
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-6 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                      <p className="text-white text-lg font-medium mb-2">{t('gen_ai_loading_title')}</p>
                      <p className="text-gray-400 text-sm">{t('gen_ai_loading_desc')}</p>
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                        <span className="text-orange-300 text-sm">{t('gen_ai_generating')}</span>
                      </div>
                    </div>
                  ) : aiImage ? (
                    <img src={aiImage} alt="AI Generated Logo" className="max-w-full max-h-[450px] rounded-lg shadow-2xl" />
                  ) : aiError ? (
                    <div className="text-center">
                      <p className="text-red-400 text-sm mb-2">⚠️ {aiError}</p>
                      <button onClick={handleAiGenerate} className="text-sm text-orange-300 hover:text-orange-200 underline">{t('gen_ai_retry')}</button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎨</div>
                      <p className="text-gray-400 text-lg mb-2">{t('gen_ai_empty_title')}</p>
                      <p className="text-orange-300 text-lg font-medium">{t('gen_ai_empty_btn')}</p>
                    </div>
                  )}
                </div>

                {aiImage && (
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    {aiStyle} • {primaryColor} on {backgroundColor} • 1024×1024 PNG • Powered by Flux Pro
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
