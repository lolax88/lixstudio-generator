'use client';

import { useState, useCallback, useRef, Suspense, lazy, Component, type ReactNode, type ErrorInfo } from 'react';
import type { RenderMode, BgType, MaterialPreset } from '@/components/SVGToThree';
import { MATERIAL_PRESETS } from '@/components/SVGToThree';

// Lazy load Three.js component
const SVGToThree = lazy(() => import('@/components/SVGToThree'));

// Error Boundary
class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error('3D Converter Error:', error, errorInfo); }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function Loading3D() {
  return (
    <div className="w-full h-[400px] bg-slate-900/50 rounded-2xl border border-slate-700/50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-pulse">🧊</div>
        <p className="text-slate-400 text-sm">Memuat 3D engine...</p>
      </div>
    </div>
  );
}

function Error3D({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="w-full h-[400px] bg-slate-900/50 rounded-2xl border border-red-500/30 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="text-4xl mb-3">😵</div>
        <p className="text-red-400 font-semibold mb-2">3D engine gagal dimuat</p>
        <button onClick={onRetry} className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-500 transition-all">
          🔄 Coba Lagi
        </button>
      </div>
    </div>
  );
}

function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('webgl2'));
  } catch { return false; }
}

// Collapsible section component
function Section({ title, icon, defaultOpen = false, children }: {
  title: string; icon: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-700/50 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 px-1 text-sm font-medium text-slate-300 hover:text-white transition-colors"
      >
        <span>{icon} {title}</span>
        <span className={`text-xs transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && <div className="pb-3 px-1 space-y-3">{children}</div>}
    </div>
  );
}

export default function ThreeDConverterPage() {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [depth, setDepth] = useState(40);
  const [bevelEnabled, setBevelEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'svg' | 'png'>('svg');
  const [pngPreview, setPngPreview] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [threeKey, setThreeKey] = useState(0);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pngInputRef = useRef<HTMLInputElement>(null);

  // === NEW: Mode & Material & Lighting & Background state ===
  const [renderMode, setRenderMode] = useState<RenderMode>('smart');
  const [selectedPreset, setSelectedPreset] = useState<MaterialPreset>(MATERIAL_PRESETS[0]);
  const [customColor, setCustomColor] = useState('#8B5CF6');
  const [metalness, setMetalness] = useState(0.1);
  const [roughness, setRoughness] = useState(0.4);
  const [lightIntensity, setLightIntensity] = useState(1.5);
  const [lightColor, setLightColor] = useState('#ffffff');
  const [bgType, setBgType] = useState<BgType>('gradient');
  const [bgColor1, setBgColor1] = useState('#1a1a2e');
  const [bgColor2, setBgColor2] = useState('#16213e');
  const [bgAngle, setBgAngle] = useState(135);

  useState(() => { setWebglSupported(checkWebGLSupport()); });

  // Handle SVG upload
  const handleSVGUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => setSvgContent(event.target?.result as string);
    reader.readAsText(file);
  }, []);

  // Handle PNG upload
  const handlePNGUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsConverting(true);
    setFileName(file.name);
    const previewUrl = URL.createObjectURL(file);
    setPngPreview(previewUrl);
    try {
      const ImageTracer = (await import('imagetracerjs')).default;
      const svgStr = await new Promise<string>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout')), 30000);
        ImageTracer.imageToSVG(previewUrl, (svgString: string) => {
          clearTimeout(timeout); resolve(svgString);
        }, { pathomit: 50, qtres: 1, colorsampling: 0, numberofcolors: 4, ltres: 1, strokewidth: 1, scale: 1, roundcoords: 2, viewbox: true });
      });
      setSvgContent(svgStr);
      setActiveTab('svg');
    } catch (err) {
      console.error('PNG conversion error:', err);
      alert('Gagal convert PNG ke SVG.');
    } finally { setIsConverting(false); }
  }, []);

  // Drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => setSvgContent(event.target?.result as string);
      reader.readAsText(file);
    } else if (file.type === 'image/png' || file.name.endsWith('.png')) {
      const dt = new DataTransfer();
      dt.items.add(file);
      if (pngInputRef.current) {
        pngInputRef.current.files = dt.files;
        pngInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }, []);

  // Mode options
  const modeOptions: { value: RenderMode; label: string; desc: string }[] = [
    { value: 'smart', label: '🧠 Smart Auto', desc: 'Filled = solid, outline = edge' },
    { value: 'filled', label: '🎨 Force Filled', desc: 'Semua path jadi solid' },
    { value: 'outline', label: '✏️ Force Outline', desc: 'Semua jadi wireframe glow' },
    { value: 'wireframe', label: '🦴 Wireframe', desc: 'Pure skeleton' },
  ];

  // Background type options
  const bgOptions: { value: BgType; label: string }[] = [
    { value: 'gradient', label: '🌈 Gradient' },
    { value: 'solid', label: '⬜ Solid' },
    { value: 'transparent', label: '🔲 Transparent' },
  ];

  // Light color presets
  const lightPresets = ['#ffffff', '#ffeedd', '#ddeeff', '#ffd700', '#ff6b9d', '#8B5CF6', '#00ff88'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            🎨 <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">3D Converter</span>
          </h1>
          <p className="text-slate-400">Upload SVG atau PNG → jadi model 3D yang bisa di-download</p>
        </div>

        {/* WebGL Warning */}
        {webglSupported === false && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-2xl">
            <p className="text-red-400 text-sm">⚠️ Browser kamu gak support WebGL. Coba Chrome/Firefox terbaru.</p>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('svg')} className={`flex-1 py-3 rounded-xl font-semibold transition-all ${activeTab === 'svg' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            📐 Upload SVG
          </button>
          <button onClick={() => setActiveTab('png')} className={`flex-1 py-3 rounded-xl font-semibold transition-all ${activeTab === 'png' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            🖼️ PNG ke 3D
          </button>
        </div>

        {/* SVG Upload Tab */}
        {activeTab === 'svg' && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-600 hover:border-purple-500 rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-slate-800/50 mb-6"
          >
            <input ref={fileInputRef} type="file" accept=".svg" onChange={handleSVGUpload} className="hidden" />
            {svgContent ? (
              <div>
                <div className="text-4xl mb-2">✅</div>
                <p className="text-purple-400 font-semibold">{fileName}</p>
                <p className="text-sm text-slate-500 mt-1">Klik atau drop file lain untuk ganti</p>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-2">📐</div>
                <p className="text-slate-300 font-semibold">Drop file SVG di sini</p>
                <p className="text-sm text-slate-500 mt-1">atau klik untuk pilih file</p>
              </div>
            )}
          </div>
        )}

        {/* PNG Upload Tab */}
        {activeTab === 'png' && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => pngInputRef.current?.click()}
            className="border-2 border-dashed border-slate-600 hover:border-purple-500 rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-slate-800/50 mb-6"
          >
            <input ref={pngInputRef} type="file" accept="image/png" onChange={handlePNGUpload} className="hidden" />
            {isConverting ? (
              <div><div className="text-4xl mb-2 animate-spin">⏳</div><p className="text-purple-400 font-semibold">Mengkonversi...</p></div>
            ) : pngPreview ? (
              <div><div className="text-4xl mb-2">✅</div><p className="text-purple-400 font-semibold">{fileName}</p></div>
            ) : (
              <div><div className="text-4xl mb-2">🖼️</div><p className="text-slate-300 font-semibold">Drop file PNG di sini</p></div>
            )}
          </div>
        )}

        {/* === MAIN LAYOUT: Sidebar + Viewport === */}
        {svgContent && webglSupported && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* LEFT SIDEBAR — Settings */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-4 sticky top-4">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  ⚙️ Pengaturan 3D
                </h3>

                {/* Geometry Section */}
                <Section title="Geometry" icon="📐" defaultOpen={true}>
                  {/* Render Mode */}
                  <div>
                    <label className="text-xs text-slate-400 mb-2 block">Mode</label>
                    <div className="space-y-1.5">
                      {modeOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setRenderMode(opt.value)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                            renderMode === opt.value
                              ? 'bg-purple-600/30 border border-purple-500/50 text-purple-300'
                              : 'bg-slate-800/50 border border-slate-700/30 text-slate-400 hover:bg-slate-700/50'
                          }`}
                        >
                          <div className="font-medium">{opt.label}</div>
                          <div className="text-[10px] opacity-70">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Depth */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Kedalaman</span>
                      <span className="text-purple-400 font-mono">{depth}</span>
                    </div>
                    <input type="range" min="5" max="100" value={depth} onChange={(e) => setDepth(Number(e.target.value))} className="w-full accent-purple-500" />
                  </div>

                  {/* Bevel */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Bevel (Tepi Bulat)</span>
                    <button onClick={() => setBevelEnabled(!bevelEnabled)} className={`w-10 h-5 rounded-full transition-all ${bevelEnabled ? 'bg-purple-600' : 'bg-slate-600'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-all ${bevelEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </Section>

                {/* Material Section */}
                <Section title="Material" icon="🎨">
                  {/* Preset grid */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {MATERIAL_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => setSelectedPreset(preset)}
                        className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-[9px] transition-all ${
                          selectedPreset.name === preset.name
                            ? 'bg-purple-600/30 border border-purple-500/50'
                            : 'bg-slate-800/50 border border-slate-700/30 hover:bg-slate-700/50'
                        }`}
                        title={preset.label}
                      >
                        <div className="w-5 h-5 rounded-full border border-slate-600" style={{ backgroundColor: preset.color }} />
                        <span className="text-slate-400 truncate w-full text-center">{preset.label.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>

                  {/* Custom color */}
                  <div className="flex items-center gap-2">
                    <input type="color" value={customColor} onChange={(e) => { setCustomColor(e.target.value); setSelectedPreset(MATERIAL_PRESETS[0]); }} className="w-8 h-8 rounded cursor-pointer" />
                    <span className="text-xs text-slate-400">Custom Color</span>
                  </div>

                  {/* Metalness */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Metalness</span>
                      <span className="text-purple-400 font-mono">{metalness.toFixed(2)}</span>
                    </div>
                    <input type="range" min="0" max="100" value={metalness * 100} onChange={(e) => setMetalness(Number(e.target.value) / 100)} className="w-full accent-purple-500" />
                  </div>

                  {/* Roughness */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Roughness</span>
                      <span className="text-purple-400 font-mono">{roughness.toFixed(2)}</span>
                    </div>
                    <input type="range" min="0" max="100" value={roughness * 100} onChange={(e) => setRoughness(Number(e.target.value) / 100)} className="w-full accent-purple-500" />
                  </div>
                </Section>

                {/* Lighting Section */}
                <Section title="Lighting" icon="💡">
                  {/* Intensity */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Intensity</span>
                      <span className="text-purple-400 font-mono">{lightIntensity.toFixed(1)}</span>
                    </div>
                    <input type="range" min="0" max="30" value={lightIntensity * 10} onChange={(e) => setLightIntensity(Number(e.target.value) / 10)} className="w-full accent-purple-500" />
                  </div>

                  {/* Light color presets */}
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Light Color</label>
                    <div className="flex gap-1.5">
                      {lightPresets.map((color) => (
                        <button
                          key={color}
                          onClick={() => setLightColor(color)}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${lightColor === color ? 'border-white scale-110' : 'border-slate-600'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </Section>

                {/* Environment Section */}
                <Section title="Environment" icon="🌄">
                  {/* Background type */}
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Backdrop Style</label>
                    <div className="flex gap-1.5">
                      {bgOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setBgType(opt.value)}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-medium transition-all ${
                            bgType === opt.value
                              ? 'bg-purple-600/30 border border-purple-500/50 text-purple-300'
                              : 'bg-slate-800/50 border border-slate-700/30 text-slate-400'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Gradient colors */}
                  {bgType === 'gradient' && (
                    <>
                      <div className="flex items-center gap-2">
                        <input type="color" value={bgColor1} onChange={(e) => setBgColor1(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                        <span className="text-xs text-slate-400">→</span>
                        <input type="color" value={bgColor2} onChange={(e) => setBgColor2(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                        <span className="text-xs text-slate-400">Gradient Colors</span>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Angle</span>
                          <span className="text-purple-400 font-mono">{bgAngle}°</span>
                        </div>
                        <input type="range" min="0" max="360" value={bgAngle} onChange={(e) => setBgAngle(Number(e.target.value))} className="w-full accent-purple-500" />
                      </div>
                    </>
                  )}

                  {/* Solid color */}
                  {bgType === 'solid' && (
                    <div className="flex items-center gap-2">
                      <input type="color" value={bgColor1} onChange={(e) => setBgColor1(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                      <span className="text-xs text-slate-400">Background Color</span>
                    </div>
                  )}

                  {bgType === 'transparent' && (
                    <p className="text-[10px] text-slate-500">Background transparan — cocok buat overlay di website</p>
                  )}
                </Section>
              </div>
            </div>

            {/* RIGHT — 3D Viewport */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                3D Viewport
              </h2>
              <ErrorBoundary fallback={<Error3D onRetry={() => setThreeKey(prev => prev + 1)} />}>
                <Suspense fallback={<Loading3D />}>
                  <SVGToThree
                    key={threeKey}
                    svgContent={svgContent}
                    depth={depth}
                    bevelEnabled={bevelEnabled}
                    renderMode={renderMode}
                    materialPreset={selectedPreset}
                    customColor={customColor}
                    metalness={metalness}
                    roughness={roughness}
                    lightIntensity={lightIntensity}
                    lightColor={lightColor}
                    bgType={bgType}
                    bgColors={[bgColor1, bgColor2]}
                    bgAngle={bgAngle}
                  />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30">
          <p className="text-xs text-slate-500 text-center">
            💡 <strong>Tips Mobile:</strong> Tutup tab yang gak dipake biar gak crash. 3D viewer butuh memory cukup.
          </p>
        </div>
      </div>
    </div>
  );
}
