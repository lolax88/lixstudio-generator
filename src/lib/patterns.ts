import { DesignPattern, LogoStyle } from './types';

/**
 * SVG Pattern Generators
 * Each function returns SVG inner elements (within viewBox 0 0 100 100)
 */

// Helper to generate concentric ring dots
function concentricDots(color: string, _style: LogoStyle): string {
  const rings = [
    { count: 6, radius: 15, dotSize: 3 },
    { count: 12, radius: 25, dotSize: 2.5 },
    { count: 18, radius: 35, dotSize: 2 },
  ];
  let dots = '';
  for (const ring of rings) {
    for (let i = 0; i < ring.count; i++) {
      const angle = (2 * Math.PI * i) / ring.count - Math.PI / 2;
      const cx = 50 + ring.radius * Math.cos(angle);
      const cy = 50 + ring.radius * Math.sin(angle);
      dots += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${ring.dotSize}" fill="${color}"/>`;
    }
  }
  return `<g>${dots}</g>`;
}

// Grid dot matrix pattern
function gridDots(color: string, style: LogoStyle): string {
  const gridSize = style === 'bold' ? 5 : 6;
  const dotSize = style === 'bold' ? 4 : style === 'minimal' ? 2.5 : 3;
  const spacing = 70 / gridSize;
  const offset = 50 - (gridSize * spacing) / 2 + spacing / 2;
  let dots = '';

  // Create an interesting pattern - remove some dots for visual interest
  const pattern = getDotPattern(style);
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (pattern[row]?.[col] === 1) {
        const cx = offset + col * spacing;
        const cy = offset + row * spacing;
        dots += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${dotSize}" fill="${color}"/>`;
      }
    }
  }
  return `<g>${dots}</g>`;
}

function getDotPattern(_style: LogoStyle): number[][] {
  // Patterns that create interesting shapes
  const patterns = [
    [
      [0, 1, 1, 1, 0],
      [1, 0, 0, 0, 1],
      [1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1],
      [0, 1, 1, 1, 0],
    ],
    [
      [1, 1, 1, 1, 0],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 0],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
    ],
    [
      [0, 0, 1, 0, 0],
      [0, 1, 0, 1, 0],
      [1, 0, 0, 0, 1],
      [0, 1, 0, 1, 0],
      [0, 0, 1, 0, 0],
    ],
    [
      [1, 0, 0, 0, 1],
      [0, 1, 0, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 0, 1, 0],
      [1, 0, 0, 0, 1],
    ],
  ];
  // Use a deterministic pattern based on style
  const index = _style === 'minimal' ? 2 : _style === 'bold' ? 0 : _style === 'playful' ? 3 : 1;
  return patterns[index % patterns.length];
}

// Honeycomb hexagon dots
function hexagonDots(color: string, _style: LogoStyle): string {
  const hexSize = 6;
  let shapes = '';
  const rows = 5;
  const cols = 5;
  const w = hexSize * 2;
  const h = Math.sqrt(3) * hexSize;
  const startX = 50 - ((cols - 1) * w * 0.75) / 2;
  const startY = 50 - ((rows - 1) * h) / 2;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = startX + col * w * 0.75;
      const cy = startY + row * h + (col % 2 === 1 ? h / 2 : 0);
      const points = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        points.push(`${(cx + hexSize * Math.cos(angle)).toFixed(1)},${(cy + hexSize * Math.sin(angle)).toFixed(1)}`);
      }
      // Create some visual variation
      if ((row + col) % 3 !== 0) {
        shapes += `<polygon points="${points.join(' ')}" fill="${color}" opacity="${row === 2 && col === 2 ? 1 : 0.7}"/>`;
      }
    }
  }
  return `<g>${shapes}</g>`;
}

// Geometric patterns
function concentricCircles(color: string, style: LogoStyle): string {
  const strokeW = style === 'bold' ? 3.5 : style === 'minimal' ? 1.5 : 2.5;
  const rings = style === 'minimal' ? 3 : style === 'bold' ? 4 : 3;
  let shapes = '';
  for (let i = rings; i >= 1; i--) {
    const r = 10 + i * 10;
    shapes += `<circle cx="50" cy="50" r="${r}" fill="none" stroke="${color}" stroke-width="${strokeW}"/>`;
  }
  shapes += `<circle cx="50" cy="50" r="${style === 'bold' ? 6 : 4}" fill="${color}"/>`;
  return `<g>${shapes}</g>`;
}

