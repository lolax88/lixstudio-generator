'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Industry, LogoStyle, LogoVariant, ColorPalette, DesignPattern, LogoConfig } from '@/lib/types';
import { generateLogo, downloadSvg, downloadPng } from '@/lib/logoGenerator';
import { ALL_PALETTES, getPaletteForIndustry } from '@/lib/colorPalettes';
import { INDUSTRIES } from '@/lib/industries';
import { ALL_PATTERNS, getPatternName } from '@/lib/patterns';
import LogoPreview from './LogoPreview';

const VARIANTS: { id: LogoVariant; label: string; desc: string }[] = [
  { id: 'icon-only', label: 'Icon', desc: 'Standalone mark' },
  { id: 'wordmark', label: 'Wordmark', desc: 'Icon + name' },
  { id: 'stacked', label: 'Stacked', desc: 'Vertical layout' },
  { id: 'horizontal', label: 'Horizontal', desc: 'Side by side' },
];

const STYLES: { id: LogoStyle; label: string; icon: string }[] = [
  { id: 'minimal', label: 'Minimal', icon: '◇' },
  { id: 'modern', label: 'Modern', icon: '⬡' },
  { id: 'playful', label: 'Playful', icon: '◈' },
  { id: 'elegant', label: 'Elegant', icon: '◆' },
  { id: 'bold', label: 'Bold', icon: '■' },
];

type GenerationMode = 'free' | 'premium';

