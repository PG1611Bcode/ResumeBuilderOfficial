// src/components/cvTemplates.js

export const popularTemplates = [
  {
    id: 'modern-clean',
    name: 'Modern Clean',
    tagline: 'High ATS Readability',
    badge: 'Most Popular',
    color: '#3b82f6',
    popularity: '98%',
    description: 'Single-column structure with clear section dividers and optimized typography for effortless ATS parsing.',
    features: [
      'Single-column linear layout',
      'High-contrast section headers',
      'Standard bulleted experience format',
      'ATS-tested machine readability'
    ],
    previewStyle: {
      fontFamily: 'Inter, sans-serif',
      accentColor: '#3b82f6',
      layoutType: 'single-column'
    }
  },
  {
    id: 'executive-pro',
    name: 'Executive Professional',
    tagline: 'Formal & Authoritative',
    badge: 'Executive',
    color: '#6366f1',
    popularity: '95%',
    description: 'Classic serif typography accents with structured header rules, designed for leadership, finance, and corporate management.',
    features: [
      'Refined serif typography',
      'Prominent executive summary box',
      'Formal timeline styling',
      'Balanced margins for senior profiles'
    ],
    previewStyle: {
      fontFamily: 'Georgia, serif',
      accentColor: '#6366f1',
      layoutType: 'executive'
    }
  },
  {
    id: 'tech-minimalist',
    name: 'Tech Minimalist',
    tagline: 'Project-First Hierarchy',
    badge: 'Engineering',
    color: '#10b981',
    popularity: '94%',
    description: 'Developer-oriented layout with monospace skill tags, technical project breakdown, and repository link highlights.',
    features: [
      'Monospace code & skill tags',
      'Featured projects & metrics first',
      'Compact contact & link banner',
      'Optimized for software & data roles'
    ],
    previewStyle: {
      fontFamily: 'ui-monospace, monospace',
      accentColor: '#10b981',
      layoutType: 'tech'
    }
  },
  {
    id: 'compact-ivy',
    name: 'Compact Ivy',
    tagline: 'Dense Academic / Engineering',
    badge: 'Ivy Standard',
    color: '#ec4899',
    popularity: '91%',
    description: 'Dense, strictly aligned single-page template inspired by Ivy League career services. Maximum information density without clutter.',
    features: [
      'Space-efficient horizontal rules',
      'Education and honors highlighted',
      'Compact single-page design',
      'Strict traditional formatting'
    ],
    previewStyle: {
      fontFamily: 'Times New Roman, serif',
      accentColor: '#ec4899',
      layoutType: 'compact'
    }
  }
];

export const cvTemplates = {
  'modern-clean': popularTemplates[0],
  'executive-pro': popularTemplates[1],
  'tech-minimalist': popularTemplates[2],
  'compact-ivy': popularTemplates[3],
  // Legacy aliases for backwards compatibility with existing saved records
  classic: {
    ...popularTemplates[1],
    id: 'classic',
    name: 'Classic Professional'
  },
  modern: {
    ...popularTemplates[0],
    id: 'modern',
    name: 'Modern Clean'
  },
  minimal: {
    ...popularTemplates[3],
    id: 'minimal',
    name: 'Compact Ivy'
  },
  technical: {
    ...popularTemplates[2],
    id: 'technical',
    name: 'Tech Minimalist'
  }
};