function intersectingShapes(color: string, style: LogoStyle): string {
  const strokeW = style === 'bold' ? 3 : 2;
  return `<g>
    <circle cx="38" cy="50" r="22" fill="none" stroke="${color}" stroke-width="${strokeW}"/>
    <circle cx="62" cy="50" r="22" fill="none" stroke="${color}" stroke-width="${strokeW}"/>
    <circle cx="50" cy="34" r="22" fill="none" stroke="${color}" stroke-width="${strokeW}"/>
    ${style !== 'minimal' ? `<circle cx="50" cy="50" r="8" fill="${color}" opacity="0.3"/>` : ''}
  </g>`;
}

function nestedPolygons(color: string, style: LogoStyle): string {
  const strokeW = style === 'bold' ? 3 : style === 'minimal' ? 1.5 : 2;
  function hexPoints(cx: number, cy: number, r: number): string {
    return Array.from({ length: 6 }, (_, i) => {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`;
    }).join(' ');
  }
  return `<g fill="none" stroke="${color}" stroke-width="${strokeW}">
    <polygon points="${hexPoints(50, 50, 35)}"/>
    <polygon points="${hexPoints(50, 50, 25)}" transform="rotate(30, 50, 50)"/>
    <polygon points="${hexPoints(50, 50, 15)}"/>
    <polygon points="${hexPoints(50, 50, 6)}" fill="${color}" stroke="none"/>
  </g>`;
}

function arcSegments(color: string, style: LogoStyle): string {
  const strokeW = style === 'bold' ? 4 : style === 'minimal' ? 2 : 3;
  return `<g fill="none" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round">
    <path d="M 50 15 A 35 35 0 1 1 15 50"/>
    <path d="M 85 50 A 35 35 0 1 1 50 85"/>
    <circle cx="50" cy="50" r="5" fill="${color}" stroke="none"/>
    <circle cx="50" cy="15" r="3" fill="${color}" stroke="none"/>
    <circle cx="15" cy="50" r="3" fill="${color}" stroke="none"/>
  </g>`;
}

// Line system patterns
function lineCircle(color: string, style: LogoStyle): string {
  const strokeW = style === 'bold' ? 2.5 : style === 'minimal' ? 1 : 1.5;
  const lines = style === 'minimal' ? 7 : style === 'bold' ? 12 : 10;
  const gap = 60 / (lines - 1);
  let linesSvg = '';
  for (let i = 0; i < lines; i++) {
    const y = 20 + i * gap;
    const thick = i === Math.floor(lines / 2) ? strokeW * 1.5 : strokeW;
    linesSvg += `<line x1="15" y1="${y.toFixed(1)}" x2="85" y2="${y.toFixed(1)}" stroke="${color}" stroke-width="${thick}" opacity="${Math.abs(i - lines / 2) < lines / 4 ? 1 : 0.4}"/>`;
  }
  return `<g>
    <defs><clipPath id="lcm"><circle cx="50" cy="50" r="32"/></clipPath></defs>
    <g clip-path="url(#lcm)" stroke-linecap="round">${linesSvg}</g>
    <circle cx="50" cy="50" r="35" fill="none" stroke="${color}" stroke-width="${strokeW * 0.6}" stroke-dasharray="2 4"/>
  </g>`;
}

function waveSystem(color: string, style: LogoStyle): string {
  const strokeW = style === 'bold' ? 3 : style === 'minimal' ? 1.5 : 2;
  const count = style === 'minimal' ? 3 : 5;
  let waves = '';
  for (let i = 0; i < count; i++) {
    const offset = (i - (count - 1) / 2) * 8;
    const amplitude = style === 'playful' ? 20 - Math.abs(offset) : 15 - Math.abs(offset) * 0.5;
    const opacity = 1 - Math.abs(i - (count - 1) / 2) * 0.2;
    waves += `<path d="M 15 ${50 + offset} Q 32 ${50 + offset - amplitude}, 50 ${50 + offset} T 85 ${50 + offset}" fill="none" stroke="${color}" stroke-width="${strokeW}" opacity="${opacity}" stroke-linecap="round"/>`;
  }
  return `<g>${waves}<circle cx="15" cy="50" r="3" fill="${color}"/><circle cx="85" cy="50" r="3" fill="${color}"/></g>`;
}

function spiralFibonacci(color: string, style: LogoStyle): string {
  const strokeW = style === 'bold' ? 3 : 2;
  return `<g fill="none" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round">
    <path d="M 50 50 A 5 5 0 0 1 55 50 A 8 8 0 0 1 55 58 A 13 13 0 0 1 42 58 A 21 21 0 0 1 42 37 A 34 34 0 0 1 76 37"/>
    <circle cx="50" cy="50" r="3" fill="${color}" stroke="none"/>
    ${style !== 'minimal' ? `<circle cx="76" cy="37" r="2" fill="${color}" stroke="none"/>
    <circle cx="42" cy="37" r="2" fill="${color}" stroke="none"/>` : ''}
  </g>`;
}

// Node network patterns
function nodeNetwork(color: string, style: LogoStyle): string {
  const strokeW = style === 'bold' ? 2.5 : 2;
  const nodes = [
    { x: 30, y: 70, r: 5, primary: true },
    { x: 50, y: 50, r: 7, primary: true },
    { x: 70, y: 30, r: 5, primary: true },
    { x: 35, y: 35, r: 2.5, primary: false },
    { x: 65, y: 55, r: 2, primary: false },
    { x: 20, y: 50, r: 2, primary: false },
    { x: 80, cy: 45, r: 2, primary: false },
  ];
  const edges = [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 3, to: 1 },
    { from: 0, to: 3 },
    { from: 1, to: 4 },
  ];
  let svg = '<g>';
  for (const edge of edges) {
    const n1 = nodes[edge.from]!;
    const n2 = nodes[edge.to]!;
    const midX = (n1.x + n2.x) / 2;
    const midY = (n1.y! + n2.y!) / 2 - 10;
    svg += `<path d="M ${n1.x} ${n1.y} Q ${midX} ${midY}, ${n2.x} ${n2.y}" stroke="${color}" stroke-width="${strokeW}" fill="none"/>`;
  }
  for (const node of nodes) {
    svg += `<circle cx="${node.x}" cy="${(node as any).cy || node.y}" r="${node.r}" fill="${color}" opacity="${node.primary ? 1 : 0.4}"/>`;
  }
  svg += '</g>';
  return svg;
}

function honeycombNetwork(color: string, style: LogoStyle): string {
  const strokeW = style === 'bold' ? 2.5 : 1.5;
  const nodes = [
    { x: 30, y: 35 }, { x: 50, y: 25 }, { x: 70, y: 35 },
    { x: 25, y: 55 }, { x: 50, y: 50 }, { x: 75, y: 55 },
    { x: 35, y: 72 }, { x: 50, y: 65 }, { x: 65, y: 72 },
  ];
  const edges = [
    [0, 1], [1, 2], [0, 3], [0, 4], [1, 4], [2, 4], [2, 5],
    [3, 6], [4, 7], [5, 8], [6, 7], [7, 8], [3, 4], [4, 5],
  ];
  let svg = '<g>';
  for (const [i, j] of edges) {
    svg += `<line x1="${nodes[i].x}" y1="${nodes[i].y}" x2="${nodes[j].x}" y2="${nodes[j].y}" stroke="${color}" stroke-width="${strokeW}" opacity="0.4"/>`;
  }
  for (let i = 0; i < nodes.length; i++) {
    const r = i === 4 ? 5 : 3;
    svg += `<circle cx="${nodes[i].x}" cy="${nodes[i].y}" r="${r}" fill="${color}"/>`;
  }
  svg += '</g>';
  return svg;
}

// Combination patterns
function dotsInShape(color: string, style: LogoStyle): string {
  const dotSize = style === 'bold' ? 3.5 : 2.5;
  const gridDotsArr: string[] = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cx = 20 + col * 7.5;
      const cy = 20 + row * 7.5;
      // Only inside circle radius 28
      const dx = cx - 50;
      const dy = cy - 50;
      if (dx * dx + dy * dy < 28 * 28) {
        gridDotsArr.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${dotSize}" fill="${color}"/>`);
      }
    }
  }
  return `<g>
    <defs><clipPath id="circle-clip"><circle cx="50" cy="50" r="30"/></clipPath></defs>
    <g clip-path="url(#circle-clip)" fill="${color}">
      ${gridDotsArr.join('\n      ')}
    </g>
    <circle cx="50" cy="50" r="30" fill="none" stroke="${color}" stroke-width="${style === 'bold' ? 2.5 : 1.5}"/>
  </g>`;
}

