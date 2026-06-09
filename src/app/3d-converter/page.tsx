'use client';

import { useState, useCallback, useRef } from 'react';
import SVGToThree from '@/components/SVGToThree';

export default function ThreeDConverterPage() {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [depth, setDepth] = useState(40);
  const [bevelEnabled, setBevelEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'svg' | 'png'>('svg');
  const [pngPreview, setPngPreview] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pngInputRef = useRef<HTMLInputElement>(null);

  // Handle SVG file upload
  const handleSVGUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setSvgContent(content);
    };
    reader.readAsText(file);
  }, []);

  // Handle PNG file upload → convert to SVG
  const handlePNGUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsConverting(true);
    setFileName(file.name);

    // Preview
    const previewUrl = URL.createObjectURL(file);
    setPngPreview(previewUrl);

    try {
      // Dynamically import imagetracerjs
      const ImageTracer = (await import('imagetracerjs')).default;

      // Convert PNG to SVG
      const svgStr = await new Promise<string>((resolve, reject) => {
        ImageTracer.imageToSVG(
          previewUrl,
          (svgString: string) => {
            resolve(svgString);
          },
          {
            pathomit: 10,
            qtres: 3,
            colorsampling: 2,
            numberofcolors: 16,
            mincolorratio: 0,
            colorquantcycles: 3,
            blurradius: 0,
            blurdelta: 20,
            ltres: 1,
            strokewidth: 1,
            linefilter: false,
            scale: 1,
            roundcoords: 2,
            desc: false,
            viewbox: true,
          }
        );
      });

      setSvgContent(svgStr);
      setActiveTab('svg'); // Switch to SVG tab to show 3D
    } catch (err) {
      console.error('PNG conversion error:', err);
      alert('Gagal convert PNG ke SVG. Coba file lain.');
    } finally {
      setIsConverting(false);
    }
  }, []);

  // Drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSvgContent(event.target?.result as string);
      };
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            🎨 <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">3D Converter</span>
          </h1>
          <p className="text-slate-400">Upload SVG atau PNG → jadi model 3D yang bisa di-download</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('svg')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'svg'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            📐 Upload SVG
          </button>
          <button
            onClick={() => setActiveTab('png')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'png'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            🖼️ PNG ke 3D
          </button>
        </div>

        {/* SVG Upload Tab */}
        {activeTab === 'svg' && (
          <div className="space-y-6">
            {/* Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-600 hover:border-purple-500 rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-slate-800/50"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg"
                onChange={handleSVGUpload}
                className="hidden"
              />
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

            {/* Settings */}
            {svgContent && (
              <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">⚙️ Pengaturan 3D</h3>
                <div className="space-y-4">
                  {/* Depth */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Kedalaman (Depth)</span>
                      <span className="text-purple-400 font-mono">{depth}</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={depth}
                      onChange={(e) => setDepth(Number(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>

                  {/* Bevel */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Bevel (Tepi Bulat)</span>
                    <button
                      onClick={() => setBevelEnabled(!bevelEnabled)}
                      className={`w-12 h-6 rounded-full transition-all ${
                        bevelEnabled ? 'bg-purple-600' : 'bg-slate-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-all ${
                        bevelEnabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PNG Upload Tab */}
        {activeTab === 'png' && (
          <div className="space-y-6">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => pngInputRef.current?.click()}
              className="border-2 border-dashed border-slate-600 hover:border-purple-500 rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-slate-800/50"
            >
              <input
                ref={pngInputRef}
                type="file"
                accept="image/png"
                onChange={handlePNGUpload}
                className="hidden"
              />
              {isConverting ? (
                <div>
                  <div className="text-4xl mb-2 animate-spin">⏳</div>
                  <p className="text-purple-400 font-semibold">Mengkonversi PNG ke SVG...</p>
                  <p className="text-sm text-slate-500 mt-1">Tunggu sebentar ya~</p>
                </div>
              ) : pngPreview ? (
                <div>
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-purple-400 font-semibold">{fileName}</p>
                  <p className="text-sm text-slate-500 mt-1">Klik atau drop file lain untuk ganti</p>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-2">🖼️</div>
                  <p className="text-slate-300 font-semibold">Drop file PNG di sini</p>
                  <p className="text-sm text-slate-500 mt-1">PNG akan dikonversi ke SVG lalu ke 3D</p>
                </div>
              )}
            </div>

            {/* PNG Preview */}
            {pngPreview && !isConverting && (
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">🖼️ Preview PNG</h3>
                <div className="flex justify-center">
                  <img
                    src={pngPreview}
                    alt="PNG Preview"
                    className="max-h-48 rounded-lg border border-slate-700"
                  />
                </div>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-4">
              <p className="text-sm text-blue-300">
                💡 <strong>Tips:</strong> Untuk hasil terbaik, pakai PNG dengan background transparan dan objek yang kontras. 
                PNG akan dikonversi ke SVG secara otomatis, lalu langsung jadi model 3D!
              </p>
            </div>
          </div>
        )}

        {/* 3D Viewport */}
        {svgContent && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
              3D Viewport
            </h2>
            <SVGToThree
              svgContent={svgContent}
              depth={depth}
              bevelEnabled={bevelEnabled}
            />
          </div>
        )}
      </div>
    </div>
  );
}
