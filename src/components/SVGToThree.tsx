'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// === TYPES ===
export type RenderMode = 'smart' | 'filled' | 'outline' | 'wireframe';
export type BgType = 'gradient' | 'solid' | 'transparent';

export interface MaterialPreset {
  name: string;
  color: string;
  metalness: number;
  roughness: number;
  label: string;
}

export interface SVGToThreeProps {
  svgContent: string;
  depth?: number;
  bevelEnabled?: boolean;
  renderMode?: RenderMode;
  materialPreset?: MaterialPreset;
  customColor?: string;
  metalness?: number;
  roughness?: number;
  lightIntensity?: number;
  lightColor?: string;
  bgType?: BgType;
  bgColors?: string[];
  bgAngle?: number;
}

// === MATERIAL PRESETS ===
export const MATERIAL_PRESETS: MaterialPreset[] = [
  { name: 'custom', color: '#8B5CF6', metalness: 0.1, roughness: 0.4, label: '🎨 Custom' },
  { name: 'gold', color: '#FFD700', metalness: 0.9, roughness: 0.2, label: '🥇 Gold' },
  { name: 'silver', color: '#C0C0C0', metalness: 0.9, roughness: 0.15, label: '🥈 Silver' },
  { name: 'copper', color: '#B87333', metalness: 0.85, roughness: 0.25, label: '🥉 Copper' },
  { name: 'chrome', color: '#E8E8E8', metalness: 1.0, roughness: 0.05, label: '✨ Chrome' },
  { name: 'plastic', color: '#FF6B9D', metalness: 0.0, roughness: 0.5, label: '🩷 Plastic' },
  { name: 'wood', color: '#8B6914', metalness: 0.0, roughness: 0.8, label: '🪵 Wood' },
  { name: 'glass', color: '#88CCFF', metalness: 0.1, roughness: 0.05, label: '💎 Glass' },
  { name: 'matte', color: '#333333', metalness: 0.0, roughness: 1.0, label: '⬛ Matte' },
  { name: 'neon', color: '#00FF88', metalness: 0.3, roughness: 0.2, label: '💚 Neon' },
];

// === SVG ANALYSIS ALGORITHM ===
// Deteksi mana path yang ada isinya (filled) vs outline aja

interface AnalyzedPath {
  d: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
  isFilled: boolean;    // Ada isi (fill bukan none/transparent)
  isOutline: boolean;   // Cuma garis (stroke doang)
  isClassBased: boolean;
}