function dotsWithLines(color: string, style: LogoStyle): string {
  const dotR = style === 'bold' ? 4 : 3;
  const strokeW = style === 'bold' ? 2 : 1.5;
  const nodes = [
    { x: 25, y: 35 }, { x: 50, y: 25 }, { x: 75, y: 35 },
    { x: 30, y: 60 }, { x: 50, y: 50 }, { x: 70, y: 60 },
    { x: 40, y: 78 }, { x: 60, y: 78 },
  ];
  const lines = [[0, 1], [1, 2], [0, 3], [1, 4], [2, 5], [3, 6], [4, 7], [5, 7], [3, 4], [4, 5]];
  let svg = '<g>';
  for (const [i, j] of lines) {
    svg += `<line x1="${nodes[i].x}" y1="${nodes[i].y}" x2="${nodes[j].x}" y2="${nodes[j].y}" stroke="${color}" stroke-width="${strokeW}" opacity="0.5"/>`;
  }
  for (const node of nodes) {
    svg += `<circle cx="${node.x}" cy="${node.y}" r="${dotR}" fill="${color}"/>`;
  }
  svg += '</g>';
  return svg;
}

function shapeWithLines(color: string, style: LogoStyle): string {
  const strokeW = style === 'bold' ? 3 : 2;
  return `<g fill="none" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round">
    <polygon points="50,20 80,65 20,65"/>
    <line x1="35" y1="42.5" x2="65" y2="42.5" opacity="0.6"/>
    <line x1="27.5" y1="55" x2="72.5" y2="55" opacity="0.4"/>
    <circle cx="50" cy="42.5" r="3" fill="${color}" stroke="none"/>
  </g>`;
}

