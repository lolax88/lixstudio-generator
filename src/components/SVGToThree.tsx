'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface SVGToThreeProps {
  svgContent: string;
  depth?: number;
  bevelEnabled?: boolean;
  onExportGLTF?: () => void;
  onExportOBJ?: () => void;
}

// Parse SVG path d attribute to THREE.Shape
function parseSVGPath(d: string): any {
  const shape = new THREE.Shape();
  const commands = d.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g);
  if (!commands) return null;

  let currentX = 0;
  let currentY = 0;
  let startX = 0;
  let startY = 0;
  let firstMove = true;

  for (const cmd of commands) {
    const type = cmd[0];
    const nums = cmd.slice(1).trim().match(/-?[\d.]+/g)?.map(Number) || [];

    switch (type) {
      case 'M':
        if (nums.length >= 2) {
          currentX = nums[0];
          currentY = nums[1];
          if (firstMove) {
            shape.moveTo(currentX, currentY);
            firstMove = false;
          } else {
            shape.moveTo(currentX, currentY);
          }
          startX = currentX;
          startY = currentY;
        }
        break;
      case 'm':
        if (nums.length >= 2) {
          currentX += nums[0];
          currentY += nums[1];
          if (firstMove) {
            shape.moveTo(currentX, currentY);
            firstMove = false;
          } else {
            shape.moveTo(currentX, currentY);
          }
          startX = currentX;
          startY = currentY;
        }
        break;
      case 'L':
        for (let i = 0; i < nums.length - 1; i += 2) {
          shape.lineTo(nums[i], nums[i + 1]);
          currentX = nums[i];
          currentY = nums[i + 1];
        }
        break;
      case 'l':
        for (let i = 0; i < nums.length - 1; i += 2) {
          currentX += nums[i];
          currentY += nums[i + 1];
          shape.lineTo(currentX, currentY);
        }
        break;
      case 'H':
        for (const n of nums) {
          shape.lineTo(n, currentY);
          currentX = n;
        }
        break;
      case 'h':
        for (const n of nums) {
          currentX += n;
          shape.lineTo(currentX, currentY);
        }
        break;
      case 'V':
        for (const n of nums) {
          shape.lineTo(currentX, n);
          currentY = n;
        }
        break;
      case 'v':
        for (const n of nums) {
          currentY += n;
          shape.lineTo(currentX, currentY);
        }
        break;
      case 'C':
        for (let i = 0; i < nums.length - 4; i += 6) {
          shape.bezierCurveTo(
            nums[i], nums[i + 1],
            nums[i + 2], nums[i + 3],
            nums[i + 4], nums[i + 5]
          );
          currentX = nums[i + 4];
          currentY = nums[i + 5];
        }
        break;
      case 'c':
        for (let i = 0; i < nums.length - 4; i += 6) {
          shape.bezierCurveTo(
            currentX + nums[i], currentY + nums[i + 1],
            currentX + nums[i + 2], currentY + nums[i + 3],
            currentX + nums[i + 4], currentY + nums[i + 5]
          );
          currentX += nums[i + 4];
          currentY += nums[i + 5];
        }
        break;
      case 'Q':
        for (let i = 0; i < nums.length - 2; i += 4) {
          shape.quadraticCurveTo(
            nums[i], nums[i + 1],
            nums[i + 2], nums[i + 3]
          );
          currentX = nums[i + 2];
          currentY = nums[i + 3];
        }
        break;
      case 'q':
        for (let i = 0; i < nums.length - 2; i += 4) {
          shape.quadraticCurveTo(
            currentX + nums[i], currentY + nums[i + 1],
            currentX + nums[i + 2], currentY + nums[i + 3]
          );
          currentX += nums[i + 2];
          currentY += nums[i + 3];
        }
        break;
      case 'Z':
      case 'z':
        shape.lineTo(startX, startY);
        currentX = startX;
        currentY = startY;
        break;
      case 'A':
      case 'a':
        // Arc - approximate with lines
        if (nums.length >= 7) {
          const ex = type === 'A' ? nums[5] : currentX + nums[5];
          const ey = type === 'A' ? nums[6] : currentY + nums[6];
          shape.lineTo(ex, ey);
          currentX = ex;
          currentY = ey;
        }
        break;
    }
  }

  return shape;
}

