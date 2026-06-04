export type Industry =
  | 'cafe'
  | 'fashion'
  | 'tech'
  | 'real_estate'
  | 'bali_tourism'
  | 'food'
  | 'education'
  | 'health';

export type LogoStyle = 'minimal' | 'modern' | 'playful' | 'elegant' | 'bold';

export type LogoVariant = 'icon-only' | 'wordmark' | 'stacked' | 'horizontal';

export type DesignPattern =
  | 'dot-matrix'
  | 'geometric-shapes'
  | 'line-system'
  | 'node-network'
  | 'dots-shapes'
  | 'dots-lines'
  | 'shapes-lines';

export interface ColorPalette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

export interface IndustryConfig {
  id: Industry;
  name: string;
  icon: string;
  description: string;
  suggestedPatterns: DesignPattern[];
  suggestedStyles: LogoStyle[];
}

export interface LogoConfig {
  brandName: string;
  industry: Industry;
  colorPalette: ColorPalette;
  style: LogoStyle;
  variant: LogoVariant;
  pattern: DesignPattern;
}

export interface GeneratedLogo {
  config: LogoConfig;
  svgContent: string;
  previewColor: string;
}