import { LogoConfig, LogoVariant } from './types';
import { generatePattern } from './patterns';

/**
 * Main logo generation engine
 * Generates complete SVG strings based on configuration
 */
export function generateLogo(config: LogoConfig): string {
  const { brandName, colorPalette, style, variant, pattern } = config;
  const { primary, secondary } = colorPalette;

  const patternSvg = generatePattern(pattern, primary, style);

  switch (variant) {
    case 'icon-only':
      return generateIconOnly(patternSvg, primary);
    case 'wordmark':
      return generateWordmark(brandName, patternSvg, primary, secondary, style);
    case 'stacked':
      return generateStacked(brandName, patternSvg, primary, secondary, style);
    case 'horizontal':
      return generateHorizontal(brandName, patternSvg, primary, secondary, style);
    default:
      return generateIconOnly(patternSvg, primary);
  }
}

function generateIconOnly(patternSvg: string, primary: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="transparent"/>
  ${patternSvg}
</svg>`;
}

function generateWordmark(
  name: string,
  patternSvg: string,
  primary: string,
  secondary: string,
  style: string
): string {
  const fontSize = name.length > 10 ? 14 : name.length > 6 ? 18 : 24;
  const fontWeight = style === 'bold' ? 800 : style === 'elegant' ? 300 : 600;
  const letterSpacing = style === 'elegant' ? '0.2em' : style === 'minimal' ? '0.15em' : '0.05em';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100">
  <rect width="300" height="100" fill="transparent"/>
  <g transform="translate(15, 10) scale(0.8)">
    ${patternSvg}
  </g>
  <text x="150" y="60" text-anchor="middle"
    font-family="'Inter', 'Helvetica Neue', sans-serif"
    font-size="${fontSize}" font-weight="${fontWeight}" fill="${primary}"
    letter-spacing="${letterSpacing}">
    ${escapeXml(name.toUpperCase())}
  </text>
  ${style !== 'minimal' ? `<line x1="${150 - name.length * 5}" y1="70" x2="${150 + name.length * 5}" y2="70" stroke="${secondary}" stroke-width="0.5" opacity="0.5"/>` : ''}
</svg>`;
}

function generateStacked(
  name: string,
  patternSvg: string,
  primary: string,
  secondary: string,
  style: string
): string {
  const fontSize = name.length > 12 ? 12 : name.length > 8 ? 16 : 22;
  const fontWeight = style === 'bold' ? 800 : style === 'elegant' ? 300 : 600;
  const letterSpacing = style === 'elegant' ? '0.2em' : '0.08em';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 250">
  <rect width="200" height="250" fill="transparent"/>
  <g transform="translate(50, 10) scale(1)">
    ${patternSvg}
  </g>
  <text x="100" y="130" text-anchor="middle"
    font-family="'Inter', 'Helvetica Neue', sans-serif"
    font-size="${fontSize}" font-weight="${fontWeight}" fill="${primary}"
    letter-spacing="${letterSpacing}">
    ${escapeXml(name.toUpperCase())}
  </text>
  <line x1="60" y1="145" x2="140" y2="145" stroke="${secondary}" stroke-width="1" opacity="0.4"/>
</svg>`;
}

function generateHorizontal(
  name: string,
  patternSvg: string,
  primary: string,
  secondary: string,
  style: string
): string {
  const fontSize = name.length > 12 ? 14 : 20;
  const fontWeight = style === 'bold' ? 800 : style === 'elegant' ? 300 : 600;
  const letterSpacing = style === 'elegant' ? '0.15em' : '0.05em';
  const nameWidth = name.length * (fontSize * 0.6);
  const totalWidth = 100 + nameWidth + 60;
  const textX = 130;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} 100">
  <rect width="${totalWidth}" height="100" fill="transparent"/>
  <g transform="translate(5, 10) scale(0.8)">
    ${patternSvg}
  </g>
  <line x1="100" y1="25" x2="100" y2="75" stroke="${secondary}" stroke-width="1" opacity="0.3"/>
  <text x="${textX}" y="58"
    font-family="'Inter', 'Helvetica Neue', sans-serif"
    font-size="${fontSize}" font-weight="${fontWeight}" fill="${primary}"
    letter-spacing="${letterSpacing}">
    ${escapeXml(name.toUpperCase())}
  </text>
</svg>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function downloadSvg(svgContent: string, filename: string): void {
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadPng(svgContent: string, filename: string, size: number = 1024): void {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new Image();
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  img.onload = () => {
    ctx.fillStyle = 'transparent';
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0, size, size);
    URL.revokeObjectURL(url);

    canvas.toBlob((pngBlob) => {
      if (!pngBlob) return;
      const pngUrl = URL.createObjectURL(pngBlob);
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `${filename}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(pngUrl);
    }, 'image/png');
  };
  img.src = url;
}