// Parse SVG and extract paths with colors
function parseSVG(svgContent: string): { paths: { d: string; fill: string }[]; viewBox: { x: number; y: number; width: number; height: number } } {
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

  const paths: { d: string; fill: string }[] = [];

  // Get all path elements
  const pathElements = doc.querySelectorAll('path');
  pathElements.forEach((path) => {
    const d = path.getAttribute('d');
    if (d) {
      let fill = path.getAttribute('fill') || '#000000';
      if (fill === 'none') fill = '#000000';
      
      // Check for class-based fill
      const className = path.getAttribute('class');
      if (className) {
        const styleMatch = svgContent.match(new RegExp(`\\.${className}\\s*\\{[^}]*fill:\\s*([^;\\s]+)`));
        if (styleMatch) fill = styleMatch[1];
      }
      
      // Note: path transforms are complex to apply to d attribute
      // For now we'll rely on the shape being positioned correctly
      // Complex transforms would need a full SVG path transform library
      
      paths.push({ d, fill });
    }
  });

  // Helper: parse transform attribute
  function parseTransform(transformStr: string): { tx: number; ty: number; rotate: number; sx: number; sy: number } {
    const result = { tx: 0, ty: 0, rotate: 0, sx: 1, sy: 1 };
    if (!transformStr) return result;
    
    const translateMatch = transformStr.match(/translate\(([^)]+)\)/);
    if (translateMatch) {
      const parts = translateMatch[1].split(/[\s,]+/).map(Number);
      result.tx = parts[0] || 0;
      result.ty = parts[1] || 0;
    }
    
    const rotateMatch = transformStr.match(/rotate\(([^)]+)\)/);
    if (rotateMatch) {
      result.rotate = parseFloat(rotateMatch[1]) || 0;
    }
    
    const scaleMatch = transformStr.match(/scale\(([^)]+)\)/);
    if (scaleMatch) {
      const parts = scaleMatch[1].split(/[\s,]+/).map(Number);
      result.sx = parts[0] || 1;
      result.sy = parts[1] || parts[0] || 1;
    }
    
    return result;
  }

  // Helper: apply transform to point
  function applyTransform(x: number, y: number, transform: { tx: number; ty: number; rotate: number; sx: number; sy: number }): { x: number; y: number } {
    // Scale
    let nx = x * transform.sx;
    let ny = y * transform.sy;
    
    // Rotate (around origin)
    if (transform.rotate !== 0) {
      const rad = (transform.rotate * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const rx = nx * cos - ny * sin;
      const ry = nx * sin + ny * cos;
      nx = rx;
      ny = ry;
    }
    
    // Translate
    nx += transform.tx;
    ny += transform.ty;
    
    return { x: nx, y: ny };
  }

  // Get all rect elements
  const rectElements = doc.querySelectorAll('rect');
  rectElements.forEach((rect) => {
    const x = parseFloat(rect.getAttribute('x') || '0');
    const y = parseFloat(rect.getAttribute('y') || '0');
    const w = parseFloat(rect.getAttribute('width') || '0');
    const h = parseFloat(rect.getAttribute('height') || '0');
    if (w > 0 && h > 0) {
      const transform = parseTransform(rect.getAttribute('transform') || '');
      
      // Create rect corners
      const corners = [
        { x: x, y: y },
        { x: x + w, y: y },
        { x: x + w, y: y + h },
        { x: x, y: y + h },
      ];
      
      // Apply transform to corners
      const transformedCorners = corners.map(c => applyTransform(c.x, c.y, transform));
      
      // Create path from transformed corners
      const d = `M${transformedCorners[0].x},${transformedCorners[0].y} L${transformedCorners[1].x},${transformedCorners[1].y} L${transformedCorners[2].x},${transformedCorners[2].y} L${transformedCorners[3].x},${transformedCorners[3].y} Z`;
      
      let fill = rect.getAttribute('fill') || '#000000';
      if (fill === 'none') fill = '#000000';
      
      // Check for class-based fill
      const className = rect.getAttribute('class');
      if (className) {
        const styleMatch = svgContent.match(new RegExp(`\\.${className}\\s*\\{[^}]*fill:\\s*([^;\\s]+)`));
        if (styleMatch) fill = styleMatch[1];
      }
      
      paths.push({ d, fill });
    }
  });

  // Get all circle elements
  const circleElements = doc.querySelectorAll('circle');
  circleElements.forEach((circle) => {
    const cx = parseFloat(circle.getAttribute('cx') || '0');
    const cy = parseFloat(circle.getAttribute('cy') || '0');
    const r = parseFloat(circle.getAttribute('r') || '0');
    if (r > 0) {
      // Approximate circle with bezier curves
      const k = r * 0.5523;
      const d = `M${cx-r},${cy} C${cx-r},${cy-k} ${cx-k},${cy-r} ${cx},${cy-r} C${cx+k},${cy-r} ${cx+r},${cy-k} ${cx+r},${cy} C${cx+r},${cy+k} ${cx+k},${cy+r} ${cx},${cy+r} C${cx-k},${cy+r} ${cx-r},${cy+k} ${cx-r},${cy} Z`;
      let fill = circle.getAttribute('fill') || '#000000';
      if (fill === 'none') fill = '#000000';
      paths.push({ d, fill });
    }
  });

  return { paths, viewBox };
}

