import { ColorPalette, Industry } from './types';

export const COLOR_PALETTES: Record<string, ColorPalette> = {
  default: {
    id: 'default',
    name: 'Midnight',
    primary: '#7C3AED',
    secondary: '#A78BFA',
    accent: '#F59E0B',
    background: '#0F172A',
  },
  cafe: {
    id: 'cafe',
    name: 'Espresso',
    primary: '#D97706',
    secondary: '#92400E',
    accent: '#FDE68A',
    background: '#1C1917',
  },
  fashion: {
    id: 'fashion',
    name: 'Noir Rose',
    primary: '#EC4899',
    secondary: '#F9A8D4',
    accent: '#BE185D',
    background: '#18181B',
  },
  tech: {
    id: 'tech',
    name: 'Electric',
    primary: '#06B6D4',
    secondary: '#0EA5E9',
    accent: '#22D3EE',
    background: '#0C0C1E',
  },
  real_estate: {
    id: 'real_estate',
    name: 'Prestige',
    primary: '#B45309',
    secondary: '#D97706',
    accent: '#FCD34D',
    background: '#0C0A09',
  },
  bali_tourism: {
    id: 'bali_tourism',
    name: 'Tropical',
    primary: '#059669',
    secondary: '#10B981',
    accent: '#F59E0B',
    background: '#052E16',
  },
  food: {
    id: 'food',
    name: 'Crisp',
    primary: '#DC2626',
    secondary: '#F87171',
    accent: '#FDE047',
    background: '#1C1917',
  },
  education: {
    id: 'education',
    name: 'Scholar',
    primary: '#2563EB',
    secondary: '#60A5FA',
    accent: '#93C5FD',
    background: '#0F172A',
  },
  health: {
    id: 'health',
    name: 'Vitality',
    primary: '#10B981',
    secondary: '#34D399',
    accent: '#6EE7B7',
    background: '#022C22',
  },
};

export function getPaletteForIndustry(industry: Industry): ColorPalette {
  const map: Record<Industry, string> = {
    cafe: 'cafe',
    fashion: 'fashion',
    tech: 'tech',
    real_estate: 'real_estate',
    bali_tourism: 'bali_tourism',
    food: 'food',
    education: 'education',
    health: 'health',
  };
  return COLOR_PALETTES[map[industry] || 'default'];
}

export const ALL_PALETTES = Object.values(COLOR_PALETTES);