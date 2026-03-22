import { generateFilter } from './filter-templates.js';

export type StylePreset = 'flat' | 'isometric' | 'line-art' | 'watercolor' | 'retro' | 'minimalist';

export interface StyleRule {
  fill?: string | null;
  stroke?: string | null;
  strokeWidth?: number | null;
  opacity?: number;
  filter?: string | null;
  transform?: string | null;
}

export interface PresetResult {
  rules: StyleRule;
  filters?: string[];
  description: string;
}

export function getPresetRules(preset: StylePreset): PresetResult {
  switch (preset) {
    case 'flat':
      return buildFlat();
    case 'isometric':
      return buildIsometric();
    case 'line-art':
      return buildLineArt();
    case 'watercolor':
      return buildWatercolor();
    case 'retro':
      return buildRetro();
    case 'minimalist':
      return buildMinimalist();
  }
}

function buildFlat(): PresetResult {
  return {
    rules: {
      fill: '#4A90D9',
      stroke: null,
      strokeWidth: null,
      opacity: 1,
      filter: null,
    },
    description:
      'Flat design: removes gradients and filters in favor of bold, solid fills with clean edges. ' +
      'Apply solid colors from a cohesive palette. Remove all stroke effects and filters for a modern look.',
  };
}

function buildIsometric(): PresetResult {
  return {
    rules: {
      fill: '#5B9BD5',
      stroke: '#3A6FA0',
      strokeWidth: 1,
      opacity: 1,
      transform: 'matrix(0.866, 0.5, -0.866, 0.5, 0, 0)',
    },
    description:
      'Isometric projection: applies a skew transform to simulate 3D on a 2D plane. ' +
      'Use three-face shading (top light, left mid, right dark) for depth. ' +
      'Recommended face colors: top #5B9BD5, left #4178A4, right #2D5F7A.',
  };
}

function buildLineArt(): PresetResult {
  return {
    rules: {
      fill: null,
      stroke: '#333333',
      strokeWidth: 2,
      opacity: 1,
      filter: null,
    },
    description:
      'Line art: removes all fills and applies uniform dark strokes. ' +
      'Creates a hand-drawn or blueprint aesthetic with clean outlines and no color fills.',
  };
}

function buildWatercolor(): PresetResult {
  const wcFilter = generateFilter('watercolor', { displacement: 18, blur: 3 }, 'preset');
  const paperFilter = generateFilter('paper', { frequency: 0.04, intensity: 0.12 }, 'preset');

  return {
    rules: {
      opacity: 0.75,
      filter: `url(#${wcFilter.filterId})`,
    },
    filters: [wcFilter.filterSvg, paperFilter.filterSvg],
    description:
      'Watercolor style: applies displacement and blur filters to simulate paint bleeding. ' +
      'Reduces opacity for translucent washes and adds a paper texture overlay. ' +
      'Apply the watercolor filter to content layers and paper texture to the background.',
  };
}

function buildRetro(): PresetResult {
  const grainFilter = generateFilter(
    'noise-texture',
    { frequency: 0.7, octaves: 4, type: 'fractalNoise' },
    'preset',
  );

  return {
    rules: {
      fill: '#D4A574',
      stroke: '#8B6914',
      strokeWidth: 1.5,
      opacity: 0.9,
      filter: `url(#${grainFilter.filterId})`,
    },
    filters: [grainFilter.filterSvg],
    description:
      'Retro style: muted warm palette with sepia tones and film grain overlay. ' +
      'Use warm, desaturated colors (burnt sienna, dusty rose, olive, mustard). ' +
      'Recommended palette: #D4A574, #C47A5A, #8B6914, #6B7B3A, #A0522D.',
  };
}

function buildMinimalist(): PresetResult {
  return {
    rules: {
      stroke: '#222222',
      strokeWidth: 1.5,
      opacity: 1,
      filter: null,
    },
    description:
      'Minimalist: strips away decorative elements to focus on essential forms. ' +
      'Use maximum 2-3 colors, thin precise strokes, ample whitespace, and high contrast. ' +
      'Remove shadows, gradients, textures, and any non-essential visual elements.',
  };
}
