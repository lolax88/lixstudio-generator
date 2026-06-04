import { IndustryConfig, Industry } from './types';

export const INDUSTRIES: IndustryConfig[] = [
  {
    id: 'cafe',
    name: 'Cafe & Restaurant',
    icon: '☕',
    description: 'Warm, inviting designs for cafes, restaurants, and food spaces',
    suggestedPatterns: ['dot-matrix', 'geometric-shapes', 'dots-shapes'],
    suggestedStyles: ['elegant', 'playful', 'minimal'],
  },
  {
    id: 'fashion',
    name: 'Fashion & Beauty',
    icon: '👗',
    description: 'Sophisticated, stylish designs for fashion and beauty brands',
    suggestedPatterns: ['geometric-shapes', 'line-system', 'shapes-lines'],
    suggestedStyles: ['elegant', 'minimal', 'bold'],
  },
  {
    id: 'tech',
    name: 'Technology',
    icon: '💻',
    description: 'Clean, innovative designs for tech companies and startups',
    suggestedPatterns: ['node-network', 'dot-matrix', 'dots-lines'],
    suggestedStyles: ['modern', 'minimal', 'bold'],
  },
  {
    id: 'real_estate',
    name: 'Real Estate',
    icon: '🏠',
    description: 'Professional, trustworthy designs for real estate brands',
    suggestedPatterns: ['geometric-shapes', 'line-system', 'dots-shapes'],
    suggestedStyles: ['elegant', 'minimal', 'modern'],
  },
  {
    id: 'bali_tourism',
    name: 'Bali Tourism',
    icon: '🌴',
    description: 'Tropical, vibrant designs for tourism and travel',
    suggestedPatterns: ['dot-matrix', 'dots-shapes', 'shapes-lines'],
    suggestedStyles: ['playful', 'modern', 'elegant'],
  },
  {
    id: 'food',
    name: 'Food & Beverage',
    icon: '🍔',
    description: 'Appetizing, bold designs for food and beverage brands',
    suggestedPatterns: ['geometric-shapes', 'dot-matrix', 'dots-shapes'],
    suggestedStyles: ['bold', 'playful', 'modern'],
  },
  {
    id: 'education',
    name: 'Education',
    icon: '📚',
    description: 'Approachable, professional designs for education',
    suggestedPatterns: ['node-network', 'geometric-shapes', 'line-system'],
    suggestedStyles: ['modern', 'minimal', 'playful'],
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    icon: '💚',
    description: 'Calming, clean designs for health and wellness',
    suggestedPatterns: ['dot-matrix', 'geometric-shapes', 'line-system'],
    suggestedStyles: ['minimal', 'elegant', 'modern'],
  },
];

export function getIndustry(id: Industry): IndustryConfig {
  return INDUSTRIES.find((i) => i.id === id) || INDUSTRIES[0];
}