// Convert hex color to THREE.Color
function hexToColor(hex: string): any {
  try {
    return new THREE.Color(hex);
  } catch {
    return new THREE.Color('#8B5CF6');
  }
}

export default function SVGToThree({ svgContent, depth = 40, bevelEnabled = true }: SVGToThreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any | null>(null);
  const cameraRef = useRef<any | null>(null);
  const rendererRef = useRef<any | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<any | null>(null);
  const animationRef = useRef<number>(0);

  const [autoRotate, setAutoRotate] = useState(true);
  const [stats, setStats] = useState({ paths: 0, meshes: 0, triangles: 0 });

  // Build 3D scene
  useEffect(() => {
    if (!containerRef.current || !svgContent) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 400;

    // Clean up previous
    if (rendererRef.current) {
      const domElement = rendererRef.current.domElement;
      if (domElement && domElement.parentNode === container) {
        container.removeChild(domElement);
      }
      rendererRef.current.dispose();
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1a1a2e');
    sceneRef.current = scene;

    // Camera - angle that shows 3D depth
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
    camera.position.set(150, 150, 300);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
    controlsRef.current = controls;

    // === LIGHTING ===
    // Ambient light for base visibility
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    // Main directional light from top-right
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(200, 300, 200);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Fill light from left
    const fillLight = new THREE.DirectionalLight(0x8B5CF6, 0.4);
    fillLight.position.set(-200, 100, 100);
    scene.add(fillLight);

    // Rim light from behind
    const rimLight = new THREE.DirectionalLight(0xA78BFA, 0.3);
    rimLight.position.set(0, 100, -200);
    scene.add(rimLight);

    // === GROUND GRID ===
    const gridHelper = new THREE.GridHelper(500, 20, 0x444466, 0x333355);
    gridHelper.position.y = -1;
    scene.add(gridHelper);

    // Ground plane (semi-transparent for shadow)
    const groundGeo = new THREE.PlaneGeometry(500, 500);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      transparent: true,
      opacity: 0.8,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true;
    scene.add(ground);

    // === PARSE SVG & BUILD 3D MODEL ===
    const { paths, viewBox } = parseSVG(svgContent);
    console.log('SVG parsed:', paths.length, 'paths');

    const modelGroup = new THREE.Group();

    if (paths.length > 0) {
      // Calculate center and scale
      const centerX = viewBox.x + viewBox.width / 2;
      const centerY = viewBox.y + viewBox.height / 2;
      const maxSize = Math.max(viewBox.width, viewBox.height);
      const scale = 200 / maxSize; // Scale to fit in 200 units

      let meshCount = 0;
      let totalTriangles = 0;

      paths.forEach(({ d, fill }) => {
        const shape = parseSVGPath(d);
        if (!shape) return;

        // Center the shape
        const centeredShape = new THREE.Shape();
        const points = shape.getPoints(50);
        if (points.length < 3) return;

        centeredShape.moveTo(
          (points[0].x - centerX) * scale,
          -(points[0].y - centerY) * scale // Flip Y
        );
        for (let i = 1; i < points.length; i++) {
          centeredShape.lineTo(
            (points[i].x - centerX) * scale,
            -(points[i].y - centerY) * scale
          );
        }

        // Extrude settings - REAL 3D depth
        const extrudeSettings: any = {
          depth: depth, // Real depth in units
          bevelEnabled: bevelEnabled,
          bevelThickness: depth * 0.15,
          bevelSize: depth * 0.1,
          bevelSegments: 3,
          steps: 1,
        };

        const geometry = new THREE.ExtrudeGeometry(centeredShape, extrudeSettings);
        
        // Material with the SVG fill color
        const material = new THREE.MeshStandardMaterial({
          color: hexToColor(fill),
          roughness: 0.3,
          metalness: 0.1,
          side: THREE.DoubleSide,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Lay flat (extrude along Z, then rotate to be horizontal)
        mesh.rotation.x = -Math.PI / 2;
        // Center vertically
        mesh.position.y = 0;

        modelGroup.add(mesh);
        meshCount++;
        totalTriangles += geometry.attributes.position.count / 3;
      });

      console.log(`Created ${meshCount} meshes, ~${totalTriangles} triangles`);
      setStats({ paths: paths.length, meshes: meshCount, triangles: Math.round(totalTriangles) });
    }

    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // Fit camera to model
    const box = new THREE.Box3().setFromObject(modelGroup);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / (2 * Math.tan(fov / 2)));
    cameraZ *= 2; // Pull back for better perspective
    camera.position.set(cameraZ * 0.7, cameraZ * 0.7, cameraZ);
    camera.lookAt(center);
    controls.target.copy(center);
    controls.update();

    // === ANIMATION LOOP ===
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight || 400;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [svgContent, depth, bevelEnabled]);

  // Toggle auto-rotate
  const toggleAutoRotate = useCallback(() => {
    setAutoRotate(prev => {
      const next = !prev;
      if (controlsRef.current) {
        controlsRef.current.autoRotate = next;
      }
      return next;
    });
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
          onClick={handleExportGLTF}
          className="px-4 py-2 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 transition-all"
        >
          📥 Unduh GLTF (.glb)
        </button>

        <button
          onClick={handleExportOBJ}
          className="px-4 py-2 rounded-xl font-semibold text-sm bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all"
        >
          📥 Unduh OBJ
        </button>

        <span className="text-xs text-slate-500 ml-auto">
          GLTF: web & viewer | OBJ: 3D printing
        </span>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs text-slate-400">
        <span>📐 {stats.paths} paths</span>
        <span>🧊 {stats.meshes} meshes</span>
        <span>🔺 {stats.triangles.toLocaleString()} triangles</span>
      </div>

      {/* 3D Viewport */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-700/50">
        <div
          ref={containerRef}
          className="w-full bg-[#1a1a2e]"
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