function analyzeSVG(svgContent: string): {
  paths: AnalyzedPath[];
  viewBox: { x: number; y: number; width: number; height: number };
  hasStyleBlock: boolean;
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'image/svg+xml');
  const svg = doc.querySelector('svg');

  // Get viewBox
  let viewBox = { x: 0, y: 0, width: 100, height: 100 };
  if (svg) {
    const vb = svg.getAttribute('viewBox');
    if (vb) {
      const parts = vb.split(/[\s,]+/).map(Number);
      if (parts.length === 4) {
        viewBox = { x: parts[0], y: parts[1], width: parts[2], height: parts[3] };
      }
    } else {
      const w = parseFloat(svg.getAttribute('width') || '100');
      const h = parseFloat(svg.getAttribute('height') || '100');
      viewBox = { x: 0, y: 0, width: w, height: h };
    }
  }

  // Parse style block for class-based fills
  const styleEl = doc.querySelector('style');
  const hasStyleBlock = !!styleEl;
  const styleMap: Record<string, { fill?: string; stroke?: string; strokeWidth?: string }> = {};

  if (styleEl) {
    const styleText = styleEl.textContent || '';
    // Parse CSS rules like .cls-1{fill:#d4712a}
    const ruleRegex = /\.([^{]+)\{([^}]+)\}/g;
    let match;
    while ((match = ruleRegex.exec(styleText)) !== null) {
      const className = match[1].trim();
      const props = match[2];
      const entry: { fill?: string; stroke?: string; strokeWidth?: string } = {};

      const fillMatch = props.match(/fill:\s*([^;}\s]+)/);
      if (fillMatch) entry.fill = fillMatch[1];

      const strokeMatch = props.match(/stroke:\s*([^;}\s]+)/);
      if (strokeMatch) entry.stroke = strokeMatch[1];

      const swMatch = props.match(/stroke-width:\s*([^;}\s]+)/);
      if (swMatch) entry.strokeWidth = swMatch[1];

      styleMap[className] = entry;
    }
  }

  const analyzedPaths: AnalyzedPath[] = [];

  // Analyze all path elements
  const pathElements = doc.querySelectorAll('path');
  pathElements.forEach((path) => {
    const d = path.getAttribute('d');
    if (!d) return;

    // Get fill from attribute or class
    let fill = path.getAttribute('fill') || '';
    let stroke = path.getAttribute('stroke') || '';
    let strokeWidth = parseFloat(path.getAttribute('stroke-width') || '0');

    // Check class-based styles
    const className = path.getAttribute('class');
    let isClassBased = false;
    if (className && styleMap[className]) {
      const classStyle = styleMap[className];
      if (classStyle.fill && !fill) {
        fill = classStyle.fill;
        isClassBased = true;
      }
      if (classStyle.stroke && !stroke) {
        stroke = classStyle.stroke;
        isClassBased = true;
      }
      if (classStyle.strokeWidth && !strokeWidth) {
        strokeWidth = parseFloat(classStyle.strokeWidth);
        isClassBased = true;
      }
    }

    // Also check inline style
    const style = path.getAttribute('style') || '';
    if (style) {
      const styleFillMatch = style.match(/fill:\s*([^;}\s]+)/);
      if (styleFillMatch && !fill) fill = styleFillMatch[1];

      const styleStrokeMatch = style.match(/stroke:\s*([^;}\s]+)/);
      if (styleStrokeMatch && !stroke) stroke = styleStrokeMatch[1];

      const styleSWMatch = style.match(/stroke-width:\s*([^;}\s]+)/);
      if (styleSWMatch && !strokeWidth) strokeWidth = parseFloat(styleSWMatch[1]);
    }

    // === ALGORITHM: Tentuin mana yang ada isinya ===
    // isFilled = path punya fill yang bukan "none" atau "transparent"
    const isFilled = !!fill &&
      fill !== 'none' &&
      fill !== 'transparent' &&
      fill !== 'rgba(0,0,0,0)' &&
      fill !== '#00000000';

    // isOutline = path cuma punya stroke, gak punya fill
    const isOutline = !isFilled && !!stroke && stroke !== 'none';

    analyzedPaths.push({
      d,
      fill: fill || '#8B5CF6', // Default purple kalau gak ada fill
      stroke: stroke || fill || '#8B5CF6',
      strokeWidth: strokeWidth || 2,
      isFilled,
      isOutline,
      isClassBased,
    });
  });

  // Also analyze rect, circle, ellipse elements
  const rectElements = doc.querySelectorAll('rect');
  rectElements.forEach((rect) => {
    const x = parseFloat(rect.getAttribute('x') || '0');
    const y = parseFloat(rect.getAttribute('y') || '0');
    const w = parseFloat(rect.getAttribute('width') || '0');
    const h = parseFloat(rect.getAttribute('height') || '0');
    if (w <= 0 || h <= 0) return;

    const transform = rect.getAttribute('transform') || '';
    const tx = transform.match(/translate\(([^)]+)\)/)?.[1]?.split(/[\s,]+/).map(Number) || [0, 0];
    const rotate = parseFloat(transform.match(/rotate\(([^)]+)\)/)?.[1] || '0');

    let nx = x + tx[0], ny = y + tx[1];
    const d = `M${nx},${ny} L${nx+w},${ny} L${nx+w},${ny+h} L${nx},${ny+h} Z`;

    let fill = rect.getAttribute('fill') || '';
    const className = rect.getAttribute('class');
    if (className && styleMap[className]?.fill) {
      fill = styleMap[className].fill!;
    }

    const isFilled = !!fill && fill !== 'none' && fill !== 'transparent';

    analyzedPaths.push({
      d,
      fill: fill || '#8B5CF6',
      stroke: fill || '#8B5CF6',
      strokeWidth: 2,
      isFilled,
      isOutline: false,
      isClassBased: !!className,
    });
  });

  const circleElements = doc.querySelectorAll('circle, ellipse');
  circleElements.forEach((el) => {
    const cx = parseFloat(el.getAttribute('cx') || '0');
    const cy = parseFloat(el.getAttribute('cy') || '0');
    const rx = parseFloat(el.getAttribute('r') || el.getAttribute('rx') || '0');
    const ry = parseFloat(el.getAttribute('ry') || String(rx));
    if (rx <= 0) return;

    const kx = rx * 0.5523, ky = ry * 0.5523;
    const d = `M${cx-rx},${cy} C${cx-rx},${cy-ky} ${cx-kx},${cy-ry} ${cx},${cy-ry} C${cx+kx},${cy-ry} ${cx+rx},${cy-ky} ${cx+rx},${cy} C${cx+rx},${cy+ky} ${cx+kx},${cy+ry} ${cx},${cy+ry} C${cx-kx},${cy+ry} ${cx-rx},${cy+ky} ${cx-rx},${cy} Z`;

    let fill = el.getAttribute('fill') || '';
    const className = el.getAttribute('class');
    if (className && styleMap[className]?.fill) {
      fill = styleMap[className].fill!;
    }

    const isFilled = !!fill && fill !== 'none' && fill !== 'transparent';

    analyzedPaths.push({
      d,
      fill: fill || '#8B5CF6',
      stroke: fill || '#8B5CF6',
      strokeWidth: 2,
      isFilled,
      isOutline: false,
      isClassBased: !!className,
    });
  });

  return { paths: analyzedPaths, viewBox, hasStyleBlock };
}