// Main pattern dispatcher
const PATTERN_GENERATORS: Record<DesignPattern, (color: string, style: LogoStyle) => string> = {
  'dot-matrix': (color, style) => {
    const patterns = [concentricDots, gridDots, hexagonDots];
    return patterns[Math.abs(hashCode(style)) % patterns.length](color, style);
  },
  'geometric-shapes': (color, style) => {
    const patterns = [concentricCircles, intersectingShapes, nestedPolygons, arcSegments];
    return patterns[Math.abs(hashCode(style + 'geo')) % patterns.length](color, style);
  },
  'line-system': (color, style) => {
    const patterns = [lineCircle, waveSystem, spiralFibonacci];
    return patterns[Math.abs(hashCode(style + 'line')) % patterns.length](color, style);
  },
  'node-network': (color, style) => {
    const patterns = [nodeNetwork, honeycombNetwork];
    return patterns[Math.abs(hashCode(style + 'node')) % patterns.length](color, style);
  },
  'dots-shapes': dotsInShape,
  'dots-lines': dotsWithLines,
  'shapes-lines': shapeWithLines,
};

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash;
}

export function generatePattern(pattern: DesignPattern, color: string, style: LogoStyle): string {
  return PATTERN_GENERATORS[pattern](color, style);
}

export const ALL_PATTERNS: DesignPattern[] = [
  'dot-matrix',
  'geometric-shapes',
  'line-system',
  'node-network',
  'dots-shapes',
  'dots-lines',
  'shapes-lines',
];

export function getPatternName(p: DesignPattern): string {
  const names: Record<DesignPattern, string> = {
    'dot-matrix': 'Dot Matrix',
    'geometric-shapes': 'Geometric Shapes',
    'line-system': 'Line System',
    'node-network': 'Node Network',
    'dots-shapes': 'Dots & Shapes',
    'dots-lines': 'Dots & Lines',
    'shapes-lines': 'Shapes & Lines',
  };
  return names[p];
}
