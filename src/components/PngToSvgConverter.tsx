'use client';

import { useState, useCallback, useRef } from 'react';
import ImageTracer from 'imagetracerjs';

interface PngToSvgConverterProps {
  onSvgGenerated: (svgContent: string, fileName: string) => void;
}

export default function PngToSvgConverter({ onSvgGenerated }: PngToSvgConverterProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [svgPreview, setSvgPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const qualityPresets = {
    low: { scale: 1, ltres: 0.5, qtres: 0.5, pathomit: 10, colorsampling: 0, numberofcolors: 4 },
    medium: { scale: 1, ltres: 1, qtres: 1, pathomit: 5, colorsampling: 1, numberofcolors: 8 },
    high: { scale: 2, ltres: 2, qtres: 2, pathomit: 2, colorsampling: 2, numberofcolors: 16 },
  };

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(png|jpe?g|webp|gif|bmp)$/)) {
      alert('File harus berupa gambar (PNG, JPG, WebP, GIF, BMP)');
      return;
    }

    setFileName(file.name);
    setSvgPreview(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleConvert = useCallback(async () => {
    if (!preview) return;

    setIsConverting(true);

    try {
      // Create image element
      const img = new window.Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = preview;
      });

      // Create canvas to draw image
      const canvas = document.createElement('canvas');
      const maxSize = quality === 'high' ? 1024 : quality === 'medium' ? 512 : 256;
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width = Math.floor(img.width * scale);
      canvas.height = Math.floor(img.height * scale);

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Convert to SVG using ImageTracer
      const options = qualityPresets[quality];
      const dataUrl = canvas.toDataURL('image/png');
      
      const svgString = await new Promise<string>((resolve, reject) => {
        ImageTracer.imageToSVG(
          dataUrl,
          (svg: string) => resolve(svg),
          options
        );
      });

      setSvgPreview(svgString);

      // Generate output filename
      const outputName = fileName.replace(/\.(png|jpe?g|webp|gif|bmp)$/i, '') + '-vectorized.svg';

      onSvgGenerated(svgString, outputName);
    } catch (error) {
      console.error('Conversion failed:', error);
      alert('Konversi gagal. Coba gambar lain atau turunkan kualitas.');
    } finally {
      setIsConverting(false);
    }
  }, [preview, quality, fileName, onSvgGenerated]);

  const handleDownloadSvg = useCallback(() => {
    if (!svgPreview) return;

    const blob = new Blob([svgPreview], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace(/\.(png|jpe?g|webp|gif|bmp)$/i, '') + '-vectorized.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [svgPreview, fileName]);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div>
        <label
          className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const file = e.dataTransfer.files[0];
            if (file && file.type.match(/^image\/(png|jpe?g|webp|gif|bmp)$/)) {
              const reader = new FileReader();
              reader.onload = (event) => {
                setPreview(event.target?.result as string);
                setFileName(file.name);
                setSvgPreview(null);
              };
              reader.readAsDataURL(file);
            }
          }}
        >
          {preview ? (
            <div className="flex items-center gap-3 px-4">
              <img src={preview} alt="Preview" className="w-16 h-16 object-contain rounded" />
              <div className="text-left">
                <p className="text-sm text-gray-300 truncate max-w-[180px]">{fileName}</p>
                <p className="text-xs text-emerald-400">✓ Siap dikonversi</p>
              </div>
            </div>
          ) : (
            <>
              <svg className="w-8 h-8 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-400">Klik atau drag gambar PNG/JPG di sini</span>
              <span className="text-xs text-gray-600 mt-1">PNG, JPG, WebP, GIF, BMP</span>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {/* Quality Preset */}
      {preview && (
        <div>
          <label className="text-xs text-gray-400 mb-2 block">Kualitas Vektor</label>
          <div className="grid grid-cols-3 gap-2">
            {(['low', 'medium', 'high'] as const).map((q) => (
              <button
                key={q}
                onClick={() => { setQuality(q); setSvgPreview(null); }}
                className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                  quality === q
                    ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400'
                    : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                {q === 'low' ? '⚡ Cepat' : q === 'medium' ? '⚖️ Sedang' : '✨ Detail'}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-600 mt-1.5">
            {quality === 'low' ? 'Proses cepat, hasil sederhana' :
             quality === 'medium' ? 'Keseimbangan cepat & detail' :
             'Hasil paling detail, proses lebih lama'}
          </p>
        </div>
      )}

      {/* Convert Button */}
      {preview && (
        <button
          onClick={handleConvert}
          disabled={isConverting}
          className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConverting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Mengonversi...
            </span>
          ) : (
            '🔄 Konversi ke SVG'
          )}
        </button>
      )}

      {/* SVG Preview */}
      {svgPreview && (
        <div className="space-y-3">
          <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Hasil SVG</span>
              <span className="text-xs text-emerald-400">✓ Berhasil</span>
            </div>
            <div
              className="w-full h-32 flex items-center justify-center bg-white/5 rounded overflow-hidden"
              dangerouslySetInnerHTML={{ __html: svgPreview.replace(/<svg[^>]*>/, '<svg style="max-width:100%;max-height:100%">') }}
            />
          </div>

          <button
            onClick={handleDownloadSvg}
            className="w-full px-4 py-2.5 bg-gray-800 text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Unduh SVG
          </button>

          <p className="text-[10px] text-gray-600 text-center">
            SVG ini bisa langsung dipakai di 3D Converter di bawah ↓
          </p>
        </div>
      )}
    </div>
  );
}