// === SVG PATH PARSER ===
function parseSVGPath(d: string): any {
  const shape = new THREE.Shape();
  const commands = d.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g);
  if (!commands) return null;

  let cx = 0, cy = 0, sx = 0, sy = 0, first = true;

  for (const cmd of commands) {
    const type = cmd[0];
    const nums = cmd.slice(1).trim().match(/-?[\d.]+/g)?.map(Number) || [];

    switch (type) {
      case 'M':
        if (nums.length >= 2) {
          cx = nums[0]; cy = nums[1];
          shape.moveTo(cx, cy);
          sx = cx; sy = cy; first = false;
        }
        break;
      case 'm':
        if (nums.length >= 2) {
          cx += nums[0]; cy += nums[1];
          shape.moveTo(cx, cy);
          sx = cx; sy = cy; first = false;
        }
        break;
      case 'L':
        for (let i = 0; i < nums.length - 1; i += 2) {
          shape.lineTo(nums[i], nums[i + 1]);
          cx = nums[i]; cy = nums[i + 1];
        }
        break;
      case 'l':
        for (let i = 0; i < nums.length - 1; i += 2) {
          cx += nums[i]; cy += nums[i + 1];
          shape.lineTo(cx, cy);
        }
        break;
      case 'H':
        for (const n of nums) { shape.lineTo(n, cy); cx = n; }
        break;
      case 'h':
        for (const n of nums) { cx += n; shape.lineTo(cx, cy); }
        break;
      case 'V':
        for (const n of nums) { shape.lineTo(cx, n); cy = n; }
        break;
      case 'v':
        for (const n of nums) { cy += n; shape.lineTo(cx, cy); }
        break;
      case 'C':
        for (let i = 0; i < nums.length - 4; i += 6) {
          shape.bezierCurveTo(nums[i], nums[i+1], nums[i+2], nums[i+3], nums[i+4], nums[i+5]);
          cx = nums[i+4]; cy = nums[i+5];
        }
        break;
      case 'c':
        for (let i = 0; i < nums.length - 4; i += 6) {
          shape.bezierCurveTo(cx+nums[i], cy+nums[i+1], cx+nums[i+2], cy+nums[i+3], cx+nums[i+4], cy+nums[i+5]);
          cx += nums[i+4]; cy += nums[i+5];
        }
        break;
      case 'Q':
        for (let i = 0; i < nums.length - 2; i += 4) {
          shape.quadraticCurveTo(nums[i], nums[i+1], nums[i+2], nums[i+3]);
          cx = nums[i+2]; cy = nums[i+3];
        }
        break;
      case 'q':
        for (let i = 0; i < nums.length - 2; i += 4) {
          shape.quadraticCurveTo(cx+nums[i], cy+nums[i+1], cx+nums[i+2], cy+nums[i+3]);
          cx += nums[i+2]; cy += nums[i+3];
        }
        break;
      case 'Z': case 'z':
        shape.lineTo(sx, sy);
        cx = sx; cy = sy;
        break;
      case 'A': case 'a':
        if (nums.length >= 7) {
          const ex = type === 'A' ? nums[5] : cx + nums[5];
          const ey = type === 'A' ? nums[6] : cy + nums[6];
          shape.lineTo(ex, ey);
          cx = ex; cy = ey;
        }
        break;
    }
  }
  return shape;
}

// === UTILITY ===
function hexToColor(hex: string): any {
  try { return new THREE.Color(hex); } catch { return new THREE.Color('#8B5CF6'); }
}