export default function LogoGenerator() {
  const [brandName, setBrandName] = useState('LixStudio');
  const [industry, setIndustry] = useState<Industry>('tech');
  const [style, setStyle] = useState<LogoStyle>('modern');
  const [variant, setVariant] = useState<LogoVariant>('icon-only');
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette>(getPaletteForIndustry('tech'));
  const [selectedPattern, setSelectedPattern] = useState<DesignPattern>('node-network');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [mode, setMode] = useState<GenerationMode>('free');
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Update palette when industry changes
  useEffect(() => {
    setSelectedPalette(getPaletteForIndustry(industry));
    const ind = INDUSTRIES.find(i => i.id === industry);
    if (ind && ind.suggestedPatterns.length > 0) {
      setSelectedPattern(ind.suggestedPatterns[0]);
    }
  }, [industry]);

  // Generate logo config
  const config: LogoConfig = useMemo(() => ({
    brandName: brandName || 'Brand',
    industry,
    colorPalette: selectedPalette,
    style,
    variant,
    pattern: selectedPattern,
  }), [brandName, industry, selectedPalette, style, variant, selectedPattern]);

  // Generate SVG
  const svgContent = useMemo(() => generateLogo(config), [config]);

  // Generate all variants
  const allVariants = useMemo(() => {
    return VARIANTS.map(v => ({
      ...v,
      svg: generateLogo({ ...config, variant: v.id }),
    }));
  }, [config]);

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
          brandName: brandName || 'Brand',
          industry,
          style,
          primaryColor: selectedPalette.primary,
          secondaryColor: selectedPalette.secondary,
          additionalInfo,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAiError(data.error || 'Generation failed');
        return;
      }

      setAiImage(data.image);
    } catch {
      setAiError('Network error. Please try again.');
    } finally {
      setAiLoading(false);
    }
  }, [brandName, industry, style, selectedPalette, additionalInfo]);

  // Download AI image
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
  }, [svgContent, brandName, variant]);

  const handleDownloadPng = useCallback(() => {
    downloadPng(svgContent, `${brandName || 'logo'}-${variant}`);
  }, [svgContent, brandName, variant]);

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Logo Generator</h1>
          <p className="text-gray-400">Design your perfect logo in seconds</p>

          {/* Mode Toggle */}
          <div className="mt-6 inline-flex items-center gap-1 p-1 bg-gray-900/80 rounded-xl border border-gray-800/50">
            <button
              onClick={() => setMode('free')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'free'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              ✨ Free — SVG
            </button>
            <button
              onClick={() => setMode('premium')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'premium'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/25'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              🔥 Premium — AI
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-5 space-y-6">
            {/* Brand Name */}
            <div className="bg-gray-900/50 rounded-2xl border border-gray-800/50 p-5">
              <label className="block text-sm font-medium text-gray-300 mb-2">Brand Name</label>
              <input
                type="text"
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                placeholder="Enter your brand name"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
                maxLength={30}
              />
            </div>

            {/* Industry */}
            <div className="bg-gray-900/50 rounded-2xl border border-gray-800/50 p-5">
              <label className="block text-sm font-medium text-gray-300 mb-3">Industry</label>
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

            {/* Style */}
            <div className="bg-gray-900/50 rounded-2xl border border-gray-800/50 p-5">
              <label className="block text-sm font-medium text-gray-300 mb-3">Style</label>
              <div className="flex gap-2">
                {STYLES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`flex-1 flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-xs transition-all ${
                      style === s.id
                        ? 'bg-violet-600/20 border border-violet-500/50 text-violet-300'
                        : 'bg-gray-800/30 border border-gray-700/30 text-gray-400 hover:bg-gray-800/50'
                    }`}
                  >
                    <span className="text-lg">{s.icon}</span>
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Palette */}
            <div className="bg-gray-900/50 rounded-2xl border border-gray-800/50 p-5">
              <label className="block text-sm font-medium text-gray-300 mb-3">Color Palette</label>
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

            {/* Pattern — only show in Free mode */}
            {mode === 'free' && (
              <div className="bg-gray-900/50 rounded-2xl border border-gray-800/50 p-5">
                <label className="block text-sm font-medium text-gray-300 mb-3">Design Pattern</label>
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
                      {getPatternName(p)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info — only show in Premium mode */}
            {mode === 'premium' && (
              <div className="bg-gray-900/50 rounded-2xl border border-gray-800/50 p-5">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Additional Info <span className="text-gray-500">(optional)</span>
                </label>
                <textarea
                  value={additionalInfo}
                  onChange={e => setAdditionalInfo(e.target.value)}
                  placeholder="e.g. Include a coffee cup icon, use serif font, make it feel premium..."
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all resize-none"
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">{additionalInfo.length}/200</p>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-7 space-y-6">
            {mode === 'free' ? (
              <>
                {/* SVG Preview */}
                <div className="bg-gray-900/50 rounded-2xl border border-gray-800/50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Preview</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDownloadSvg}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600/20 border border-violet-500/30 rounded-lg text-sm text-violet-300 hover:bg-violet-600/30 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3" />
                        </svg>
                        SVG
                      </button>
                      <button
                        onClick={handleDownloadPng}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600/20 border border-violet-500/30 rounded-lg text-sm text-violet-300 hover:bg-violet-600/30 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3" />
                        </svg>
                        PNG
                      </button>
                    </div>
                  </div>

                  {/* Variant selector */}
                  <div className="flex gap-2 mb-6">
                    {VARIANTS.map(v => (
                      <button
                        key={v.id}
                        onClick={() => setVariant(v.id)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
                          variant === v.id
                            ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>

                  {/* Preview area */}
                  <div className="flex items-center justify-center p-8 bg-gray-950/50 rounded-xl border border-gray-800/30 min-h-[300px]">
                    <LogoPreview svgContent={svgContent} size={280} />
                  </div>

                  <p className="text-xs text-gray-500 mt-3 text-center">
                    {VARIANTS.find(v => v.id === variant)?.desc} • {getPatternName(selectedPattern)} • {style}
                  </p>
                </div>

                {/* All Variants */}
                <div className="bg-gray-900/50 rounded-2xl border border-gray-800/50 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">All Variants</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {allVariants.map((v, i) => (
                      <button
                        key={i}
                        onClick={() => setVariant(v.id as LogoVariant)}
                        className={`p-4 rounded-xl border transition-all ${
                          variant === v.id
                            ? 'border-violet-500/50 bg-violet-500/10'
                            : 'border-gray-700/30 bg-gray-800/20 hover:border-gray-600/50'
                        }`}
                      >
                        <div className="flex items-center justify-center mb-2 h-24">
                          <LogoPreview svgContent={v.svg} size={100} />
                        </div>
                        <span className="text-xs text-gray-400">{v.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Download all */}
                <div className="bg-gray-900/50 rounded-2xl border border-gray-800/50 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-white">Download All Variants</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Get all 4 layouts as SVG files</p>
                    </div>
                    <button
                      onClick={() => {
                        allVariants.forEach(v => {
                          downloadSvg(v.svg, `${brandName || 'logo'}-${v.id}`);
                        });
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/25"
                    >
                      Download All
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Premium AI Preview */
              <div className="bg-gray-900/50 rounded-2xl border border-gray-800/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">AI-Generated Logo</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Powered by Flux Pro — photorealistic, unique designs</p>
                  </div>
                  {aiImage && (
                    <button
                      onClick={handleDownloadAi}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600/20 border border-orange-500/30 rounded-lg text-sm text-orange-300 hover:bg-orange-600/30 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3" />
                      </svg>
                      Download PNG
                    </button>
                  )}
                </div>

                {/* Generate button */}
                <button
                  onClick={handleAiGenerate}
                  disabled={aiLoading}
                  className="w-full mb-6 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generating with AI...
                    </span>
                  ) : (
                    '🔥 Generate AI Logo'
                  )}
                </button>

                {/* Preview area */}
                <div className="flex items-center justify-center p-8 bg-gray-950/50 rounded-xl border border-gray-800/30 min-h-[400px]">
                  {aiLoading ? (
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                      <p className="text-gray-400 text-sm">AI is crafting your logo...</p>
                      <p className="text-gray-500 text-xs mt-1">This may take 10-20 seconds</p>
                    </div>
                  ) : aiImage ? (
                    <img
                      src={aiImage}
                      alt="AI Generated Logo"
                      className="max-w-full max-h-[400px] rounded-lg shadow-2xl"
                    />
                  ) : aiError ? (
                    <div className="text-center">
                      <p className="text-red-400 text-sm mb-2">⚠️ {aiError}</p>
                      <button
                        onClick={handleAiGenerate}
                        className="text-sm text-orange-300 hover:text-orange-200 underline"
                      >
                        Try again
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-5xl mb-4">🎨</div>
                      <p className="text-gray-400 text-sm">
                        Configure your brand settings, then click
                      </p>
                      <p className="text-orange-300 text-sm font-medium mt-1">
                        &quot;Generate AI Logo&quot;
                      </p>
                    </div>
                  )}
                </div>

                {aiImage && (
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    {style} • {selectedPalette.name} • 1024×1024 PNG • Powered by Flux Pro
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
