'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import PngToSvgConverter from './PngToSvgConverter';

export default function ThreeDConverter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const meshRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);

  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [depth, setDepth] = useState(2);
  const [bevel, setBevel] = useState(0.5);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'svg' | 'png'>('svg');

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const THREE = require('three');

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0x6b8f71, 0.3);
    backLight.position.set(-5, -5, -5);
    scene.add(backLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(10, 20, 0x2d2d4e, 0x2d2d4e);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    // Animation loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      if (meshRef.current && autoRotate) {
        meshRef.current.rotation.y += 0.005;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update mesh when SVG or settings change
  useEffect(() => {
    if (!svgContent || !sceneRef.current) return;

    const THREE = require('three');

    // Remove old mesh
    if (meshRef.current) {
      sceneRef.current.remove(meshRef.current);
      if (meshRef.current.geometry) meshRef.current.geometry.dispose();
      if (meshRef.current.material) {
        if (Array.isArray(meshRef.current.material)) {
          meshRef.current.material.forEach((m: any) => {
            if (m.map) m.map.dispose();
            m.dispose();
          });
        } else {
          if (meshRef.current.material.map) meshRef.current.material.map.dispose();
          meshRef.current.material.dispose();
        }
      }
    }

    // Try to create extruded mesh from SVG
    const success = createExtrudedMesh(THREE, svgContent);
    if (!success) {
      // Fallback: create a textured box
      createTexturedBox(THREE, svgContent);
    }
  }, [svgContent, depth, bevel]);

  // Create extruded mesh from SVG paths
  const createExtrudedMesh = (THREE: any, svgString: string): boolean => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgString, 'image/svg+xml');
      const allPaths = doc.querySelectorAll('path, rect, circle, ellipse, polygon');

      if (allPaths.length === 0) return false;

      // Simplify: take only the largest/most important paths
      const paths = Array.from(allPaths).slice(0, 50); // Limit to 50 paths max

      const shapes: any[] = [];

      paths.forEach((path) => {
        try {
          if (path.tagName === 'rect') {
            const x = parseFloat(path.getAttribute('x') || '0');
            const y = parseFloat(path.getAttribute('y') || '0');
            const w = parseFloat(path.getAttribute('width') || '10');
            const h = parseFloat(path.getAttribute('height') || '10');
            if (w > 0 && h > 0) {
              const shape = new THREE.Shape();
              shape.moveTo(x, y);
              shape.lineTo(x + w, y);
              shape.lineTo(x + w, y + h);
              shape.lineTo(x, y + h);
              shape.closePath();
              shapes.push(shape);
            }
          } else if (path.tagName === 'circle') {
            const cx = parseFloat(path.getAttribute('cx') || '0');
            const cy = parseFloat(path.getAttribute('cy') || '0');
            const r = parseFloat(path.getAttribute('r') || '5');
            if (r > 0) {
              const shape = new THREE.Shape();
              shape.absarc(cx, cy, r, 0, Math.PI * 2);
              shapes.push(shape);
            }
          } else if (path.tagName === 'ellipse') {
            const cx = parseFloat(path.getAttribute('cx') || '0');
            const cy = parseFloat(path.getAttribute('cy') || '0');
            const rx = parseFloat(path.getAttribute('rx') || '5');
            const ry = parseFloat(path.getAttribute('ry') || '3');
            if (rx > 0 && ry > 0) {
              const shape = new THREE.Shape();
              shape.absellipse(cx, cy, rx, ry, 0, Math.PI * 2);
              shapes.push(shape);
            }
          } else if (path.tagName === 'polygon') {
            const points = path.getAttribute('points');
            if (points) {
              const coords = points.trim().split(/[\s,]+/).map(Number);
              if (coords.length >= 6) {
                const shape = new THREE.Shape();
                shape.moveTo(coords[0], coords[1]);
                for (let i = 2; i < coords.length; i += 2) {
                  shape.lineTo(coords[i], coords[i + 1]);
                }
                shape.closePath();
                shapes.push(shape);
              }
            }
          } else if (path.tagName === 'path') {
            const d = path.getAttribute('d');
            if (d && d.length < 5000) { // Skip very long paths
              const shape = parseSVGPath(THREE, d);
              if (shape) shapes.push(shape);
            }
          }
        } catch (e) {
          // Skip invalid paths
        }
      });

      if (shapes.length === 0) return false;

      // Create group and extrude each shape
      const group = new THREE.Group();
      const material = new THREE.MeshPhongMaterial({
        color: 0x8b5cf6,
        specular: 0x333333,
        shininess: 30,
      });

      const extrudeSettings = {
        depth: depth,
        bevelEnabled: bevel > 0,
        bevelThickness: bevel,
        bevelSize: bevel,
        bevelSegments: bevel > 0 ? 2 : 0,
      };

      let hasValidMesh = false;
      shapes.forEach((shape) => {
        try {
          const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
          const mesh = new THREE.Mesh(geometry, material.clone());
          group.add(mesh);
          hasValidMesh = true;
        } catch (e) {
          // Skip shapes that fail to extrude
        }
      });

      if (!hasValidMesh) return false;

      // Center the group
      const box = new THREE.Box3().setFromObject(group);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      group.position.sub(center);

      // Scale to fit viewport
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) {
        const scale = 3 / maxDim;
        group.scale.setScalar(scale);
      }

      sceneRef.current.add(group);
      meshRef.current = group;

      if (cameraRef.current) {
        cameraRef.current.position.set(0, 0, 5);
        cameraRef.current.lookAt(0, 0, 0);
      }

      return true;
    } catch (e) {
      console.error('Extrusion failed:', e);
      return false;
    }
  };

  // Fallback: textured box
  const createTexturedBox = (THREE: any, svgString: string) => {
    const canvas = document.createElement('canvas');
    const size = 512;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, size, size);

    const img = new window.Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const scale = Math.min(size / img.width, size / img.height) * 0.8;
      const x = (size - img.width * scale) / 2;
      const y = (size - img.height * scale) / 2;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      const texture = new THREE.CanvasTexture(canvas);

      const geometry = new THREE.BoxGeometry(3, 3, depth);
      const materials = [
        new THREE.MeshPhongMaterial({ color: 0x8b5cf6 }),
        new THREE.MeshPhongMaterial({ color: 0x8b5cf6 }),
        new THREE.MeshPhongMaterial({ color: 0x8b5cf6 }),
        new THREE.MeshPhongMaterial({ color: 0x8b5cf6 }),
        new THREE.MeshPhongMaterial({ map: texture, transparent: true }),
        new THREE.MeshPhongMaterial({ map: texture, transparent: true }),
      ];

      const mesh = new THREE.Mesh(geometry, materials);
      sceneRef.current.add(mesh);
      meshRef.current = mesh;

      if (cameraRef.current) {
        cameraRef.current.position.set(0, 0, 5);
        cameraRef.current.lookAt(0, 0, 0);
      }

      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  // Parse SVG path data
  const parseSVGPath = (THREE: any, d: string): any => {
    try {
      const shape = new THREE.Shape();
      const commands = d.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g);
      if (!commands) return null;

      let currentX = 0;
      let currentY = 0;
      let pointCount = 0;
      const maxPoints = 500;

      for (const cmd of commands) {
        if (pointCount > maxPoints) break;

        const type = cmd[0];
        const args = cmd.slice(1).trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));

        switch (type) {
          case 'M':
            if (args.length >= 2) {
              currentX = args[0];
              currentY = args[1];
              shape.moveTo(currentX, currentY);
              pointCount++;
            }
            break;
          case 'm':
            if (args.length >= 2) {
              currentX += args[0];
              currentY += args[1];
              shape.moveTo(currentX, currentY);
              pointCount++;
            }
            break;
          case 'L':
            for (let i = 0; i < args.length - 1; i += 2) {
              currentX = args[i];
              currentY = args[i + 1];
              shape.lineTo(currentX, currentY);
              pointCount++;
            }
            break;
          case 'l':
            for (let i = 0; i < args.length - 1; i += 2) {
              currentX += args[i];
              currentY += args[i + 1];
              shape.lineTo(currentX, currentY);
              pointCount++;
            }
            break;
          case 'H':
            if (args.length > 0) {
              currentX = args[0];
              shape.lineTo(currentX, currentY);
              pointCount++;
            }
            break;
          case 'h':
            if (args.length > 0) {
              currentX += args[0];
              shape.lineTo(currentX, currentY);
              pointCount++;
            }
            break;
          case 'V':
            if (args.length > 0) {
              currentY = args[0];
              shape.lineTo(currentX, currentY);
              pointCount++;
            }
            break;
          case 'v':
            if (args.length > 0) {
              currentY += args[0];
              shape.lineTo(currentX, currentY);
              pointCount++;
            }
            break;
          case 'C':
            for (let i = 0; i < args.length - 5; i += 6) {
              shape.bezierCurveTo(
                args[i], args[i + 1],
                args[i + 2], args[i + 3],
                args[i + 4], args[i + 5]
              );
              currentX = args[i + 4];
              currentY = args[i + 5];
              pointCount += 3;
            }
            break;
          case 'c':
            for (let i = 0; i < args.length - 5; i += 6) {
              shape.bezierCurveTo(
                currentX + args[i], currentY + args[i + 1],
                currentX + args[i + 2], currentY + args[i + 3],
                currentX + args[i + 4], currentY + args[i + 5]
              );
              currentX += args[i + 4];
              currentY += args[i + 5];
              pointCount += 3;
            }
            break;
          case 'Q':
            for (let i = 0; i < args.length - 3; i += 4) {
              shape.quadraticCurveTo(
                args[i], args[i + 1],
                args[i + 2], args[i + 3]
              );
              currentX = args[i + 2];
              currentY = args[i + 3];
              pointCount += 2;
            }
            break;
          case 'q':
            for (let i = 0; i < args.length - 3; i += 4) {
              shape.quadraticCurveTo(
                currentX + args[i], currentY + args[i + 1],
                currentX + args[i + 2], currentY + args[i + 3]
              );
              currentX += args[i + 2];
              currentY += args[i + 3];
              pointCount += 2;
            }
            break;
          case 'Z':
          case 'z':
            shape.closePath();
            break;
        }
      }

      return shape;
    } catch (e) {
      return null;
    }
  };

  // Handle SVG file upload
  const handleSvgUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Handle PNG to SVG conversion result
  const handlePngToSvg = useCallback((svgString: string, name: string) => {
    setSvgContent(svgString);
    setFileName(name);
  }, []);

  // Export as GLTF
  const handleExportGLTF = useCallback(async () => {
    if (!meshRef.current) return;
    setIsExporting(true);

    try {
      const THREE = require('three');
      const { GLTFExporter } = require('three/addons/exporters/GLTFExporter.js');
      const exporter = new GLTFExporter();

      const gltf = await exporter.parseAsync(meshRef.current, { binary: true });
      const blob = new Blob([gltf as ArrayBuffer], { type: 'model/gltf-binary' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName.replace('.svg', '').replace('.png', '') + '-3d.glb';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export gagal. Coba lagi.');
    } finally {
      setIsExporting(false);
    }
  }, [fileName]);

  // Export as OBJ
  const handleExportOBJ = useCallback(async () => {
    if (!meshRef.current) return;
    setIsExporting(true);

    try {
      const { OBJExporter } = require('three/addons/exporters/OBJExporter.js');
      const exporter = new OBJExporter();
      const obj = exporter.parse(meshRef.current);
      const blob = new Blob([obj], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName.replace('.svg', '').replace('.png', '') + '-3d.obj';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export gagal. Coba lagi.');
    } finally {
      setIsExporting(false);
    }
  }, [fileName]);

  return (
    <div className="min-h-screen bg-gray-950 pt-20">
      {/* Header */}
      <div className="text-center mb-8 px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            3D Converter
          </span>
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          Ubah logo Anda menjadi model 3D. Upload SVG langsung, atau konversi PNG ke SVG dulu.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-4">
            {/* Input Method Tabs */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <div className="flex gap-1 p-1 bg-gray-800/50 rounded-lg mb-4">
                <button
                  onClick={() => setActiveTab('svg')}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                    activeTab === 'svg'
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  📐 Upload SVG
                </button>
                <button
                  onClick={() => setActiveTab('png')}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                    activeTab === 'png'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  🖼️ PNG ke SVG
                </button>
              </div>

              {activeTab === 'svg' ? (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5 transition-all">
                  <svg className="w-8 h-8 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm text-gray-400">
                    {svgContent && activeTab === 'svg' ? fileName : 'Klik untuk upload SVG'}
                  </span>
                  <input type="file" accept=".svg" className="hidden" onChange={handleSvgUpload} />
                </label>
              ) : (
                <PngToSvgConverter onSvgGenerated={handlePngToSvg} />
              )}

              {svgContent && activeTab === 'svg' && (
                <p className="text-xs text-violet-400 mt-2 truncate">✓ {fileName}</p>
              )}
            </div>

            {/* 3D Settings */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-300 mb-4">Pengaturan 3D</h3>

              <div className="space-y-4">
                <div>
                  <label className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>Kedalaman (Depth)</span>
                    <span className="text-violet-400">{depth.toFixed(1)}</span>
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.1"
                    value={depth}
                    onChange={(e) => setDepth(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-violet-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>

                <div>
                  <label className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>Bevel (Tepi)</span>
                    <span className="text-violet-400">{bevel.toFixed(1)}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={bevel}
                    onChange={(e) => setBevel(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-violet-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Auto Rotate</span>
                  <button
                    onClick={() => setAutoRotate(!autoRotate)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      autoRotate ? 'bg-violet-600' : 'bg-gray-700'
                    }`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      autoRotate ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Export */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Ekspor</h3>
              <div className="space-y-2">
                <button
                  onClick={handleExportGLTF}
                  disabled={!svgContent || isExporting}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-violet-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? 'Mengekspor...' : 'Unduh GLTF (.glb)'}
                </button>
                <button
                  onClick={handleExportOBJ}
                  disabled={!svgContent || isExporting}
                  className="w-full px-4 py-2.5 bg-gray-800 text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Unduh OBJ
                </button>
              </div>
              <p className="text-[10px] text-gray-600 mt-2">
                GLTF: untuk web & 3D viewer | OBJ: untuk 3D printing
              </p>
            </div>
          </div>

          {/* 3D Viewport */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden relative">
              {/* Viewport header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-violet-500" />
                  <span className="text-xs text-gray-400">3D Viewport</span>
                </div>
                <div className="flex gap-1">
                  <span className="px-3 py-1 text-xs bg-violet-600/20 text-violet-400 border border-violet-600/30 rounded-md">
                    3D Studio
                  </span>
                </div>
              </div>

              {/* 3D Canvas */}
              <div
                ref={containerRef}
                className="w-full h-[500px] md:h-[600px]"
                style={{ cursor: 'grab' }}
              />

              {/* Empty state */}
              {!svgContent && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: '40px' }}>
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                    </svg>
                    <p className="text-sm text-gray-500">Upload SVG atau konversi PNG untuk mulai</p>
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            {svgContent && (
              <div className="mt-4 p-4 bg-gray-900/30 border border-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Drag untuk rotasi • Scroll untuk zoom • Klik kanan untuk pan</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