function createGradientTexture(color1: string, color2: string, angle: number): any {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const rad = (angle * Math.PI) / 180;
  const x1 = 256 - Math.cos(rad) * 256;
  const y1 = 256 - Math.sin(rad) * 256;
  const x2 = 256 + Math.cos(rad) * 256;
  const y2 = 256 + Math.sin(rad) * 256;

  const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// === MAIN COMPONENT ===
export default function SVGToThree({
  svgContent,
  depth = 40,
  bevelEnabled = true,
  renderMode = 'smart',
  materialPreset,
  customColor,
  metalness = 0.1,
  roughness = 0.4,
  lightIntensity = 1.5,
  lightColor = '#ffffff',
  bgType = 'gradient',
  bgColors = ['#1a1a2e', '#16213e'],
  bgAngle = 135,
}: SVGToThreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<any | null>(null);
  const cameraRef = useRef<any | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<any | null>(null);
  const sceneRef = useRef<any | null>(null);
  const animationRef = useRef<number>(0);

  const [autoRotate, setAutoRotate] = useState(true);
  const [stats, setStats] = useState({ paths: 0, filled: 0, outline: 0, meshes: 0, triangles: 0 });

  // Get effective material settings
  const effectiveColor = materialPreset?.name !== 'custom' && materialPreset
    ? materialPreset.color
    : (customColor || '#8B5CF6');
  const effectiveMetalness = materialPreset?.name !== 'custom' && materialPreset
    ? materialPreset.metalness
    : metalness;
  const effectiveRoughness = materialPreset?.name !== 'custom' && materialPreset
    ? materialPreset.roughness
    : roughness;

  // Build 3D scene
  useEffect(() => {
    if (!containerRef.current || !svgContent) return;

    const container = containerRef.current;
    let animFrameId = 0;

    const initScene = () => {
      const width = container.clientWidth;
      const height = container.clientHeight || 400;

      if (width === 0 || height === 0) {
        animFrameId = requestAnimationFrame(initScene);
        return;
      }

      // Clean up previous
      if (rendererRef.current) {
        const dom = rendererRef.current.domElement;
        if (dom && dom.parentNode === container) container.removeChild(dom);
        rendererRef.current.dispose();
      }
      if (animationRef.current) cancelAnimationFrame(animationRef.current);

      // Scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Background
      if (bgType === 'gradient') {
        const tex = createGradientTexture(bgColors[0] || '#1a1a2e', bgColors[1] || '#16213e', bgAngle);
        scene.background = tex;
      } else if (bgType === 'solid') {
        scene.background = new THREE.Color(bgColors[0] || '#1a1a2e');
      } else {
        scene.background = null; // transparent
      }

      // Camera
      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 10000);
      camera.position.set(200, 200, 200);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      // Renderer
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: bgType === 'transparent',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 2;
      controls.enablePan = true;
      controls.enableZoom = true;
      controls.target.set(0, 0, 0);
      controlsRef.current = controls;

      // === LIGHTING ===
      const ambient = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambient);

      const dirLight = new THREE.DirectionalLight(hexToColor(lightColor), lightIntensity);
      dirLight.position.set(200, 300, 200);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.set(1024, 1024);
      scene.add(dirLight);

      const fillLight = new THREE.DirectionalLight(0x8B5CF6, 0.6);
      fillLight.position.set(-200, 100, 100);
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0xA78BFA, 0.4);
      rimLight.position.set(0, 100, -200);
      scene.add(rimLight);

      const topLight = new THREE.DirectionalLight(0xffffff, 0.3);
      topLight.position.set(0, 400, 0);
      scene.add(topLight);

      // Grid
      const gridHelper = new THREE.GridHelper(500, 10, 0x222244, 0x1a1a33);
      gridHelper.position.y = -1;
      (gridHelper.material as any).transparent = true;
      (gridHelper.material as any).opacity = 0.3;
      scene.add(gridHelper);

      // === ANALYZE SVG & BUILD 3D ===
      const { paths, viewBox } = analyzeSVG(svgContent);
      console.log('SVG analyzed:', paths.length, 'paths');
      console.log('  Filled:', paths.filter(p => p.isFilled).length);
      console.log('  Outline:', paths.filter(p => p.isOutline).length);

      const MAX_PATHS = 50;
      const limitedPaths = paths.slice(0, MAX_PATHS);

      const modelGroup = new THREE.Group();
      const centerX = viewBox.x + viewBox.width / 2;
      const centerY = viewBox.y + viewBox.height / 2;
      const maxSize = Math.max(viewBox.width, viewBox.height);
      const scale = 200 / maxSize;

      let meshCount = 0;
      let totalTriangles = 0;
      let filledCount = 0;
      let outlineCount = 0;

      limitedPaths.forEach((analyzed) => {
        const { d, fill, stroke, isFilled, isOutline } = analyzed;

        // === RENDER MODE DECISION ===
        let shouldExtrude = false;
        let shouldWireframe = false;
        let extrudeDepth = depth;
        let useColor = fill;
        let useBevel = bevelEnabled;

        switch (renderMode) {
          case 'smart':
            // Smart Auto: filled paths = extrude, outline paths = edge
            if (isFilled) {
              shouldExtrude = true;
              useColor = fill;
              filledCount++;
            } else if (isOutline) {
              // Outline: thin extrusion with glow
              shouldExtrude = true;
              extrudeDepth = depth * 0.3;
              useBevel = false;
              useColor = stroke;
              outlineCount++;
            } else {
              // Default: extrude with default color
              shouldExtrude = true;
              useColor = effectiveColor;
              filledCount++;
            }
            break;

          case 'filled':
            // Force Filled: semua path jadi solid
            shouldExtrude = true;
            useColor = isFilled ? fill : effectiveColor;
            useBevel = bevelEnabled;
            filledCount++;
            break;

          case 'outline':
            // Force Outline: semua jadi edge/wireframe glow
            shouldExtrude = true;
            extrudeDepth = depth * 0.2;
            useBevel = false;
            useColor = isFilled ? fill : effectiveColor;
            outlineCount++;
            break;

          case 'wireframe':
            // Wireframe Skeleton: pure wireframe
            shouldExtrude = true;
            shouldWireframe = true;
            extrudeDepth = depth * 0.1;
            useBevel = false;
            useColor = effectiveColor;
            outlineCount++;
            break;
        }

        if (!shouldExtrude) return;

        const shape = parseSVGPath(d);
        if (!shape) return;

        // Center the shape
        const centeredShape = new THREE.Shape();
        const points = shape.getPoints(50);
        if (points.length < 3) return;

        centeredShape.moveTo(
          (points[0].x - centerX) * scale,
          -(points[0].y - centerY) * scale
        );
        for (let i = 1; i < points.length; i++) {
          centeredShape.lineTo(
            (points[i].x - centerX) * scale,
            -(points[i].y - centerY) * scale
          );
        }

        // Extrude
        const extrudeSettings: any = {
          depth: extrudeDepth,
          bevelEnabled: useBevel,
          bevelThickness: useBevel ? extrudeDepth * 0.15 : 0,
          bevelSize: useBevel ? extrudeDepth * 0.1 : 0,
          bevelSegments: useBevel ? 3 : 0,
          steps: 1,
        };

        const geometry = new THREE.ExtrudeGeometry(centeredShape, extrudeSettings);

        // Material
        const material = new THREE.MeshStandardMaterial({
          color: hexToColor(useColor),
          roughness: effectiveRoughness,
          metalness: effectiveMetalness,
          side: THREE.DoubleSide,
          flatShading: renderMode === 'wireframe',
          wireframe: shouldWireframe,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.y = 0;

        modelGroup.add(mesh);
        meshCount++;
        totalTriangles += geometry.attributes.position.count / 3;
      });

      setStats({
        paths: limitedPaths.length,
        filled: filledCount,
        outline: outlineCount,
        meshes: meshCount,
        triangles: Math.round(totalTriangles),
      });

      scene.add(modelGroup);
      modelGroupRef.current = modelGroup;

      // Fit camera
      const box = new THREE.Box3().setFromObject(modelGroup);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / (2 * Math.tan(fov / 2)));
      cameraZ *= 2.5;
      camera.position.set(cameraZ * 0.8, cameraZ * 0.8, cameraZ);
      camera.lookAt(center);
      controls.target.copy(center);
      controls.update();

      // Animate
      const animate = () => {
        animationRef.current = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      // Resize
      const handleResize = () => {
        const w = container.clientWidth;
        const h = container.clientHeight || 400;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      (window as any).__svgToThree_cleanup = () => {
        window.removeEventListener('resize', handleResize);
      };
    };

    initScene();

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        const dom = rendererRef.current.domElement;
        if (dom && container.contains(dom)) container.removeChild(dom);
      }
      if ((window as any).__svgToThree_cleanup) {
        (window as any).__svgToThree_cleanup();
      }
    };
  }, [svgContent, depth, bevelEnabled, renderMode, effectiveColor, effectiveMetalness, effectiveRoughness, lightIntensity, lightColor, bgType, bgColors, bgAngle]);

  // Toggle auto-rotate
  const toggleAutoRotate = useCallback(() => {
    setAutoRotate(prev => {
      const next = !prev;
      if (controlsRef.current) controlsRef.current.autoRotate = next;
      return next;
    });
  }, []);

  // Reset camera
  const resetCamera = useCallback(() => {
    if (cameraRef.current && controlsRef.current && modelGroupRef.current) {
      const camera = cameraRef.current;
      const controls = controlsRef.current;
      const box = new THREE.Box3().setFromObject(modelGroupRef.current);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / (2 * Math.tan(fov / 2)));
      cameraZ *= 2.5;
      camera.position.set(cameraZ * 0.8, cameraZ * 0.8, cameraZ);
      camera.lookAt(center);
      controls.target.copy(center);
      controls.update();
    }
  }, []);

  // Capture render
  const captureRender = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    const renderer = rendererRef.current;
    renderer.render(sceneRef.current, cameraRef.current);
    const dataUrl = renderer.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = '3d-render.png';
    a.click();
  }, []);

  // Export GLTF
  const handleExportGLTF = useCallback(async () => {
    if (!modelGroupRef.current) return;
    const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');
    const exporter = new GLTFExporter();
    exporter.parse(
      modelGroupRef.current,
      (result) => {
        const blob = new Blob([result as ArrayBuffer], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'model.glb';
        a.click();
        URL.revokeObjectURL(url);
      },
      (error) => console.error('GLTF export error:', error),
      { binary: true }
    );
  }, []);

  // Export OBJ
  const handleExportOBJ = useCallback(async () => {
    if (!modelGroupRef.current) return;
    const { OBJExporter } = await import('three/examples/jsm/exporters/OBJExporter.js');
    const exporter = new OBJExporter();
    const result = exporter.parse(modelGroupRef.current);
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'model.obj';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  if (!svgContent) return null;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={toggleAutoRotate}
          className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
            autoRotate
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          {autoRotate ? '⏸️ Berhenti Putar' : '▶️ Auto Putar'}
        </button>

        <button
          onClick={resetCamera}
          className="px-4 py-2 rounded-xl font-semibold text-sm bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all"
        >
          🎯 Reset Kamera
        </button>

        <button
          onClick={captureRender}
          className="px-4 py-2 rounded-xl font-semibold text-sm bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:opacity-90 transition-all"
        >
          📸 Capture Render
        </button>

        <button
          onClick={handleExportGLTF}
          className="px-4 py-2 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 transition-all"
        >
          📥 GLTF (.glb)
        </button>

        <button
          onClick={handleExportOBJ}
          className="px-4 py-2 rounded-xl font-semibold text-sm bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all"
        >
          📥 OBJ
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs text-slate-400 flex-wrap">
        <span>📐 {stats.paths} paths</span>
        <span>🎨 {stats.filled} filled</span>
        <span>✏️ {stats.outline} outline</span>
        <span>🧊 {stats.meshes} meshes</span>
        <span>🔺 {stats.triangles.toLocaleString()} triangles</span>
      </div>

      {/* SVG Analysis Info */}
      <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/30">
        <p className="text-xs text-slate-500">
          🧠 <strong>Smart Auto:</strong> Path dengan fill = diekstrusi solid | Path dengan stroke doang = edge tipis
          {renderMode === 'outline' && ' | Mode Outline: semua jadi wireframe glow'}
          {renderMode === 'wireframe' && ' | Mode Wireframe: pure skeleton'}
        </p>
      </div>

      {/* 3D Viewport */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-700/50">
        <div
          ref={containerRef}
          className="w-full"
          style={{ height: '400px' }}
        />

        {/* Controls overlay */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-2">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-slate-400">
            🖱️ Drag: Putar | Scroll: Zoom | Shift+Drag: Geser
          </div>
        </div>

        {/* Auto-rotate indicator */}
        {autoRotate && (
          <div className="absolute top-3 right-3">
            <div className="bg-purple-600/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white animate-pulse">
              🔄 Berputar
            </div>
          </div>
        )}
      </div>
    </div>
  );
}